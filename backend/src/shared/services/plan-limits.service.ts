import { Injectable, ForbiddenException } from '@nestjs/common';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { tenants } from '../../database/schema/tenants';
import { products } from '../../database/schema/products';
import { users } from '../../database/schema/users';
import { orders } from '../../database/schema/orders';

export const FREE_LIMITS = {
  products: 10,
  cashiers: 1,
  ordersPerMonth: 50,
} as const;

export interface PlanUsage {
  plan: 'free' | 'pro';
  products: { current: number; limit: number | null };
  cashiers: { current: number; limit: number | null };
  ordersThisMonth: { current: number; limit: number | null };
}

@Injectable()
export class PlanLimitsService {
  constructor(private readonly dbService: DbService) {}

  async isPro(tenantId: string): Promise<boolean> {
    const result = await this.dbService.db
      .select({ plan: tenants.plan })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    return result[0]?.plan === 'pro';
  }

  async checkProductLimit(tenantId: string): Promise<void> {
    if (await this.isPro(tenantId)) return;
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)));
    const count = result[0]?.count ?? 0;
    if (count >= FREE_LIMITS.products) {
      throw new ForbiddenException(
        `Limite do plano gratuito atingido: ${FREE_LIMITS.products} produtos. Faça upgrade para Pro.`,
      );
    }
  }

  async checkCashierLimit(tenantId: string): Promise<void> {
    if (await this.isPro(tenantId)) return;
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.role, 'cashier'),
          eq(users.isActive, true),
        ),
      );
    const count = result[0]?.count ?? 0;
    if (count >= FREE_LIMITS.cashiers) {
      throw new ForbiddenException(
        `Limite do plano gratuito atingido: ${FREE_LIMITS.cashiers} caixeiro. Faça upgrade para Pro.`,
      );
    }
  }

  async checkOrderLimit(tenantId: string): Promise<void> {
    if (await this.isPro(tenantId)) return;
    const firstOfMonth = new Date();
    firstOfMonth.setUTCDate(1);
    firstOfMonth.setUTCHours(0, 0, 0, 0);
    const result = await this.dbService.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), gte(orders.createdAt, firstOfMonth)));
    const count = result[0]?.count ?? 0;
    if (count >= FREE_LIMITS.ordersPerMonth) {
      throw new ForbiddenException(
        `Limite do plano gratuito atingido: ${FREE_LIMITS.ordersPerMonth} pedidos/mês. Faça upgrade para Pro.`,
      );
    }
  }

  async requirePro(tenantId: string, feature: string): Promise<void> {
    if (!(await this.isPro(tenantId))) {
      throw new ForbiddenException(
        `${feature} requer o plano Pro. Faça upgrade para desbloquear.`,
      );
    }
  }

  async getUsage(tenantId: string): Promise<PlanUsage> {
    const pro = await this.isPro(tenantId);
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
        .where(
          and(eq(users.tenantId, tenantId), eq(users.role, 'cashier'), eq(users.isActive, true)),
        ),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(eq(orders.tenantId, tenantId), gte(orders.createdAt, firstOfMonth))),
    ]);

    return {
      plan: pro ? 'pro' : 'free',
      products: { current: productsRes[0]?.count ?? 0, limit: pro ? null : FREE_LIMITS.products },
      cashiers: { current: cashiersRes[0]?.count ?? 0, limit: pro ? null : FREE_LIMITS.cashiers },
      ordersThisMonth: {
        current: ordersRes[0]?.count ?? 0,
        limit: pro ? null : FREE_LIMITS.ordersPerMonth,
      },
    };
  }
}
