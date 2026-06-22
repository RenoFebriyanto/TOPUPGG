import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Format tidak valid.' }, { status: 400 })
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password baru minimal 8 karakter.' }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'Password baru harus berbeda dari password lama.' }, { status: 400 })
    }

    // Ambil password hash dari DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: 'Akun ini menggunakan login Google. Password tidak bisa diubah.' },
        { status: 400 }
      )
    }

    // Verifikasi password lama
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 400 })
    }

    // Hash dan simpan password baru
    const hashedNew = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNew },
    })

    return NextResponse.json({ message: 'Password berhasil diubah.' })
  } catch (error) {
    console.error('[CHANGE_PASSWORD_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
