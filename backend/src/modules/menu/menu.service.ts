import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products } from '../../database/schema/products';
import { categories } from '../../database/schema/categories';
import { tenants } from '../../database/schema/tenants';
import { orders } from '../../database/schema/orders';
import { orderItems } from '../../database/schema/order-items';
import { payments } from '../../database/schema/payments';
import { CreateMenuOrderDto } from './dto/create-menu-order.dto';
import { EventsGateway } from '../events/events.gateway';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly eventsGateway: EventsGateway,
    private readonly paymentService: PaymentService,
  ) {}

  async getProducts(tenantId: string) {
    const rows = await this.dbService.db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        unitType: products.unitType,
        customUnit: products.customUnit,
        categoryId: products.categoryId,
        categoryName: categories.name,
        imageUrl: products.imageUrl,
        stock: products.stock,
        active: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(products.name);

    return {
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        price: Number(r.price),
        unitType: r.unitType,
        customUnit: r.customUnit ?? null,
        categoryId: r.categoryId ?? null,
        categoryName: r.categoryName ?? null,
        imageUrl: r.imageUrl ?? null,
        stock: Number(r.stock),
        active: r.active,
      })),
    };
  }

  async getCategories(tenantId: string) {
    return this.dbService.db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.tenantId, tenantId), eq(categories.isActive, true)))
      .orderBy(categories.name);
  }

  async getTenantInfo(tenantId: string) {
    const [tenant] = await this.dbService.db
      .select({
        id: tenants.id,
        name: tenants.name,
        type: tenants.type,
        settings: tenants.settings,
      })
      .from(tenants)
      .where(and(eq(tenants.id, tenantId), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Loja não encontrada ou inativa');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      type: tenant.type,
      settings: (tenant.settings as { logoUrl?: string; primaryColor?: string } | null) ?? {},
    };
  }

  async createOrder(tenantId: string, dto: CreateMenuOrderDto) {
    // 1. Validate tenant exists and is active
    const [tenant] = await this.dbService.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.id, tenantId), eq(tenants.isActive, true)))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Loja não encontrada ou inativa');
    }

    // 2. Validate all productIds belong to this tenant and are active
    const productIds = dto.items.map((item) => item.productId);
    const foundProducts = await this.dbService.db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.isActive, true),
          inArray(products.id, productIds),
        ),
      );

    if (foundProducts.length !== productIds.length) {
      const foundIds = new Set(foundProducts.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Produtos não encontrados ou inativos: ${missing.join(', ')}`,
      );
    }

    const productNameMap = new Map(foundProducts.map((p) => [p.id, p.name]));

    // 3. Calculate total from items (quantity * unitPrice)
    const total = dto.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    // 4. Insert order
    const orderId = crypto.randomUUID();
    await this.dbService.db.insert(orders).values({
      id: orderId,
      tenantId,
      cashierId: null,
      source: 'menu',
      status: 'pending',
      paymentMethod: dto.paymentMethod,
      total: total.toFixed(2),
      customerName: dto.customerName ?? null,
      customerPhone: dto.customerPhone ?? null,
      tableRef: dto.tableRef ?? null,
      notes: dto.notes ?? null,
    });

    // 5. Insert order items
    const itemInserts = dto.items.map((item) => ({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      productName: productNameMap.get(item.productId) ?? item.productId,
      unitPrice: item.unitPrice.toFixed(2),
      quantity: String(item.quantity),
      subtotal: (item.quantity * item.unitPrice).toFixed(2),
    }));

    await this.dbService.db.insert(orderItems).values(itemInserts);

    // 6. PIX payment — create payment record and attempt QR code generation
    let pixQrCode: string | null = null;
    let pixQrCodeBase64: string | null = null;

    if (dto.paymentMethod === 'pix') {
      const paymentId = crypto.randomUUID();

      await this.dbService.db.insert(payments).values({
        id: paymentId,
        tenantId,
        orderId,
        method: 'pix',
        amount: total.toFixed(2),
        status: 'awaiting_payment',
        pixQrCode: null,
        externalId: null,
        confirmedAt: null,
        createdAt: new Date(),
      });

      try {
        const pixResult = await this.paymentService.generatePixQrCode(orderId, total, tenantId);
        pixQrCode = pixResult.pixQrCode;
        pixQrCodeBase64 = pixResult.pixQrCodeBase64;

        await this.dbService.db
          .update(payments)
          .set({
            pixQrCode: pixResult.pixQrCode,
            externalId: pixResult.externalId,
          })
          .where(eq(payments.id, paymentId));
      } catch (err) {
        this.logger.warn(`Menu PIX generation failed for order ${orderId}`, err);
      }
    }

    // 7. Notify store_owner terminals via WebSocket
    const orderNumber = orderId.replace(/-/g, '').slice(-4).toUpperCase();
    this.eventsGateway.emitNewOrder(tenantId, {
      orderId,
      total: Number(total.toFixed(2)),
      cashierName: 'Cardápio Digital',
    });

    return {
      id: orderId,
      orderNumber,
      total: Number(total.toFixed(2)),
      status: 'pending',
      estimatedMinutes: 20,
      pixQrCode,
      pixQrCodeBase64,
    };
  }

  async getOrderStatus(tenantId: string, orderId: string): Promise<{ status: string; paymentStatus: string | null }> {
    const [order] = await this.dbService.db
      .select({ id: orders.id, status: orders.status, tenantId: orders.tenantId })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
      .limit(1);

    if (!order) throw new NotFoundException('Pedido não encontrado');

    const [payment] = await this.dbService.db
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return {
      status: order.status,
      paymentStatus: payment?.status ?? null,
    };
  }
}
