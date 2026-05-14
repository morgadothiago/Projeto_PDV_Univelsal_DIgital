export interface IMenuTenant {
  id: string
  name: string
  type: string
  settings: { logoUrl?: string; primaryColor?: string } | null
}

export interface IMenuProduct {
  id: string
  name: string
  price: number
  unitType: string
  customUnit: string | null
  categoryId: string | null
  categoryName: string | null
  imageUrl: string | null
  stock: number
  active: boolean
}

export interface IMenuCategory {
  id: string
  name: string
}

export interface ICartItem {
  productId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface ICreateMenuOrderPayload {
  customerName?: string
  customerPhone?: string
  tableRef?: string
  paymentMethod: 'pix' | 'card' | 'cash'
  items: { productId: string; quantity: number; unitPrice: number }[]
  notes?: string
}

export interface IMenuOrderResult {
  id: string
  orderNumber: string
  total: number
  status: string
  estimatedMinutes: number
}
