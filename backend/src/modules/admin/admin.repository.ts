import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql, desc } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { tenants } from '../../database/schema/tenants';
import { orders } from '../../database/schema/orders';
import { products } from '../../database/schema/products';
import { users } from '../../database/schema/users';
import { IAdminMetrics } from './interfaces/admin-metrics.interface';
import { CONFIRMED_STATUSES } from '../../shared/constants/order-status.constants';

export interface ITenantSummary {
  metrics: {
    totalRevenue: string;
    totalOrders: number;
    totalProducts: number;
    activeCashiers: number;
  };
  recentOrders: {
    id: string;
    cashierName: string;
    total: string;
    status: string;
    createdAt: Date;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    stock: string;
    stockThreshold: string;
  }[];
}

@Injectable()
export class AdminRepository {
  constructor(private readonly dbService: DbService) {}

  /**
   * Fetches global platform metrics for the super_admin dashboard.
   * Runs four aggregated queries in parallel for performance.
   */
  async getGlobalMetrics(): Promise<IAdminMetrics> {
    const todayFilter = and(
      sql`DATE(${orders.createdAt}) = CURRENT_DATE`,
      inArray(orders.status, [...CONFIRMED_STATUSES]),
    );

    const [
      activeTenantsResult,
      totalTenantsResult,
      todayOrdersResult,
      todayRevenueResult,
    ] = await Promise.all([
      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(tenants)
        .where(eq(tenants.isActive, true)),

      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(tenants),

      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(orders)
        .where(todayFilter),

      this.dbService.db
        .select({
          revenue: sql<string | null>`COALESCE(SUM(${orders.total})::numeric(10,2)::text, NULL)`,
        })
        .from(orders)
        .where(todayFilter),
    ]);

    return {
      activeTenants: activeTenantsResult[0]?.count ?? 0,
      totalTenants: totalTenantsResult[0]?.count ?? 0,
      todayOrders: todayOrdersResult[0]?.count ?? 0,
      todayRevenue: todayRevenueResult[0]?.revenue ?? '0.00',
    };
  }

  async getTenantSummary(tenantId: string): Promise<ITenantSummary> {
    const [
      revenueResult,
      ordersCountResult,
      productsCountResult,
      cashiersResult,
      recentOrdersRaw,
      lowStockRaw,
    ] = await Promise.all([
      this.dbService.db
        .select({ revenue: sql<string>`COALESCE(SUM(${orders.total})::numeric(10,2)::text, '0.00')` })
        .from(orders)
        .where(and(eq(orders.tenantId, tenantId), inArray(orders.status, [...CONFIRMED_STATUSES]))),

      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(orders)
        .where(eq(orders.tenantId, tenantId)),

      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(eq(products.tenantId, tenantId)),

      this.dbService.db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'cashier'), eq(users.isActive, true))),

      this.dbService.db
        .select({
          id: orders.id,
          cashierId: orders.cashierId,
          total: orders.total,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.tenantId, tenantId))
        .orderBy(desc(orders.createdAt))
        .limit(5),

      this.dbService.db
        .select({
          id: products.id,
          name: products.name,
          stock: products.stock,
          stockThreshold: products.stockThreshold,
        })
        .from(products)
        .where(and(
          eq(products.tenantId, tenantId),
          sql`${products.stock}::numeric <= ${products.stockThreshold}::numeric`,
        ))
        .limit(10),
    ]);

    // Fetch cashier names for recent orders (menu orders have null cashierId — filter them out)
    const cashierIds = [...new Set(recentOrdersRaw.map((o) => o.cashierId).filter((id): id is string => id !== null))];
    const cashierMap = new Map<string, string>();
    if (cashierIds.length > 0) {
      const cashierRows = await this.dbService.db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, cashierIds));
      cashierRows.forEach((u) => cashierMap.set(u.id, u.name));
    }

    return {
      metrics: {
        totalRevenue: revenueResult[0]?.revenue ?? '0.00',
        totalOrders: ordersCountResult[0]?.count ?? 0,
        totalProducts: productsCountResult[0]?.count ?? 0,
        activeCashiers: cashiersResult[0]?.count ?? 0,
      },
      recentOrders: recentOrdersRaw.map((o) => ({
        id: o.id,
        cashierName: o.cashierId ? (cashierMap.get(o.cashierId) ?? 'Desconhecido') : 'Cardápio Digital',
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      lowStockProducts: lowStockRaw.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        stockThreshold: p.stockThreshold,
      })),
    };
  }
}
