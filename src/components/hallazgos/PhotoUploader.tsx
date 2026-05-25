'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploaderProps {
  maxFiles?: number
  maxSizeMB?: number
}

export function PhotoUploader({ maxFiles = 5, maxSizeMB = 10 }: PhotoUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const filesArray = Array.from(newFiles).filter((f) => {
        if (!f.type.startsWith('image/')) return false
        if (f.size > maxSizeMB * 1024 * 1024) return false
        return true
      })

      setSelectedFiles((prev) => {
        const remaining = maxFiles - prev.length
        const toAdd = filesArray.slice(0, remaining)
        const newPreviews = toAdd.map((f) => URL.createObjectURL(f))
        setPreviews((p) => [...p, ...newPreviews])
        return [...prev, ...toAdd]
      })
    },
    [maxFiles, maxSizeMB],
  )

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const syncInputFiles = () => {
    if (!inputRef.current) return
    const dt = new DataTransfer()
    selectedFiles.forEach((f) => dt.items.add(f))
    inputRef.current.files = dt.files
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="photos-input"
        type="file"
        name="photos"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
        onFocus={syncInputFiles}
      />

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          selectedFiles.length >= maxFiles && 'opacity-50 pointer-events-none',
        )}
        onClick={() => {
          if (selectedFiles.length < maxFiles) inputRef.current?.click()
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">
          {selectedFiles.length >= maxFiles
            ? `Máximo ${maxFiles} fotos alcanzado`
            : 'Arrastra fotos aquí o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PNG, JPG, WEBP · Máx {maxSizeMB} MB · Hasta {maxFiles} fotos
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden bg-gray-100 border">
              <img src={url} alt={selectedFiles[index]?.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
