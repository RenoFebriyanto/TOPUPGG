import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, role } = await req.json()
  if (!userId || !['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Cegah admin mencabut role dirinya sendiri
  if (userId === session.user.id && role === 'USER') {
    return NextResponse.json({ error: 'Tidak bisa mengubah role akun sendiri.' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return NextResponse.json({ success: true, role: user.role })
}
