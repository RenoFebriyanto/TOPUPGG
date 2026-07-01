import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createTransaction, checkTransactionStatus } from '@/lib/digiflazz-server'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId wajib diisi.' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan.' }, { status: 404 })
    }

    // Hanya pemilik order yang boleh retry
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Hanya bisa retry jika status PROCESSING atau PENDING + sudah dibayar
    const canRetry =
      order.paymentStatus === 'PAID' &&
      (order.status === 'PROCESSING' || order.status === 'FAILED')

    if (!canRetry) {
      return NextResponse.json(
        { error: 'Order ini tidak dapat di-retry.' },
        { status: 400 }
      )
    }

    const statusMap: Record<string, 'SUCCESS' | 'FAILED' | 'PROCESSING'> = {
      Sukses: 'SUCCESS',
      Gagal: 'FAILED',
      Pending: 'PROCESSING',
    }

    // Jika sudah ada digiflazzRef → cek status dulu ke Digiflazz (idempotent)
    if (order.digiflazzRef) {
      try {
        const txStatus = await checkTransactionStatus(
          order.digiflazzRef,
          order.productCode,
          order.gameUserId,
        )
        const resolvedStatus = statusMap[txStatus.status] ?? 'PROCESSING'

        if (resolvedStatus === 'SUCCESS') {
          const updated = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'SUCCESS', sn: txStatus.sn || order.sn || null },
          })
          return NextResponse.json({
            success: true,
            status: updated.status,
            sn: updated.sn,
            message: 'Transaksi ditemukan sukses di Digiflazz.',
          })
        }

        if (resolvedStatus === 'FAILED') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' },
          })
          return NextResponse.json({
            success: false,
            status: 'FAILED',
            message: 'Transaksi sudah dicatat gagal oleh Digiflazz.',
          })
        }

        // Masih PROCESSING di Digiflazz → update DB dan return info
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' },
        })
        return NextResponse.json({
          success: false,
          status: 'PROCESSING',
          message: 'Transaksi masih diproses oleh Digiflazz. Coba lagi beberapa saat.',
        })
      } catch {
        // Gagal cek status — lanjut ke kirim ulang
      }
    }

    // Belum ada ref atau cek status gagal → kirim transaksi baru ke Digiflazz
    const newRefId = `${order.id}-retry-${Date.now()}`

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING', digiflazzRef: newRefId },
    })

    try {
      const appUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? ''
      const txResult = await createTransaction({
        skuCode: order.productCode,
        customerNo: order.gameUserId,
        refId: newRefId,
        callbackUrl: appUrl ? `${appUrl}/api/digiflazz/webhook` : undefined,
      })

      const finalStatus = statusMap[txResult.status] ?? 'PROCESSING'
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: finalStatus,
          sn: txResult.sn || null,
          digiflazzRef: newRefId,
        },
      })

      return NextResponse.json({
        success: finalStatus === 'SUCCESS',
        status: updated.status,
        sn: updated.sn,
        message: txResult.message,
      })
    } catch {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: 'Retry gagal diproses. Hubungi support.' },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('[RETRY_ERROR]', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    )
  }
}
