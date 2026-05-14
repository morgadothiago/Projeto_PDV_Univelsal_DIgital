import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { orders } from '../../database/schema/orders';
import { payments } from '../../database/schema/payments';
import { products } from '../../database/schema/products';
import { tenants } from '../../database/schema/tenants';
import { orderItems } from '../../database/schema/order-items';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';

export interface MercadoPagoWebhookBody {
  type?: string;
  data?: { id?: string };
  action?: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly dbService: DbService,
    private readonly notificationService: NotificationService,
  ) {}

  validateMercadoPagoSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string,
  ): boolean {
    const secret = this.configService.get<string>('MP_WEBHOOK_SECRET');
    if (!secret) {
      // Only bypass signature validation in explicit test environments.
      // In all other environments reject the webhook to prevent spoofing.
      if (process.env['NODE_ENV'] === 'test') {
        return true;
      }
      this.logger.warn('MP_WEBHOOK_SECRET not configured — rejecting webhook to prevent spoofing');
      return false;
    }

    const parts = xSignature.split(',');
    let ts = '';
    let v1 = '';

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') v1 = value;
    }

    if (!ts || !v1) return false;

    const template = `id:${dataId};request-id:${xRequestId};ts:${ts}`;
    const computed = createHmac('sha256', secret).update(template).digest('hex');

    return computed === v1;
  }

  async processPaymentWebhook(
    body: MercadoPagoWebhookBody,
    xSignature: string,
    xRequestId: string,
  ): Promise<void> {
    const dataId = body.data?.id;

    if (!dataId) {
      this.logger.warn('Webhook received without data.id — ignoring');
      return;
    }

    const signatureValid = this.validateMercadoPagoSignature(
      xSignature,
      xRequestId,
      dataId,
    );

    if (!signatureValid) {
      this.logger.warn(`Invalid MP webhook signature for request-id: ${xRequestId}`);
      return;
    }

    if (body.type !== 'payment') {
      return;
    }

    let mpStatus: string;
    let externalReference: string | null | undefined;

    try {
      const result = await this.paymentService.fetchPaymentStatus(dataId);
      mpStatus = result.status;
      externalReference = result.externalReference;
    } catch (error) {
      this.logger.error(`Failed to fetch MP payment ${dataId}`, error);
      return;
    }

    if (mpStatus !== 'approved') {
      return;
    }

    if (!externalReference) {
      this.logger.warn(`MP payment ${dataId} approved but has no external_reference`);
      return;
    }

    await this.confirmOrderFromWebhook(externalReference, dataId);
  }

  private async confirmOrderFromWebhook(
    orderId: string,
    mpPaymentId: string,
  ): Promise<void> {
    const orderResult = await this.dbService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderResult[0];
    if (!order) {
      this.logger.warn(`Webhook: order ${orderId} not found`);
      return;
    }

    if (order.status === 'confirmed') {
      this.logger.log(`Webhook: order ${orderId} already confirmed — skipping`);
      return;
    }

    const paymentResult = await this.dbService.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    const payment = paymentResult[0];
    if (!payment) {
      this.logger.warn(`Webhook: payment not found for order ${orderId}`);
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

    // NeonHttpDatabase doesn't support transactions — run sequentially
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
        externalId: mpPaymentId,
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
          // Log and continue — partial deduction is better than full failure
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

    this.logger.log(`Webhook: order ${orderId} confirmed via MP payment ${mpPaymentId}`);

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
