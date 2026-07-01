import { cn } from '@/lib/utils'

interface StockBadgeProps {
  quantity: number
  minStock: number
}

export function StockBadge({ quantity, minStock }: StockBadgeProps) {
  const isOut = quantity === 0
  const isLow = !isOut && quantity <= minStock

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isOut && 'bg-red-100 text-red-800 border-red-200',
        isLow && 'bg-orange-100 text-orange-800 border-orange-200',
        !isOut && !isLow && 'bg-green-100 text-green-800 border-green-200',
      )}
    >
      {quantity} {isOut ? '· Agotado' : isLow ? '· Stock bajo' : 'en stock'}
    </span>
  )
}
