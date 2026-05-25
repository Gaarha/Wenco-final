import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { HallazgoForm } from '@/components/hallazgos/HallazgoForm'

export default async function NuevoHallazgoPage() {
  const session = await getServerSession(authOptions)
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/hallazgos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a hallazgos
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Registrar Hallazgo</h2>
        <p className="text-sm text-gray-500 mt-0.5">Completa los datos del objeto encontrado</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <HallazgoForm
          teams={teams}
          defaultTeamId={session?.user.teamId ?? null}
          isAdmin={session?.user.role === 'ADMIN'}
        />
      </div>
    </div>
  )
}
