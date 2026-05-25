'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    teamName?: string | null
    role: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="font-medium text-gray-900">{user.name}</span>
          {user.teamName && (
            <span className="text-gray-400">· {user.teamName}</span>
          )}
          {user.role === 'ADMIN' && (
            <span className="ml-1 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              Admin
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-gray-500 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  )
}
