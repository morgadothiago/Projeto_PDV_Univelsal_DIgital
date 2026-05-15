export interface IProduct {
  id: string
  name: string
  price: number
  unitType: string
  customUnit?: string | null
  categoryId: string | null
  categoryName: string | null
  imageUrl: string | null
  stock: number
  stockThreshold?: number
  isActive: boolean
}

export interface IProductList {
  items: IProduct[]
  meta: {
    page: number
    total: number
    limit: number
  }
}

export interface IProductFilters {
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}

export interface ICategory {
  id: string
  name: string
}
