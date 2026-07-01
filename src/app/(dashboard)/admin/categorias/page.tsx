import { prisma } from '@/lib/prisma'
import { CategoryTable } from '@/components/admin/CategoryTable'

export default async function CategoriasAdminPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
        <p className="text-sm text-gray-500 mt-0.5">{categories.length} categoría{categories.length !== 1 ? 's' : ''}</p>
      </div>
      <CategoryTable categories={categories} />
    </div>
  )
}
