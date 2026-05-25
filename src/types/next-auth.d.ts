import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: 'USER' | 'ADMIN'
      teamId: string | null
      teamName: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    teamId?: string | null
    teamName?: string | null
  }
}
