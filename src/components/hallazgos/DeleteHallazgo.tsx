'use client'

import { useTransition, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteHallazgo } from '@/actions/hallazgo.actions'
import { Button } from '@/components/ui/button'

interface DeleteHallazgoProps {
  hallazgoId: string
}

export function DeleteHallazgo({ hallazgoId }: DeleteHallazgoProps) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  if (!confirm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirm(true)}
        className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-400"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">¿Confirmar eliminación?</span>
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await deleteHallazgo(hallazgoId)
          })
        }}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sí, eliminar'}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setConfirm(false)} disabled={isPending}>
        Cancelar
      </Button>
    </div>
  )
}
