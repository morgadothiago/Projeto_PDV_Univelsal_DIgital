import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { payments, Payment } from '../../database/schema/payments';
import { orders, Order } from '../../database/schema/orders';
import { orderItems, OrderItem } from '../../database/schema/order-items';
import { tenants, Tenant } from '../../database/schema/tenants';

export interface OrderWithItemsAndTenant {
  order: Order;
  items: OrderItem[];
  tenant: Tenant;
}

@Injectable()
export class PaymentRepository {
  constructor(private readonly dbService: DbService) {}

  async findByOrderId(orderId: string): Promise<Payment | undefined> {
    const result = await this.dbService.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);
    return result[0];
  }

  async updatePayment(
    id: string,
    data: Partial<{
      status: string;
      confirmedAt: Date | null;
      externalId: string | null;
      pixQrCode: string | null;
    }>,
  ): Promise<Payment | undefined> {
    const result = await this.dbService.db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async findOrderWithItemsAndTenant(
    orderId: string,
  ): Promise<OrderWithItemsAndTenant | undefined> {
    const orderResult = await this.dbService.db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const order = orderResult[0];
    if (!order) return undefined;

    const [items, tenantResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId)),
      this.dbService.db
        .select()
        .from(tenants)
        .where(eq(tenants.id, order.tenantId))
        .limit(1),
    ]);

    const tenant = tenantResult[0];
    if (!tenant) return undefined;

    return { order, items, tenant };
  }
}
