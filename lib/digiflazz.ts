import crypto from 'crypto'

const BASE_URL = 'https://api.digiflazz.com/v1'
const USERNAME = process.env.DIGIFLAZZ_USERNAME!
const API_KEY = process.env.DIGIFLAZZ_API_KEY!

function createSignature(suffix: string): string {
  return crypto
    .createHash('md5')
    .update(USERNAME + API_KEY + suffix)
    .digest('hex')
}

export type DigiflazzProduct = {
  product_name: string
  category: string
  brand: string
  type: string
  seller_name: string
  price: number
  buyer_sku_code: string
  buyer_product_status: boolean
  seller_product_status: boolean
  unlimited_stock: boolean
  stock: number
  multi: boolean
  start_cut_off: string
  end_cut_off: string
  desc: string
}

export type DigiflazzTransaction = {
  ref_id: string
  customer_no: string
  buyer_sku_code: string
  message: string
  status: 'Sukses' | 'Gagal' | 'Pending'
  rc: string
  buyer_last_saldo: number
  sn: string
  price: number
  tele: string
  wa: string
}

export async function getProducts(): Promise<DigiflazzProduct[]> {
  const signature = createSignature('pricelist')

  const res = await fetch(`${BASE_URL}/price-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: 'prepaid',
      username: USERNAME,
      sign: signature,
    }),
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Digiflazz API error: ${res.status}`)

  const data = await res.json()
  return data.data as DigiflazzProduct[]
}

export async function checkBalance(): Promise<number> {
  const signature = createSignature('depo')

  const res = await fetch(`${BASE_URL}/cek-saldo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cmd: 'deposit',
      username: USERNAME,
      sign: signature,
    }),
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
}: {
  skuCode: string
  customerNo: string
  refId: string
}): Promise<DigiflazzTransaction> {
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

  if (!res.ok) throw new Error(`Digiflazz transaction error: ${res.status}`)

  const data = await res.json()
  return data.data as DigiflazzTransaction
}

export const SUPPORTED_GAMES: Record<string, {
  label: string
  icon: string
  color: string
  tag: string
  brands: string[]
}> = {
  mobile_legends: {
    label: 'Mobile Legends',
    icon: '⚔️',
    color: 'from-blue-600 to-blue-800',
    tag: 'MOBA',
    brands: ['Mobile Legends', 'MOBILE LEGEND'],
  },
  free_fire: {
    label: 'Free Fire',
    icon: '🔥',
    color: 'from-orange-500 to-red-700',
    tag: 'Battle Royale',
    brands: ['Free Fire', 'FREE FIRE', 'Garena Free Fire'],
  },
  pubg_mobile: {
    label: 'PUBG Mobile',
    icon: '🎯',
    color: 'from-yellow-600 to-amber-800',
    tag: 'Battle Royale',
    brands: ['PUBG Mobile', 'PUBG MOBILE', 'Pubg Mobile'],
  },
  genshin_impact: {
    label: 'Genshin Impact',
    icon: '✨',
    color: 'from-sky-500 to-indigo-700',
    tag: 'RPG',
    brands: ['Genshin Impact', 'GENSHIN IMPACT'],
  },
  honor_of_kings: {
    label: 'Honor of Kings',
    icon: '👑',
    color: 'from-purple-600 to-purple-900',
    tag: 'MOBA',
    brands: ['Honor of Kings', 'HONOR OF KINGS'],
  },
  valorant: {
    label: 'Valorant',
    icon: '💥',
    color: 'from-red-600 to-rose-900',
    tag: 'FPS',
    brands: ['Valorant', 'VALORANT'],
  },
}

export function groupProductsByGame(
  products: DigiflazzProduct[]
): Record<string, DigiflazzProduct[]> {
  const grouped: Record<string, DigiflazzProduct[]> = {}

  for (const [gameKey, gameInfo] of Object.entries(SUPPORTED_GAMES)) {
    const filtered = products.filter((p) =>
      gameInfo.brands.some((brand) =>
        p.brand?.toLowerCase().includes(brand.toLowerCase())
      ) && p.buyer_product_status && p.seller_product_status
    )

    if (filtered.length > 0) {
      grouped[gameKey] = filtered.sort((a, b) => a.price - b.price)
    }
  }

  return grouped
}