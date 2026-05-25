import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, User, ExternalLink } from 'lucide-react'
import { HallazgoStatusBadge } from '@/components/hallazgos/HallazgoStatusBadge'
import { StatusUpdater } from '@/components/hallazgos/StatusUpdater'
import { DeleteHallazgo } from '@/components/hallazgos/DeleteHallazgo'
import { getDriveThumbnailUrl, getDriveViewUrl } from '@/lib/drive'
import { formatDate } from '@/lib/utils'

interface PageProps {
  params: { id: string }
}

export default async function HallazgoDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const hallazgo = await prisma.hallazgo.findUnique({
    where: { id: params.id },
    include: { team: true, reportedBy: true },
  })

  if (!hallazgo) notFound()

  const fileIds: string[] = JSON.parse(hallazgo.googleDriveFileIds)
  const isOwner = session?.user.id === hallazgo.reportedById
  const isAdmin = session?.user.role === 'ADMIN'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/hallazgos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a hallazgos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hallazgo.title}</h2>
            <div className="mt-1">
              <HallazgoStatusBadge status={hallazgo.status} />
            </div>
          </div>
          {isAdmin && (
            <DeleteHallazgo hallazgoId={hallazgo.id} />
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {fileIds.length > 0 && (
        <div className="mb-6">
          <div className={`grid gap-2 ${fileIds.length === 1 ? 'grid-cols-1' : fileIds.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {fileIds.map((fileId, i) => (
              <a
                key={fileId}
                href={getDriveViewUrl(fileId)}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative rounded-lg overflow-hidden bg-gray-100 aspect-square"
              >
                <img
                  src={getDriveThumbnailUrl(fileId, 600)}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{fileIds.length} fotografía{fileIds.length !== 1 ? 's' : ''} · Haz clic para ver en Google Drive</p>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-4">
        {hallazgo.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
            <p className="text-sm text-gray-700">{hallazgo.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</p>
              <p className="text-sm text-gray-700 mt-0.5">{hallazgo.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</p>
              <p className="text-sm text-gray-700 mt-0.5">{formatDate(hallazgo.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</p>
              <p className="text-sm text-gray-700 mt-0.5">{hallazgo.team.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reportado por</p>
              <p className="text-sm text-gray-700 mt-0.5">{hallazgo.reportedBy.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status updater */}
      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Actualizar estado</p>
          <StatusUpdater hallazgoId={hallazgo.id} currentStatus={hallazgo.status} />
        </div>
      )}
    </div>
  )
}
