import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createTransaction, IS_STAGING } from '@/lib/digiflazz'

// Endpoint khusus development untuk test transaksi ke Digiflazz staging
// Menggunakan test case resmi dari CS Digiflazz:
//   customer_no : 087800001232
//   buyer_sku_code : xld10
// Hanya bisa diakses di mode staging dan oleh ADMIN
export async function POST() {
  if (!IS_STAGING) {
    return NextResponse.json(
      { error: 'Test endpoint hanya tersedia di mode staging.' },
      { status: 403 }
    )
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const refId = `test-${Date.now()}`
    const appUrl = process.env.AUTH_URL ?? 'http://localhost:3000'

    const result = await createTransaction({
      skuCode: 'xld10',
      customerNo: '087800001232',
      refId,
      callbackUrl: `${appUrl}/api/digiflazz/webhook`,
    })

    return NextResponse.json({
      success: true,
      message: 'Test transaction sent to Digiflazz staging.',
      result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
