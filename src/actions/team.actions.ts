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

export async function createTeam(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  await prisma.team.create({
    data: { name: name.trim(), description: description?.trim() || null },
  })

  revalidatePath('/admin/equipos')
}

export async function updateTeam(id: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  await prisma.team.update({
    where: { id },
    data: { name: name.trim(), description: description?.trim() || null },
  })

  revalidatePath('/admin/equipos')
}

export async function deleteTeam(id: string) {
  await requireAdmin()

  const usersCount = await prisma.user.count({ where: { teamId: id } })
  if (usersCount > 0) throw new Error('No se puede eliminar: hay usuarios en este equipo')

  const hallazgosCount = await prisma.hallazgo.count({ where: { teamId: id } })
  if (hallazgosCount > 0) throw new Error('No se puede eliminar: hay hallazgos asociados a este equipo')

  await prisma.team.delete({ where: { id } })
  revalidatePath('/admin/equipos')
}
