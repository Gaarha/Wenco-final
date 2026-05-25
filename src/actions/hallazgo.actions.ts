'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFileToDrive, deleteFileFromDrive } from '@/lib/drive'
import { sendHallazgoNotification } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const HallazgoSchema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  description: z.string().optional(),
  location: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  status: z.enum(['ENCONTRADO', 'RECLAMADO', 'DEVUELTO']),
  teamId: z.string().min(1, 'Seleccione un equipo'),
})

export async function createHallazgo(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')

  const parsed = HallazgoSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    location: formData.get('location'),
    status: formData.get('status') ?? 'ENCONTRADO',
    teamId: formData.get('teamId') ?? session.user.teamId,
  })

  const photos = formData.getAll('photos') as File[]
  const fileIds: string[] = []
  const driveLinks: string[] = []

  for (const photo of photos) {
    if (photo.size === 0) continue
    if (!photo.type.startsWith('image/')) continue
    if (photo.size > 10 * 1024 * 1024) continue
    const buffer = Buffer.from(await photo.arrayBuffer())
    const result = await uploadFileToDrive(buffer, photo.type, photo.name)
    fileIds.push(result.fileId)
    driveLinks.push(result.webViewLink)
  }

  const hallazgo = await prisma.hallazgo.create({
    data: {
      ...parsed,
      date: new Date(),
      reportedById: session.user.id,
      googleDriveFileIds: JSON.stringify(fileIds),
    },
    include: { team: true, reportedBy: true },
  })

  sendHallazgoNotification({
    title: hallazgo.title,
    location: hallazgo.location,
    date: hallazgo.date,
    teamName: hallazgo.team.name,
    reportedByName: hallazgo.reportedBy.name,
    reportedByEmail: hallazgo.reportedBy.email,
    driveLinks,
  }).catch(console.error)

  revalidatePath('/hallazgos')
  redirect('/hallazgos')
}

export async function updateHallazgoStatus(hallazgoId: string, status: 'ENCONTRADO' | 'RECLAMADO' | 'DEVUELTO') {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autenticado')

  await prisma.hallazgo.update({
    where: { id: hallazgoId },
    data: { status },
  })

  revalidatePath(`/hallazgos/${hallazgoId}`)
  revalidatePath('/hallazgos')
}

export async function deleteHallazgo(hallazgoId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error('Sin permisos')

  const hallazgo = await prisma.hallazgo.findUnique({ where: { id: hallazgoId } })
  if (!hallazgo) throw new Error('No encontrado')

  const fileIds: string[] = JSON.parse(hallazgo.googleDriveFileIds)
  await Promise.allSettled(fileIds.map(deleteFileFromDrive))

  await prisma.hallazgo.delete({ where: { id: hallazgoId } })
  revalidatePath('/hallazgos')
  redirect('/hallazgos')
}
