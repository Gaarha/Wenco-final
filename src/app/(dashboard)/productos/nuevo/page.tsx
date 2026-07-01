import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/products/ProductForm'

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/productos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver a productos
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">
            Primero debes crear al menos una categoría en{' '}
            <Link href="/admin/categorias" className="text-blue-600 hover:underline">Administración &gt; Categorías</Link>.
          </p>
        ) : (
          <ProductForm categories={categories} />
        )}
      </div>
    </div>
  )
}
