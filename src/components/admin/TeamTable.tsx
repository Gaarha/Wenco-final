'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createTeam, updateTeam, deleteTeam } from '@/actions/team.actions'

interface Team {
  id: string
  name: string
  description: string | null
  _count: { users: number; hallazgos: number }
}

function TeamForm({
  team,
  onClose,
}: {
  team?: Team
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (team) await updateTeam(team.id, formData)
      else await createTeam(formData)
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del equipo</label>
        <Input name="name" required defaultValue={team?.name} placeholder="Ej: Equipo Operaciones" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <Textarea name="description" defaultValue={team?.description ?? ''} rows={2} placeholder="Descripción opcional..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : team ? 'Actualizar' : 'Crear equipo'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

export function TeamTable({ teams }: { teams: Team[] }) {
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" />Nuevo equipo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear equipo</DialogTitle></DialogHeader>
            <TeamForm onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuarios</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Hallazgos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{team.name}</div>
                  {team.description && <div className="text-gray-400 text-xs">{team.description}</div>}
                </td>
                <td className="px-4 py-3 text-gray-600">{team._count.users}</td>
                <td className="px-4 py-3 text-gray-600">{team._count.hallazgos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Dialog open={editingTeam?.id === team.id} onOpenChange={(open) => !open && setEditingTeam(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingTeam(team)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Editar equipo</DialogTitle></DialogHeader>
                        <TeamForm team={team} onClose={() => setEditingTeam(null)} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm(`¿Eliminar equipo "${team.name}"?`)) {
                          startTransition(async () => await deleteTeam(team.id))
                        }
                      }}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
