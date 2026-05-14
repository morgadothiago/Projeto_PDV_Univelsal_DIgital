import { Injectable } from '@nestjs/common';
import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { CONFIRMED_STATUSES } from '../../shared/constants/order-status.constants';
import { orders } from '../../database/schema/orders';
import { orderItems } from '../../database/schema/order-items';
import { payments } from '../../database/schema/payments';

export interface SalesSeriesRow {
  date: string;
  total: string;
  orderCount: number;
}

export interface SalesReportResult {
  total: string;
  orderCount: number;
  series: SalesSeriesRow[];
}

export interface TopProductRow {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: string;
}

export interface PaymentMethodRow {
  method: string;
  count: number;
  total: string;
}

type GroupBy = 'day' | 'week' | 'month';

@Injectable()
export class ReportRepository {
  constructor(private readonly dbService: DbService) {}

  async getSalesReport(
    tenantId: string | null,
    dateFrom: string,
    dateTo: string,
    groupBy: GroupBy,
  ): Promise<SalesReportResult> {
    const dateToEnd = new Date(dateTo);
    dateToEnd.setUTCDate(dateToEnd.getUTCDate() + 1); // inclusive: end of dateTo day UTC
    const conditions = [
      inArray(orders.status, [...CONFIRMED_STATUSES]),
      gte(orders.createdAt, new Date(dateFrom)),
      lte(orders.createdAt, dateToEnd),
    ];

    if (tenantId) {
      conditions.push(eq(orders.tenantId, tenantId));
    }

    const whereClause = and(...conditions);

    const groupExpr = this.buildGroupExpression(groupBy);

    const [totalsResult, seriesResult] = await Promise.all([
      this.dbService.db
        .select({
          total: sql<string>`COALESCE(SUM(${orders.total}), 0)::numeric(10,2)::text`,
          orderCount: sql<number>`COUNT(*)::int`,
        })
        .from(orders)
        .where(whereClause),

      this.dbService.db
        .select({
          date: groupExpr,
          total: sql<string>`COALESCE(SUM(${orders.total}), 0)::numeric(10,2)::text`,
          orderCount: sql<number>`COUNT(*)::int`,
        })
        .from(orders)
        .where(whereClause)
        .groupBy(groupExpr)
        .orderBy(groupExpr),
    ]);

    const totals = totalsResult[0];

    return {
      total: totals?.total ?? '0.00',
      orderCount: totals?.orderCount ?? 0,
      series: seriesResult.map((row) => ({
        date: String(row.date),
        total: row.total,
        orderCount: row.orderCount,
      })),
    };
  }

  async getTopProducts(
    tenantId: string | null,
    dateFrom: string,
    dateTo: string,
    limit: number,
  ): Promise<TopProductRow[]> {
    const dateToEnd = new Date(dateTo);
    dateToEnd.setUTCDate(dateToEnd.getUTCDate() + 1);
    const conditions = [
      inArray(orders.status, [...CONFIRMED_STATUSES]),
      gte(orders.createdAt, new Date(dateFrom)),
      lte(orders.createdAt, dateToEnd),
    ];

    if (tenantId) {
      conditions.push(eq(orders.tenantId, tenantId));
    }

    const rows = await this.dbService.db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        totalQuantity: sql<number>`SUM(${orderItems.quantity})::int`,
        totalRevenue: sql<string>`SUM(${orderItems.subtotal})::numeric(10,2)::text`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(...conditions))
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(sql`SUM(${orderItems.subtotal}) DESC`)
      .limit(limit);

    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantity: row.totalQuantity,
      totalRevenue: row.totalRevenue,
    }));
  }

  async getPaymentMethodBreakdown(
    tenantId: string | null,
    dateFrom: string,
    dateTo: string,
  ): Promise<PaymentMethodRow[]> {
    const dateToEnd = new Date(dateTo);
    dateToEnd.setUTCDate(dateToEnd.getUTCDate() + 1);
    const conditions = [
      eq(payments.status, 'confirmed'),
      gte(payments.createdAt, new Date(dateFrom)),
      lte(payments.createdAt, dateToEnd),
    ];

    if (tenantId) {
      conditions.push(eq(payments.tenantId, tenantId));
    }

    const rows = await this.dbService.db
      .select({
        method: payments.method,
        count: sql<number>`COUNT(*)::int`,
        total: sql<string>`SUM(${payments.amount})::numeric(10,2)::text`,
      })
      .from(payments)
      .where(and(...conditions))
      .groupBy(payments.method)
      .orderBy(sql`SUM(${payments.amount}) DESC`);

    return rows.map((row) => ({
      method: row.method,
      count: row.count,
      total: row.total,
    }));
  }

  private buildGroupExpression(groupBy: GroupBy): ReturnType<typeof sql> {
    switch (groupBy) {
      case 'week':
        return sql`DATE_TRUNC('week', ${orders.createdAt})::date`;
      case 'month':
        return sql`DATE_TRUNC('month', ${orders.createdAt})::date`;
      case 'day':
      default:
        return sql`DATE(${orders.createdAt})`;
    }
  }
}
