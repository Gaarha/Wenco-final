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

  const adminUser = await prisma.user.upsert({
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

  const categoryData = [
    { name: 'Laptops' },
    { name: 'Monitores' },
    { name: 'Periféricos' },
    { name: 'Redes' },
    { name: 'Componentes' },
  ]
  const categories = new Map<string, string>()
  for (const c of categoryData) {
    const category = await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c })
    categories.set(c.name, category.id)
  }

  const productData = [
    { name: 'Laptop Dell Latitude 5440', sku: 'LAP-DELL-5440', brand: 'Dell', model: 'Latitude 5440', price: 1150, quantity: 8, minStock: 3, category: 'Laptops', location: 'Bodega 1 - Estante A1' },
    { name: 'Monitor LG 27" 4K', sku: 'MON-LG-27UK', brand: 'LG', model: '27UK850', price: 380, quantity: 2, minStock: 4, category: 'Monitores', location: 'Bodega 1 - Estante B2' },
    { name: 'Teclado mecánico Logitech MX', sku: 'TEC-LOG-MXK', brand: 'Logitech', model: 'MX Keys', price: 95, quantity: 15, minStock: 5, category: 'Periféricos', location: 'Bodega 2 - Estante C1' },
    { name: 'Switch de red 24 puertos', sku: 'RED-TPL-24P', brand: 'TP-Link', model: 'TL-SG1024', price: 210, quantity: 0, minStock: 2, category: 'Redes', location: 'Bodega 2 - Estante D3' },
    { name: 'Memoria RAM DDR4 16GB', sku: 'COM-KIN-16GB', brand: 'Kingston', model: 'Fury Beast', price: 45, quantity: 30, minStock: 10, category: 'Componentes', location: 'Bodega 1 - Estante A4' },
  ]

  for (const p of productData) {
    const { category, ...data } = p
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...data, categoryId: categories.get(category)! },
    })
    const existingMovements = await prisma.stockMovement.count({ where: { productId: product.id } })
    if (existingMovements === 0 && product.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          type: 'ENTRADA',
          quantity: product.quantity,
          note: 'Stock inicial',
          productId: product.id,
          userId: adminUser.id,
        },
      })
    }
  }

  console.log('Seed completado: 2 equipos, 2 usuarios, 5 categorías, 5 productos creados')
  console.log('Admin:   admin@wenco.com / Admin1234!')
  console.log('Usuario: usuario@wenco.com / Usuario1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
