import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { team: true },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          teamName: user.team?.name ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { role?: string; teamId?: string | null; teamName?: string | null }
        token.role = u.role
        token.teamId = u.teamId
        token.teamName = u.teamName
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER'
      session.user.teamId = token.teamId as string | null
      session.user.teamName = token.teamName as string | null
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
