import { prisma } from '@/lib/prisma'
import { UserTable } from '@/components/admin/UserTable'

export default async function UsuariosAdminPage() {
  const [users, teams] = await Promise.all([
    prisma.user.findMany({ include: { team: true }, orderBy: { name: 'asc' } }),
    prisma.team.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
      </div>
      <UserTable users={users} teams={teams} />
    </div>
  )
}
