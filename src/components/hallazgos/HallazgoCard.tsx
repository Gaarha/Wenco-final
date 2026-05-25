import Link from 'next/link'
import { MapPin, Calendar, Users } from 'lucide-react'
import { HallazgoStatusBadge } from './HallazgoStatusBadge'
import { getDriveThumbnailUrl } from '@/lib/drive'
import { formatDateShort } from '@/lib/utils'

interface HallazgoCardProps {
  hallazgo: {
    id: string
    title: string
    location: string
    date: Date
    status: 'ENCONTRADO' | 'RECLAMADO' | 'DEVUELTO'
    googleDriveFileIds: string
    team: { name: string }
    reportedBy: { name: string }
  }
}

export function HallazgoCard({ hallazgo }: HallazgoCardProps) {
  const fileIds: string[] = JSON.parse(hallazgo.googleDriveFileIds)
  const thumbUrl = fileIds.length > 0 ? getDriveThumbnailUrl(fileIds[0], 400) : null

  return (
    <Link href={`/hallazgos/${hallazgo.id}`} className="block group">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
        <div className="h-48 bg-gray-100 relative overflow-hidden">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={hallazgo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <HallazgoStatusBadge status={hallazgo.status} />
          </div>
          {fileIds.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              +{fileIds.length - 1} fotos
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {hallazgo.title}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{hallazgo.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{formatDateShort(hallazgo.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{hallazgo.team.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
