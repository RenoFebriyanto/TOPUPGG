import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyMidtransSignature } from '@/lib/midtrans'
import { createTransaction } from '@/lib/digiflazz'

// Midtrans mengirim notifikasi ke endpoint ini setelah pembayaran
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = body

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verifikasi signature untuk mencegah spoofing
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    )

    if (!isValid) {
      console.error('[WEBHOOK] Invalid signature for order:', order_id)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Cari order di database
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    })

    if (!order) {
      console.error('[WEBHOOK] Order not found:', order_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Jika sudah SUCCESS, skip (idempotent)
    if (order.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Already processed' })
    }

    // Tentukan apakah pembayaran berhasil
    const isPaid =
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    const isFraud = fraud_status === 'challenge' || fraud_status === 'deny'
    const isExpired =
      transaction_status === 'expire' || transaction_status === 'cancel'
    const isFailed = transaction_status === 'deny' || transaction_status === 'failure'

    if (isPaid && !isFraud) {
      // Pembayaran berhasil → update paymentStatus, lalu proses top up ke Digiflazz
      await prisma.order.update({
        where: { id: order_id },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      })

      // Proses transaksi ke Digiflazz
      try {
        const refId = `${order_id}-${Date.now()}`
        // Kirim cb_url agar Digiflazz bisa callback ke endpoint webhook kita
        const appUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? ''
        const txResult = await createTransaction({
          skuCode: order.productCode,
          customerNo: order.gameUserId,
          refId,
          callbackUrl: appUrl ? `${appUrl}/api/digiflazz/webhook` : undefined,
        })

        const statusMap: Record<string, 'SUCCESS' | 'FAILED' | 'PROCESSING'> = {
          Sukses: 'SUCCESS',
          Gagal: 'FAILED',
          Pending: 'PROCESSING',
        }
        const finalStatus = statusMap[txResult.status] ?? 'PROCESSING'

        await prisma.order.update({
          where: { id: order_id },
          data: {
            status: finalStatus,
            digiflazzRef: refId,
            sn: txResult.sn || null,
          },
        })
      } catch (txError) {
        console.error('[WEBHOOK] Digiflazz transaction failed:', txError)
        await prisma.order.update({
          where: { id: order_id },
          data: { status: 'FAILED' },
        })
      }
    } else if (isExpired) {
      await prisma.order.update({
        where: { id: order_id },
        data: { paymentStatus: 'EXPIRED', status: 'FAILED' },
      })
    } else if (isFailed || isFraud) {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('[WEBHOOK_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
