'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Users, Layers, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: string
}

const navItems = [
  { href: '/hallazgos', label: 'Hallazgos', icon: Package },
  { href: '/hallazgos/nuevo', label: 'Nuevo Hallazgo', icon: LayoutDashboard },
]

const adminItems = [
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/equipos', label: 'Equipos', icon: Layers },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Plataforma</h1>
        <p className="text-xs text-gray-400 mt-0.5">Hallazgos</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Principal</p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href || (href === '/hallazgos' && pathname.startsWith('/hallazgos') && pathname !== '/hallazgos/nuevo')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        {userRole === 'ADMIN' && (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Administración</p>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
