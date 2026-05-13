export interface IProduct {
  id: string
  name: string
  price: number
  unitType: string
  categoryId: string | null
  categoryName: string | null
  imageUrl: string | null
  stock: number
  active: boolean
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
