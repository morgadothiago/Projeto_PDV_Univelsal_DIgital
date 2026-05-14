import { Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { orders } from '../../database/schema/orders';
import { payments } from '../../database/schema/payments';
import { products } from '../../database/schema/products';
import { tenants } from '../../database/schema/tenants';
import { orderItems } from '../../database/schema/order-items';
import { NotificationService } from '../notification/notification.service';

export interface EfiBankPixWebhookBody {
  pix?: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    infoPagador?: string;
  }>;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly notificationService: NotificationService,
  ) {}

  async processEfiPixWebhook(body: EfiBankPixWebhookBody): Promise<void> {
    if (!body.pix || !Array.isArray(body.pix) || body.pix.length === 0) {
      this.logger.warn('Efi Bank webhook received without pix array — ignoring');
      return;
    }

    for (const pixItem of body.pix) {
      if (!pixItem.txid) {
        this.logger.warn('Efi Bank pix item missing txid — skipping');
        continue;
      }
      await this.confirmOrderFromWebhook(pixItem.txid);
    }
  }

  private async confirmOrderFromWebhook(txid: string): Promise<void> {
    // Look up payment by externalId (txid stored when the charge was created)
    const paymentResult = await this.dbService.db
      .select()
      .from(payments)
      .where(eq(payments.externalId, txid))
      .limit(1);

    const payment = paymentResult[0];
    if (!payment) {
      this.logger.warn(`Webhook: payment not found for txid ${txid}`);
      return;
    }

    const orderId = payment.orderId;

    const orderResult = await this.dbService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderResult[0];
    if (!order) {
      this.logger.warn(`Webhook: order ${orderId} not found (txid ${txid})`);
      return;
    }

    if (order.status === 'confirmed') {
      this.logger.log(
        `Webhook: order ${orderId} already confirmed — skipping (txid ${txid})`,
      );
      return;
    }

    const tenantResult = await this.dbService.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, order.tenantId))
      .limit(1);

    const tenant = tenantResult[0];

    const items = await this.dbService.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // NeonHttpDatabase does not support transactions — run sequentially
    const now = new Date();

    await this.dbService.db
      .update(orders)
      .set({ status: 'confirmed', confirmedAt: now, updatedAt: now })
      .where(eq(orders.id, orderId));

    await this.dbService.db
      .update(payments)
      .set({
        status: 'confirmed',
        confirmedAt: now,
        externalId: txid,
      })
      .where(eq(payments.id, payment.id));

    if (tenant?.stockEnabled) {
      const stockErrors: Array<{ productId: string; error: unknown }> = [];
      for (const item of items) {
        const productResult = await this.dbService.db
          .select({ unitType: products.unitType })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        const unitType = productResult[0]?.unitType;
        if (unitType === 'digital') continue;

        try {
          await this.dbService.db
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
              updatedAt: now,
            })
            .where(eq(products.id, item.productId));
        } catch (err) {
          stockErrors.push({ productId: item.productId, error: err });
          this.logger.error(
            `Webhook: stock deduction failed for product ${item.productId} on order ${orderId} — continuing`,
            err,
          );
        }
      }
      if (stockErrors.length > 0) {
        this.logger.warn(
          `Webhook: stock deduction completed with ${stockErrors.length} error(s) for order ${orderId}. ` +
            `Failed product IDs: ${stockErrors.map((e) => e.productId).join(', ')}`,
        );
      }
    }

    this.logger.log(
      `Webhook: order ${orderId} confirmed via Efi Bank txid ${txid}`,
    );

    if (order.customerEmail) {
      const receiptItems = items.map((item) => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
      }));

      this.notificationService.sendReceiptEmail({
        customerEmail: order.customerEmail,
        storeName: tenant?.name ?? 'Loja',
        orderId: order.id,
        items: receiptItems,
        total: Number(order.total),
        paymentMethod: order.paymentMethod ?? 'pix',
        confirmedAt: now,
      });
    }
  }
}
