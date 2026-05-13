import type { ITopProduct } from '../interfaces/dashboard.interface'

interface TopProductsListProps {
  products: ITopProduct[]
}

export function TopProductsList({ products }: TopProductsListProps) {
  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      <span
        className="font-bold"
        style={{ fontSize: '15px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
      >
        Top Produtos
      </span>

      <div className="flex flex-col">
        {products.map((product, index) => (
          <div
            key={product.productId}
            className="flex items-center"
            style={{
              gap: '12px',
              borderBottom: `1px solid #F1F5F9`,
              paddingTop: '10px',
              paddingBottom: '10px',
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#2563EB' : '#64748B',
              }}
            >
              <span
                className="font-bold"
                style={{ fontSize: '12px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
              >
                {index + 1}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className="font-semibold truncate"
                style={{ fontSize: '13px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
              >
                {product.productName}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                {product.totalQuantity} vendidos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
