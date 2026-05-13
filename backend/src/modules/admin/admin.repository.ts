import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { tenants } from '../../database/schema/tenants';
import { orders } from '../../database/schema/orders';
import { IAdminMetrics } from './interfaces/admin-metrics.interface';

const CONFIRMED_STATUSES = ['confirmed', 'completed'] as const;

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
}
