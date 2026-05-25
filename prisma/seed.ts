import { PrismaClient, Role } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const teamA = await prisma.team.upsert({
    where: { name: 'Equipo Operaciones' },
    update: {},
    create: { name: 'Equipo Operaciones', description: 'Área de operaciones y logística' },
  })

  const teamB = await prisma.team.upsert({
    where: { name: 'Equipo Administración' },
    update: {},
    create: { name: 'Equipo Administración', description: 'Área administrativa' },
  })

  await prisma.user.upsert({
    where: { email: 'admin@wenco.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@wenco.com',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      role: Role.ADMIN,
      teamId: teamA.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'usuario@wenco.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'usuario@wenco.com',
      passwordHash: await bcrypt.hash('Usuario1234!', 12),
      role: Role.USER,
      teamId: teamB.id,
    },
  })

  console.log('Seed completado: 2 equipos, 2 usuarios creados')
  console.log('Admin:   admin@wenco.com / Admin1234!')
  console.log('Usuario: usuario@wenco.com / Usuario1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
