import { Injectable } from '@nestjs/common';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products } from '../../database/schema/products';
import { users } from '../../database/schema/users';
import { orders } from '../../database/schema/orders';

export interface PlanUsage {
  plan: 'free' | 'pro';
  products: { current: number; limit: number | null };
  cashiers: { current: number; limit: number | null };
  ordersThisMonth: { current: number; limit: number | null };
}

@Injectable()
export class PlanLimitsService {
  constructor(private readonly dbService: DbService) {}

  async isPro(_tenantId: string): Promise<boolean> {
    return true;
  }

  async checkProductLimit(_tenantId: string): Promise<void> {
    return;
  }

  async checkCashierLimit(_tenantId: string): Promise<void> {
    return;
  }

  async checkOrderLimit(_tenantId: string): Promise<void> {
    return;
  }

  async requirePro(_tenantId: string, _feature: string): Promise<void> {
    return;
  }

  async getUsage(tenantId: string): Promise<PlanUsage> {
    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);

    const [productsRes, cashiersRes, ordersRes] = await Promise.all([
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true))),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'cashier'), eq(users.isActive, true))),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(eq(orders.tenantId, tenantId), gte(orders.createdAt, firstOfMonth))),
    ]);

    return {
      plan: 'pro',
      products: { current: productsRes[0]?.count ?? 0, limit: null },
      cashiers: { current: cashiersRes[0]?.count ?? 0, limit: null },
      ordersThisMonth: { current: ordersRes[0]?.count ?? 0, limit: null },
    };
  }
}
