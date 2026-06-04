import type { DefaultSession } from 'next-auth'

// Definisikan manual — JANGAN import dari @prisma/client
// karena types baru tersedia SETELAH `npx prisma generate`
// Harus selaras dengan UserRole di lib/auth.ts
type UserRole = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}