import { prisma } from '@/lib/prisma'
import { TeamTable } from '@/components/admin/TeamTable'

export default async function EquiposAdminPage() {
  const teams = await prisma.team.findMany({
    include: {
      _count: { select: { users: true, hallazgos: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Equipos</h2>
        <p className="text-sm text-gray-500 mt-0.5">{teams.length} equipo{teams.length !== 1 ? 's' : ''}</p>
      </div>
      <TeamTable teams={teams} />
    </div>
  )
}
