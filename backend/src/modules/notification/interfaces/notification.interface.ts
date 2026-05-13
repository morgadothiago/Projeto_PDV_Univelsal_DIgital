export interface IEmailReceiptData {
  to: string;
  storeName: string;
  receiptNumber: string;
  items: IReceiptItem[];
  total: number;
  paymentMethod: string;
  date: Date;
}

export interface IReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IStockAlertEmailData {
  to: string;
  storeName: string;
  productName: string;
  currentStock: number;
  threshold: number;
}
