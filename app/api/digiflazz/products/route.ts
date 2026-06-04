import { NextResponse } from 'next/server'
import { getProducts, groupProductsByGame } from '@/lib/digiflazz'

export async function GET() {
  try {
    const products = await getProducts()
    const grouped = groupProductsByGame(products)

    return NextResponse.json({
      success: true,
      data: grouped,
      total: products.length,
    })
  } catch (error) {
    console.error('[DIGIFLAZZ_PRODUCTS_ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil daftar produk.' },
      { status: 500 }
    )
  }
}