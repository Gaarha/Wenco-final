'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createUser, updateUser, deleteUser } from '@/actions/user.actions'

interface Team { id: string; name: string }
interface UserRow {
  id: string
  name: string
  email: string
  role: string
  team: Team | null
  teamId: string | null
}

interface UserTableProps {
  users: UserRow[]
  teams: Team[]
}

function UserForm({
  user,
  teams,
  onClose,
}: {
  user?: UserRow
  teams: Team[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (user) {
        await updateUser(user.id, formData)
      } else {
        await createUser(formData)
      }
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
        <Input name="name" required defaultValue={user?.name} placeholder="Juan Pérez" />
      </div>
      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <Input name="email" type="email" required placeholder="usuario@empresa.com" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {user ? 'Nueva contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
        </label>
        <Input
          name="password"
          type="password"
          required={!user}
          minLength={user ? 0 : 6}
          placeholder={user ? '••••••••' : 'Mínimo 6 caracteres'}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select
          name="role"
          defaultValue={user?.role ?? 'USER'}
          className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="USER">Usuario</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
        <select
          name="teamId"
          defaultValue={user?.teamId ?? ''}
          className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sin equipo</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : user ? 'Actualizar' : 'Crear usuario'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  )
}

export function UserTable({ users, teams }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" />Nuevo usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear usuario</DialogTitle></DialogHeader>
            <UserForm teams={teams} onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Usuario</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-400 text-xs">{user.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.team?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      <ShieldCheck className="h-3 w-3" />Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      <User className="h-3 w-3" />Usuario
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Editar usuario</DialogTitle></DialogHeader>
                        <UserForm user={user} teams={teams} onClose={() => setEditingUser(null)} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${user.name}?`)) {
                          startTransition(async () => await deleteUser(user.id))
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
