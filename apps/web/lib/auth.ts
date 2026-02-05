import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@repo/database'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/es/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const email = String(credentials.email)
          const password = String(credentials.password)
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
              active: true,
              passwordHash: true,
              isSuperAdmin: true,
            },
          })
          if (!user || !user.active || !user.passwordHash) return null
          const valid = await bcrypt.compare(password, user.passwordHash)
          if (!valid) return null
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.avatarUrl ?? undefined,
            isSuperAdmin: user.isSuperAdmin ?? false,
          }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) return false
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isSuperAdmin: true },
      })
      if (dbUser?.isSuperAdmin) return true
      const orgMember = await prisma.orgMember.findFirst({
        where: { userId: user.id, active: true },
      })
      return !!orgMember
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email ?? undefined
        token.name = user.name ?? undefined
        const isSuperAdmin = (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false
        if (isSuperAdmin) {
          token.isSuperAdmin = true
          token.role = 'SUPER_ADMIN'
          return token
        }
        const orgMember = await prisma.orgMember.findFirst({
          where: { userId: user.id, active: true },
          include: { organization: true },
          orderBy: { createdAt: 'asc' },
        })
        if (orgMember) {
          token.orgId = orgMember.orgId
          token.orgMemberId = orgMember.id
          token.role = orgMember.role
          token.orgName = orgMember.organization.name
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.email = token.email ?? ''
        session.user.name = token.name ?? ''
        session.user.isSuperAdmin = token.isSuperAdmin as boolean | undefined
        session.user.orgId = token.orgId as string | undefined
        session.user.orgMemberId = token.orgMemberId as string | undefined
        session.user.role = token.role as 'OWNER' | 'ADMIN' | 'EDITOR' | 'ACCOUNTANT' | 'VIEWER' | 'SUPER_ADMIN' | undefined
        session.user.orgName = token.orgName as string | undefined
      }
      return session
    },
  },
})
