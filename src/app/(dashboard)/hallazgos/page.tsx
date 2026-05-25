import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HallazgoCard } from '@/components/hallazgos/HallazgoCard'
import { HallazgoStatus } from '@prisma/client'

export default async function HallazgosPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const { status, q } = searchParams

  const hallazgos = await prisma.hallazgo.findMany({
    where: {
      ...(status && status !== 'TODOS' ? { status: status as HallazgoStatus } : {}),
      ...(q ? { title: { contains: q } } : {}),
    },
    include: { team: true, reportedBy: true },
    orderBy: { date: 'desc' },
  })

  const statuses = ['TODOS', 'ENCONTRADO', 'RECLAMADO', 'DEVUELTO']
  const statusLabels: Record<string, string> = {
    TODOS: 'Todos',
    ENCONTRADO: 'Encontrado',
    RECLAMADO: 'Reclamado',
    DEVUELTO: 'Devuelto',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hallazgos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{hallazgos.length} registro{hallazgos.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild>
          <Link href="/hallazgos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Hallazgo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <form className="flex-1 min-w-[200px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar hallazgo..."
            className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/hallazgos${s !== 'TODOS' ? `?status=${s}` : ''}${q ? `${s !== 'TODOS' ? '&' : '?'}q=${q}` : ''}`}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                (s === 'TODOS' && !status) || s === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusLabels[s]}
            </Link>
          ))}
        </div>
      </div>

      {hallazgos.length === 0 ? (
        <div className="text-center py-16">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sin hallazgos</h3>
          <p className="text-sm text-gray-400 mt-1">
            {q || status ? 'No hay resultados para tu búsqueda.' : 'Aún no se han registrado hallazgos.'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/hallazgos/nuevo">Registrar primer hallazgo</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hallazgos.map((h) => (
            <HallazgoCard key={h.id} hallazgo={h} />
          ))}
        </div>
      )}
    </div>
  )
}
