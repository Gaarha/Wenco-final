import { cn, STATUS_CONFIG } from '@/lib/utils'

interface HallazgoStatusBadgeProps {
  status: keyof typeof STATUS_CONFIG
  className?: string
}

export function HallazgoStatusBadge({ status, className }: HallazgoStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
