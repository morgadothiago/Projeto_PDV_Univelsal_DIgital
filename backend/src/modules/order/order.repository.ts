import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql, SQL } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { orders, Order, NewOrder } from '../../database/schema/orders';
import { orderItems, OrderItem, NewOrderItem } from '../../database/schema/order-items';
import { payments, Payment, NewPayment } from '../../database/schema/payments';
import { products } from '../../database/schema/products';
import { tenants, Tenant } from '../../database/schema/tenants';

export interface OrderWithDetails {
  order: Order;
  items: OrderItem[];
  payment: Payment | null;
}

export interface OrderListItem {
  order: Order;
  itemCount: number;
}

export interface OrderListResult {
  items: OrderListItem[];
  total: number;
}

export interface CreateOrderPayload {
  order: NewOrder;
  items: NewOrderItem[];
  payment: NewPayment;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  externalId?: string;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly dbService: DbService) {}

  async findById(id: string, tenantId: string): Promise<OrderWithDetails | undefined> {
    const orderResult = await this.dbService.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .limit(1);

    const order = orderResult[0];
    if (!order) return undefined;

    const [items, paymentResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id)),
      this.dbService.db
        .select()
        .from(payments)
        .where(eq(payments.orderId, id))
        .limit(1),
    ]);

    return { order, items, payment: paymentResult[0] ?? null };
  }

  async findByIdAnyTenant(id: string): Promise<Order | undefined> {
    const result = await this.dbService.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0];
  }

  async findAll(
    tenantId: string | null,
    page: number,
    limit: number,
    filters: {
      status?: string;
      cashierId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ): Promise<OrderListResult> {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = tenantId ? [eq(orders.tenantId, tenantId)] : [];

    if (filters.status) conditions.push(eq(orders.status, filters.status));
    if (filters.cashierId) conditions.push(eq(orders.cashierId, filters.cashierId));
    if (filters.dateFrom) conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conditions.push(lte(orders.createdAt, new Date(filters.dateTo)));

    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(whereClause),
    ]);

    const orderIds = rows.map((o) => o.id);
    let itemCountMap: Record<string, number> = {};

    if (orderIds.length > 0) {
      const countRows = await this.dbService.db
        .select({
          orderId: orderItems.orderId,
          count: sql<number>`count(*)::int`,
        })
        .from(orderItems)
        .where(
          sql`${orderItems.orderId} = ANY(ARRAY[${sql.join(
            orderIds.map((id) => sql`${id}`),
            sql`, `,
          )}]::text[])`,
        )
        .groupBy(orderItems.orderId);

      itemCountMap = Object.fromEntries(countRows.map((r) => [r.orderId, r.count]));
    }

    return {
      items: rows.map((order) => ({
        order,
        itemCount: itemCountMap[order.id] ?? 0,
      })),
      total: countResult[0]?.count ?? 0,
    };
  }

  async createOrderWithItemsAndPayment(payload: CreateOrderPayload): Promise<{
    order: Order;
    items: OrderItem[];
    payment: Payment;
  }> {
    // NeonHttpDatabase doesn't support transactions — run sequentially
    const [insertedOrder] = await this.dbService.db
      .insert(orders)
      .values(payload.order)
      .returning();

    const insertedItems = await this.dbService.db
      .insert(orderItems)
      .values(payload.items)
      .returning();

    const paymentValues: NewPayment = {
      ...payload.payment,
      pixQrCode: payload.pixQrCode ?? null,
      externalId: payload.externalId ?? null,
    };

    const [insertedPayment] = await this.dbService.db
      .insert(payments)
      .values(paymentValues)
      .returning();

    return {
      order: insertedOrder as Order,
      items: insertedItems as OrderItem[],
      payment: insertedPayment as Payment,
    };
  }

  async updatePaymentPixData(
    paymentId: string,
    pixQrCode: string,
    pixQrCodeBase64: string,
    externalId: string,
  ): Promise<void> {
    await this.dbService.db
      .update(payments)
      .set({ pixQrCode, externalId })
      .where(eq(payments.id, paymentId));
  }

  async cancelOrder(
    orderId: string,
    tenantId: string,
    restoreStock: boolean,
    items: OrderItem[],
    productUnitTypes: Record<string, string>,
  ): Promise<Order> {
    // NeonHttpDatabase doesn't support transactions — run sequentially
    const [updatedOrder] = await this.dbService.db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
      .returning();

    await this.dbService.db
      .update(payments)
      .set({ status: 'cancelled' })
      .where(eq(payments.orderId, orderId));

    if (restoreStock) {
      for (const item of items) {
        if (productUnitTypes[item.productId] === 'digital') continue;
        await this.dbService.db
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    return updatedOrder as Order;
  }

  async confirmCashOrder(
    orderId: string,
    tenantId: string,
    paymentId: string,
    deductStock: boolean,
    items: OrderItem[],
    productUnitTypes: Record<string, string>,
  ): Promise<Order> {
    // NeonHttpDatabase doesn't support transactions — run sequentially
    const now = new Date();

    const [updatedOrder] = await this.dbService.db
      .update(orders)
      .set({ status: 'confirmed', confirmedAt: now, updatedAt: now })
      .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
      .returning();

    await this.dbService.db
      .update(payments)
      .set({ status: 'confirmed', confirmedAt: now })
      .where(eq(payments.id, paymentId));

    if (deductStock) {
      for (const item of items) {
        if (productUnitTypes[item.productId] === 'digital') continue;
        await this.dbService.db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: now,
          })
          .where(eq(products.id, item.productId));
      }
    }

    return updatedOrder as Order;
  }

  async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.dbService.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async findTenantById(tenantId: string): Promise<Tenant | undefined> {
    const result = await this.dbService.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    return result[0];
  }

  async findProductUnitTypes(productIds: string[]): Promise<Record<string, string>> {
    if (productIds.length === 0) return {};
    const rows = await this.dbService.db
      .select({ id: products.id, unitType: products.unitType })
      .from(products)
      .where(
        sql`${products.id} = ANY(ARRAY[${sql.join(
          productIds.map((id) => sql`${id}`),
          sql`, `,
        )}]::text[])`,
      );
    return Object.fromEntries(rows.map((r) => [r.id, r.unitType]));
  }
}
