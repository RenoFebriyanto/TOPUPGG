import crypto from 'crypto'
import { prisma } from '@/lib/db'
import {
  type DigiflazzProduct,
  type DigiflazzTransaction,
  groupProductsByGame,
  SUPPORTED_GAMES,
} from './digiflazz-shared'

const BASE_URL = 'https://api.digiflazz.com/v1'
const USERNAME = process.env.DIGIFLAZZ_USERNAME ?? ''
const API_KEY = process.env.DIGIFLAZZ_API_KEY ?? ''
export const WEBHOOK_SECRET = process.env.DIGIFLAZZ_WEBHOOK_SECRET ?? ''

function createSignature(suffix: string): string {
  return crypto
    .createHash('md5')
    .update(USERNAME + API_KEY + suffix)
    .digest('hex')
}

const DEFAULT_PRICE_MARKUP_PERCENT = 0.10

function getSellPrice(basePrice: number): number {
  const markupPercent = Number(process.env.PRICE_MARKUP_PERCENT ?? DEFAULT_PRICE_MARKUP_PERCENT)
  const markupValue = Number.isFinite(markupPercent) ? markupPercent : DEFAULT_PRICE_MARKUP_PERCENT
  return Math.round(basePrice * (1 + markupValue))
}

function enrichProductsWithSellPrice(products: DigiflazzProduct[]): DigiflazzProduct[] {
  return products.map((product) => ({
    ...product,
    sell_price: getSellPrice(product.price),
  }))
}

async function getSavedProductsFromDb(): Promise<DigiflazzProduct[] | null> {
  const rows = await prisma.digiflazzProduct.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 1000,
  })

  if (!rows?.length) return null
  return rows.map((row) => row.product as DigiflazzProduct)
}

async function saveProductsToDb(products: DigiflazzProduct[]) {
  const operations = products.map((product) =>
    prisma.digiflazzProduct.upsert({
      where: { buyerSkuCode: product.buyer_sku_code },
      update: { product },
      create: {
        buyerSkuCode: product.buyer_sku_code,
        game: product.brand,
        product,
      },
    })
  )
  await Promise.allSettled(operations)
}

export async function getProducts(): Promise<DigiflazzProduct[]> {
  const signature = createSignature('pricelist')
  const res = await fetch(`${BASE_URL}/price-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'prepaid', username: USERNAME, sign: signature }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const saved = await getSavedProductsFromDb()
    if (saved) {
      console.warn('[DIGIFLAZZ] Price list fetch failed, using DB cache', res.status)
      return saved
    }
    throw new Error(`Digiflazz API error: ${res.status}`)
  }

  const data = await res.json()
  const isDataArray = Array.isArray(data.data)
  if (!isDataArray) {
    console.log('[DIGIFLAZZ_RAW]', JSON.stringify(data).substring(0, 300))
  }

  const rc = data?.data?.rc ?? data?.rc
  const message = data?.data?.message ?? data?.message ?? ''

  if (rc === '83') {
    const saved = await getSavedProductsFromDb()
    if (saved) {
      console.warn('[DIGIFLAZZ] Rate limited, using DB cache')
      return saved
    }
    throw new Error('Rate limit Digiflazz: terlalu banyak request. Coba lagi sebentar.')
  }

  if (rc && !isDataArray) {
    const saved = await getSavedProductsFromDb()
    if (saved) {
      console.warn('[DIGIFLAZZ] Error response, using DB cache', rc, message)
      return saved
    }
    throw new Error(`Digiflazz error rc=${rc}: ${message}`)
  }

  const products = data.data ?? data ?? []
  if (!Array.isArray(products)) {
    const saved = await getSavedProductsFromDb()
    if (saved) {
      console.warn('[DIGIFLAZZ] Response format invalid, using DB cache')
      return saved
    }
    throw new Error(`Format response tidak valid: ${JSON.stringify(data).substring(0, 200)}`)
  }

  const enrichedProducts = enrichProductsWithSellPrice(products as DigiflazzProduct[])
  await saveProductsToDb(enrichedProducts)
  return enrichedProducts
}

export async function checkBalance(): Promise<number> {
  const signature = createSignature('depo')
  const res = await fetch(`${BASE_URL}/cek-saldo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'deposit', username: USERNAME, sign: signature }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Digiflazz balance check error: ${res.status}`)
  const data = await res.json()
  return data.data?.deposit ?? 0
}

export async function createTransaction({
  skuCode,
  customerNo,
  refId,
  callbackUrl,
}: {
  skuCode: string
  customerNo: string
  refId: string
  callbackUrl?: string
}): Promise<DigiflazzTransaction> {
  const signature = createSignature(refId)

  const payload: Record<string, unknown> = {
    username: USERNAME,
    buyer_sku_code: skuCode,
    customer_no: customerNo,
    ref_id: refId,
    sign: signature,
  }

  if (callbackUrl) {
    payload.cb_url = callbackUrl
  }

  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Digiflazz transaction error: ${res.status}`)
  const data = await res.json()
  return data.data as DigiflazzTransaction
}

export async function checkTransactionStatus(
  refId: string,
  skuCode: string,
  customerNo: string,
): Promise<DigiflazzTransaction> {
  const signature = createSignature(refId)
  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: USERNAME,
      buyer_sku_code: skuCode,
      customer_no: customerNo,
      ref_id: refId,
      sign: signature,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Digiflazz status check error: ${res.status}`)
  const data = await res.json()
  return data.data as DigiflazzTransaction
}

export { groupProductsByGame, SUPPORTED_GAMES }
