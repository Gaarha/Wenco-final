import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag, Hash, MapPin, DollarSign, Pencil } from 'lucide-react'
import { StockBadge } from '@/components/products/StockBadge'
import { StockAdjustDialog } from '@/components/products/StockAdjustDialog'
import { DeleteProduct } from '@/components/products/DeleteProduct'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, PRODUCT_STATUS_CONFIG, MOVEMENT_CONFIG } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default async function ProductoDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      movements: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!product) notFound()

  const isAdmin = session?.user.role === 'ADMIN'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/productos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRODUCT_STATUS_CONFIG[product.status].className}`}>
                {PRODUCT_STATUS_CONFIG[product.status].label}
              </span>
              <StockBadge quantity={product.quantity} minStock={product.minStock} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/productos/${product.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
            {isAdmin && <DeleteProduct productId={product.id} />}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-4">
        {product.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
            <p className="text-sm text-gray-700">{product.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</p>
              <p className="text-sm text-gray-700 mt-0.5">{product.sku}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</p>
              <p className="text-sm text-gray-700 mt-0.5">{product.category.name}</p>
            </div>
          </div>
          {(product.brand || product.model) && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca / Modelo</p>
                <p className="text-sm text-gray-700 mt-0.5">{[product.brand, product.model].filter(Boolean).join(' · ')}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</p>
              <p className="text-sm text-gray-700 mt-0.5">{formatCurrency(product.price)}</p>
            </div>
          </div>
          {product.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</p>
                <p className="text-sm text-gray-700 mt-0.5">{product.location}</p>
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock mínimo</p>
            <p className="text-sm text-gray-700 mt-0.5">{product.minStock} unidades</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor en inventario</p>
            <p className="text-sm text-gray-700 mt-0.5">{formatCurrency(product.price * product.quantity)}</p>
          </div>
        </div>
      </div>

      {/* Stock movements */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Historial de movimientos</p>
          <StockAdjustDialog productId={product.id} />
        </div>
        {product.movements.length === 0 ? (
          <p className="text-sm text-gray-400">Sin movimientos registrados.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {product.movements.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${MOVEMENT_CONFIG[m.type].className}`}>
                    {MOVEMENT_CONFIG[m.type].label}
                  </span>
                  <div>
                    <p className="text-sm text-gray-900">
                      {m.type === 'SALIDA' ? '-' : '+'}{m.quantity} unidades
                      {m.note && <span className="text-gray-400"> · {m.note}</span>}
                    </p>
                    <p className="text-xs text-gray-400">{m.user.name} · {formatDate(m.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
