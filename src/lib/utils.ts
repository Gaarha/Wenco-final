import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES')
}

export const STATUS_CONFIG = {
  ENCONTRADO: { label: 'Encontrado', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  RECLAMADO: { label: 'Reclamado', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  DEVUELTO: { label: 'Devuelto', className: 'bg-green-100 text-green-800 border-green-200' },
} as const
