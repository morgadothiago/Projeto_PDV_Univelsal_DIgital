export interface IDashboardKPIs {
  salesToday: number;
  salesDelta: number;
  revenueToday: number;
  revenueDelta: number;
  activeProducts: number;
  cashiersCount: number;
}

export interface IWeeklyBar {
  day: string;
  orders: number;
  isToday: boolean;
}

export interface ITopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
}
