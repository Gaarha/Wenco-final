import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, PackageSearch, AlertTriangle, DollarSign, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductFilters } from '@/components/products/ProductFilters'
import { formatCurrency } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; stock?: string }
}) {
  const { q, categoria, stock } = searchParams

  const where: Prisma.ProductWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
    ...(categoria ? { categoryId: categoria } : {}),
  }

  const [allProducts, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const products = allProducts.filter((p) => {
    if (stock === 'bajo') return p.quantity > 0 && p.quantity <= p.minStock
    if (stock === 'agotado') return p.quantity === 0
    return true
  })

  const allInventory = await prisma.product.findMany()
  const totalValue = allInventory.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const lowStockCount = allInventory.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length
  const outOfStockCount = allInventory.filter((p) => p.quantity === 0).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario de Productos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{allInventory.length} producto{allInventory.length !== 1 ? 's' : ''} registrado{allInventory.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild>
          <Link href="/productos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Valor total del inventario</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        <Link href={`/productos?stock=bajo`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-orange-300 transition-colors">
          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Stock bajo</p>
            <p className="text-lg font-bold text-gray-900">{lowStockCount}</p>
          </div>
        </Link>
        <Link href={`/productos?stock=agotado`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-red-300 transition-colors">
          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Agotados</p>
            <p className="text-lg font-bold text-gray-900">{outOfStockCount}</p>
          </div>
        </Link>
      </div>

      <ProductFilters categories={categories} q={q} categoria={categoria} stock={stock} />

      {products.length === 0 ? (
        <div className="text-center py-16">
          <PackageSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sin productos</h3>
          <p className="text-sm text-gray-400 mt-1">
            {q || categoria || stock ? 'No hay resultados para tu búsqueda.' : 'Aún no se han registrado productos.'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/productos/nuevo">Registrar primer producto</Link>
          </Button>
        </div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  )
}
