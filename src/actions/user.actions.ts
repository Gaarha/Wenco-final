'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Sin permisos de administrador')
  return session
}

export async function createUser(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) ?? 'USER'
  const teamId = formData.get('teamId') as string | null

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role as 'USER' | 'ADMIN',
      teamId: teamId || null,
    },
  })

  revalidatePath('/admin/usuarios')
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const role = (formData.get('role') as string) ?? 'USER'
  const teamId = formData.get('teamId') as string | null
  const newPassword = formData.get('password') as string | null

  const data: Record<string, unknown> = {
    name: name.trim(),
    role: role as 'USER' | 'ADMIN',
    teamId: teamId || null,
  }

  if (newPassword && newPassword.length >= 6) {
    data.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  await prisma.user.update({ where: { id }, data })
  revalidatePath('/admin/usuarios')
}

export async function deleteUser(id: string) {
  const session = await requireAdmin()
  if (session.user.id === id) throw new Error('No puedes eliminarte a ti mismo')
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/usuarios')
}
