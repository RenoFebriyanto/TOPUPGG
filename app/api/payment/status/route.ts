import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId wajib diisi.' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        productName: true,
        gameUserId: true,
        amount: true,
        status: true,
        paymentStatus: true,
        sn: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan.' }, { status: 404 })
    }

    // User hanya boleh cek order miliknya sendiri
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('[ORDER_STATUS_ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
