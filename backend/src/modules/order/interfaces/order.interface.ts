export type OrderStatus = 'pending' | 'awaiting_payment' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'pix' | 'cash' | 'credit_card' | 'debit_card';

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderItemInput {
  productId: string;
  quantity: number;
}

export interface IOrder {
  id: string;
  tenantId: string;
  cashierId: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod | null;
  customerEmail: string | null;
  notes: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderWithDetails extends IOrder {
  items: IOrderItem[];
  payment: IOrderPayment | null;
}

export interface IOrderPayment {
  id: string;
  method: string;
  amount: number;
  status: string;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  externalId: string | null;
  confirmedAt: Date | null;
}

export interface ICreateOrder {
  tenantId: string;
  cashierId: string;
  items: IOrderItemInput[];
  paymentMethod: PaymentMethod;
  customerEmail?: string;
}

export interface ICreateOrderResult {
  orderId: string;
  total: number;
  status: OrderStatus;
  payment: {
    method: string;
    pixQrCode: string | null;
    pixQrCodeBase64: string | null;
  };
}

export interface IOrderList {
  data: IOrderWithDetails[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface IOrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  cashierId?: string;
  dateFrom?: string;
  dateTo?: string;
}
