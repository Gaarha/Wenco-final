import Link from 'next/link'
import { StockBadge } from './StockBadge'
import { PRODUCT_STATUS_CONFIG, formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  brand: string | null
  model: string | null
  price: number
  quantity: number
  minStock: number
  status: 'ACTIVO' | 'DESCONTINUADO'
  category: { name: string }
}

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Precio</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Stock</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <Link href={`/productos/${product.id}`} className="block">
                  <div className="font-medium text-gray-900 hover:text-blue-600">{product.name}</div>
                  <div className="text-gray-400 text-xs">
                    {product.sku}
                    {(product.brand || product.model) && ` · ${[product.brand, product.model].filter(Boolean).join(' ')}`}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
              <td className="px-4 py-3 text-gray-600">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3">
                <StockBadge quantity={product.quantity} minStock={product.minStock} />
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRODUCT_STATUS_CONFIG[product.status].className}`}>
                  {PRODUCT_STATUS_CONFIG[product.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
