'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateHallazgoStatus } from '@/actions/hallazgo.actions'
import { STATUS_CONFIG } from '@/lib/utils'

interface StatusUpdaterProps {
  hallazgoId: string
  currentStatus: keyof typeof STATUS_CONFIG
}

export function StatusUpdater({ hallazgoId, currentStatus }: StatusUpdaterProps) {
  const [selected, setSelected] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleChange = (status: keyof typeof STATUS_CONFIG) => {
    if (status === selected) return
    setSelected(status)
    startTransition(async () => {
      await updateHallazgoStatus(hallazgoId, status)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map((status) => {
        const config = STATUS_CONFIG[status]
        return (
          <button
            key={status}
            type="button"
            onClick={() => handleChange(status)}
            disabled={isPending}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              selected === status
                ? `${config.className} border-current`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            } disabled:opacity-50`}
          >
            {config.label}
          </button>
        )
      })}
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
    </div>
  )
}
