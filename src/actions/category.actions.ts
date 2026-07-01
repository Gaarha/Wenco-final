'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Sin permisos de administrador')
  return session
}

export async function createCategory(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string

  await prisma.category.create({ data: { name: name.trim() } })

  revalidatePath('/admin/categorias')
  revalidatePath('/productos')
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string

  await prisma.category.update({ where: { id }, data: { name: name.trim() } })

  revalidatePath('/admin/categorias')
  revalidatePath('/productos')
}

export async function deleteCategory(id: string) {
  await requireAdmin()

  const productsCount = await prisma.product.count({ where: { categoryId: id } })
  if (productsCount > 0) throw new Error('No se puede eliminar: hay productos en esta categoría')

  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categorias')
}
