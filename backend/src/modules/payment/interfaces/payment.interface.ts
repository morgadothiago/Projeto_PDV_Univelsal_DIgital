export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface IPayment {
  id: string;
  orderId: string;
  tenantId: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  externalId: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePayment {
  orderId: string;
  tenantId: string;
  method: string;
  amount: number;
}

export interface IPixPaymentResult {
  paymentId: string;
  pixQrCode: string;
  pixQrCodeBase64: string;
  externalId: string;
}
