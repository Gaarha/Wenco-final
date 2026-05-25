'use client'

import { useTransition, useState, useRef } from 'react'
import { Upload, X, Loader2, MapPin, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatDateShort, STATUS_CONFIG } from '@/lib/utils'
import { createHallazgo } from '@/actions/hallazgo.actions'

interface Team {
  id: string
  name: string
}

interface HallazgoFormProps {
  teams: Team[]
  defaultTeamId?: string | null
  isAdmin?: boolean
}

export function HallazgoForm({ teams, defaultTeamId, isAdmin = false }: HallazgoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const today = formatDateShort(new Date())

  const addFiles = (newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(
      (f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024,
    )
    const remaining = 5 - selectedFiles.length
    const toAdd = valid.slice(0, remaining)
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
    setSelectedFiles((prev) => [...prev, ...toAdd])
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    // Remove any auto-added file inputs and re-add selected files
    formData.delete('photos')
    for (const file of selectedFiles) {
      formData.append('photos', file)
    }

    startTransition(async () => {
      try {
        await createHallazgo(formData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (!message.includes('NEXT_REDIRECT')) {
          setError(message || 'Ocurrió un error. Intenta de nuevo.')
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fotografías
        </label>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
            selectedFiles.length >= 5 && 'opacity-50 pointer-events-none',
          )}
          onClick={() => selectedFiles.length < 5 && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.target.value = '' } }}
          />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {selectedFiles.length >= 5 ? 'Máximo 5 fotos alcanzado' : 'Arrastra fotos o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Máx 10 MB · Hasta 5 fotos</p>
        </div>
        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {previews.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-gray-100 border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del objeto encontrado <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="title" name="title" required className="pl-9" placeholder="Ej: Celular Samsung negro" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-gray-400 text-xs font-normal">(opcional)</span>
        </label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Características del objeto, color, marca, estado..."
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación donde fue encontrado <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="location" name="location" required className="pl-9" placeholder="Ej: Recepción piso 2, Sala de reuniones A" />
        </div>
      </div>

      {/* Date (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de hallazgo
        </label>
        <Input value={today} readOnly className="bg-gray-50 cursor-not-allowed text-gray-500" />
        <p className="text-xs text-gray-400 mt-1">La fecha se registra automáticamente</p>
      </div>

      {/* Team */}
      <div>
        <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
          Equipo <span className="text-red-500">*</span>
        </label>
        {!isAdmin && defaultTeamId ? (
          <>
            <input type="hidden" name="teamId" value={defaultTeamId} />
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              <Users className="h-4 w-4 text-gray-400" />
              {teams.find((t) => t.id === defaultTeamId)?.name ?? 'Mi equipo'}
            </div>
          </>
        ) : (
          <select
            id="teamId"
            name="teamId"
            required
            defaultValue={defaultTeamId ?? ''}
            className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar equipo...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          id="status"
          name="status"
          className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Hallazgo'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
