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

export interface IOrder {
  orderId: string
  total: number
  paymentMethod: string
  pixQrCode?: string
  items: IOrderItem[]
  createdAt: string
}
