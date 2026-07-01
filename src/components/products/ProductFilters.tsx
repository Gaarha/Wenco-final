'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  categories: Category[]
  q?: string
  categoria?: string
  stock?: string
}

function buildUrl(params: { q?: string; categoria?: string; stock?: string }) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) usp.set(k, v) })
  const qs = usp.toString()
  return `/productos${qs ? `?${qs}` : ''}`
}

export function ProductFilters({ categories, q, categoria, stock }: ProductFiltersProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <form className="flex-1 min-w-[200px]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o SKU..."
          className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        {stock && <input type="hidden" name="stock" value={stock} />}
      </form>
      <select
        defaultValue={categoria ?? ''}
        onChange={(e) => router.push(buildUrl({ q, stock, categoria: e.target.value || undefined }))}
        className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex gap-1">
        {[
          { value: undefined, label: 'Todos' },
          { value: 'bajo', label: 'Stock bajo' },
          { value: 'agotado', label: 'Agotados' },
        ].map(({ value, label }) => (
          <Link
            key={label}
            href={buildUrl({ q, categoria, stock: value })}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              stock === value || (!stock && !value)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
