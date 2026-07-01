import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/products/ProductForm'

interface PageProps {
  params: { id: string }
}

export default async function EditarProductoPage({ params }: PageProps) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/productos/${product.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver al producto
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Producto</h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  )
}
