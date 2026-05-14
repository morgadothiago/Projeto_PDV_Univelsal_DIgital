import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(OrderRepository.name);

  constructor(private readonly dbService: DbService) {}

  // Compensating rollback helper — deletes order and its items on failure.
  // NeonHttpDatabase has no native transaction support, so we clean up manually.
  // Private variant used internally; public variant exposed for service-layer PIX orphan cleanup.
  private async rollbackOrder(orderId: string): Promise<void> {
    await this.rollbackCreatedOrder(orderId);
  }

  async rollbackCreatedOrder(orderId: string): Promise<void> {
    try {
      await this.dbService.db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    } catch (err: unknown) {
      this.logger.error(`Rollback: failed to delete order items for order ${orderId}`, err);
    }
    try {
      await this.dbService.db.delete(orders).where(eq(orders.id, orderId));
    } catch (err: unknown) {
      this.logger.error(`Rollback: failed to delete order ${orderId}`, err);
    }
  }

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
    // NeonHttpDatabase doesn't support transactions — use compensating rollbacks on failure.
    const [insertedOrder] = await this.dbService.db
      .insert(orders)
      .values(payload.order)
      .returning();

    let insertedItems: OrderItem[];
    try {
      insertedItems = (await this.dbService.db
        .insert(orderItems)
        .values(payload.items)
        .returning()) as OrderItem[];
    } catch (err: unknown) {
      this.logger.error(`createOrder: items insert failed for order ${insertedOrder.id} — rolling back order`, err);
      await this.rollbackOrder(insertedOrder.id);
      throw err;
    }

    const paymentValues: NewPayment = {
      ...payload.payment,
      pixQrCode: payload.pixQrCode ?? null,
      externalId: payload.externalId ?? null,
    };

    let insertedPayment: Payment;
    try {
      [insertedPayment] = (await this.dbService.db
        .insert(payments)
        .values(paymentValues)
        .returning()) as Payment[];
    } catch (err: unknown) {
      this.logger.error(`createOrder: payment insert failed for order ${insertedOrder.id} — rolling back order and items`, err);
      await this.rollbackOrder(insertedOrder.id);
      throw err;
    }

    return {
      order: insertedOrder as Order,
      items: insertedItems,
      payment: insertedPayment,
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
      const stockErrors: Array<{ productId: string; error: unknown }> = [];
      for (const item of items) {
        if (productUnitTypes[item.productId] === 'digital') continue;
        try {
          await this.dbService.db
            .update(products)
            .set({
              stock: sql`${products.stock} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        } catch (err: unknown) {
          // Log and continue — partial restore is better than full failure
          stockErrors.push({ productId: item.productId, error: err });
          this.logger.error(
            `cancelOrder: stock restore failed for product ${item.productId} on order ${orderId} — continuing`,
            err,
          );
        }
      }
      if (stockErrors.length > 0) {
        this.logger.warn(
          `cancelOrder: stock restore completed with ${stockErrors.length} error(s) for order ${orderId}. ` +
          `Failed product IDs: ${stockErrors.map((e) => e.productId).join(', ')}`,
        );
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
      const stockErrors: Array<{ productId: string; error: unknown }> = [];
      for (const item of items) {
        if (productUnitTypes[item.productId] === 'digital') continue;
        try {
          await this.dbService.db
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
              updatedAt: now,
            })
            .where(eq(products.id, item.productId));
        } catch (err: unknown) {
          // Log and continue — partial deduction is better than full failure
          stockErrors.push({ productId: item.productId, error: err });
          this.logger.error(
            `confirmCashOrder: stock deduction failed for product ${item.productId} on order ${orderId} — continuing`,
            err,
          );
        }
      }
      if (stockErrors.length > 0) {
        this.logger.warn(
          `confirmCashOrder: stock deduction completed with ${stockErrors.length} error(s) for order ${orderId}. ` +
          `Failed product IDs: ${stockErrors.map((e) => e.productId).join(', ')}`,
        );
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
