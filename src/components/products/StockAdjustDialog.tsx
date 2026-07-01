'use client'

import { useState, useTransition } from 'react'
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adjustStock } from '@/actions/product.actions'

export function StockAdjustDialog({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await adjustStock(productId, formData)
        setOpen(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4" />
          Ajustar stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajustar stock</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento</label>
            <select
              name="type"
              required
              className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ENTRADA">Entrada (agregar stock)</option>
              <option value="SALIDA">Salida (reducir stock)</option>
              <option value="AJUSTE">Ajuste de inventario</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <Input name="quantity" type="number" min="1" step="1" required placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota <span className="text-gray-400 text-xs font-normal">(opcional)</span></label>
            <Textarea name="note" rows={2} placeholder="Motivo del movimiento..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar movimiento'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
