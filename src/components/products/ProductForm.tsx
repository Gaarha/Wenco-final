'use client'

import { useTransition, useState } from 'react'
import { Loader2, Tag, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/actions/product.actions'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  product?: {
    id: string
    name: string
    sku: string
    description: string | null
    brand: string | null
    model: string | null
    price: number
    quantity: number
    minStock: number
    location: string | null
    status: 'ACTIVO' | 'DESCONTINUADO'
    categoryId: string
  }
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEditing = Boolean(product)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (product) await updateProduct(product.id, formData)
        else await createProduct(formData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (!message.includes('NEXT_REDIRECT')) {
          setError(message || 'Ocurrió un error. Intenta de nuevo.')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del producto <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="name" name="name" required className="pl-9" defaultValue={product?.name} placeholder="Ej: Laptop Dell Latitude 5440" />
          </div>
        </div>

        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="sku" name="sku" required className="pl-9" defaultValue={product?.sku} placeholder="Ej: LAP-DELL-5440" />
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ''}
            className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar categoría...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ''} placeholder="Ej: Dell" />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <Input id="model" name="model" defaultValue={product?.model ?? ''} placeholder="Ej: Latitude 5440" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-gray-400 text-xs font-normal">(opcional)</span>
          </label>
          <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ''} placeholder="Especificaciones, características..." />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Precio (USD) <span className="text-red-500">*</span>
          </label>
          <Input id="price" name="price" type="number" min="0" step="0.01" required defaultValue={product?.price ?? 0} />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Stock {isEditing ? 'actual' : 'inicial'} <span className="text-red-500">*</span>
          </label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.quantity ?? 0}
            readOnly={isEditing}
            className={isEditing ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}
          />
          {isEditing && <p className="text-xs text-gray-400 mt-1">Usa &quot;Ajustar stock&quot; para modificar la cantidad</p>}
        </div>

        <div>
          <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock mínimo <span className="text-red-500">*</span>
          </label>
          <Input id="minStock" name="minStock" type="number" min="0" step="1" required defaultValue={product?.minStock ?? 5} />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <Input id="location" name="location" defaultValue={product?.location ?? ''} placeholder="Ej: Bodega 1, Estante A3" />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? 'ACTIVO'}
            className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ACTIVO">Activo</option>
            <option value="DESCONTINUADO">Descontinuado</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Actualizar producto'
          ) : (
            'Crear producto'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
