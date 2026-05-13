export interface ISalesSummary {
  dateFrom: string;
  dateTo: string;
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface ISalesByPeriod {
  period: string;
  orders: number;
  revenue: number;
}

export interface ISalesReport {
  summary: ISalesSummary;
  byPeriod: ISalesByPeriod[];
}

export interface ITopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface IPaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export interface IReportQuery {
  dateFrom: string;
  dateTo: string;
}

export interface ISalesReportQuery extends IReportQuery {
  groupBy?: 'day' | 'week' | 'month';
}

export interface ITopProductsQuery extends IReportQuery {
  limit?: number;
}
