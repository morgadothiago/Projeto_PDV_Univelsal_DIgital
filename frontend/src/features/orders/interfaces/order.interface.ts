export interface ICreateOrder {
  items: { productId: string; quantity: number }[]
  paymentMethod: 'pix' | 'cash' | 'card'
}

export interface IOrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

export interface ICreateOrderResponse {
  orderId: string
  total: number
  status: string
  payment: {
    method: string
    pixQrCode: string | null
    pixQrCodeBase64: string | null
  }
}

export interface IOrder {
  orderId: string
  total: number
  paymentMethod: string
  status?: string
  pixQrCode?: string
  items: IOrderItem[]
  createdAt: string
}

export interface IOrderListItem {
  id: string
  tenantId: string
  cashierId: string | null
  source: string
  customerName: string | null
  tableRef: string | null
  status: string
  total: number
  paymentMethod: string
  customerEmail: string | null
  createdAt: string
  itemCount: number
}

export interface IOrderListResponse {
  data: IOrderListItem[]
  meta: {
    page: number
    total: number
    limit: number
  }
}
