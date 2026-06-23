/**
 * Script untuk test langsung ke Digiflazz production/staging
 * Jalankan: npm run digiflazz:test
 */
import crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const USERNAME = process.env.DIGIFLAZZ_USERNAME ?? ''
const API_KEY  = process.env.DIGIFLAZZ_API_KEY ?? ''
const BASE_URL = 'https://api.digiflazz.com/v1'

if (!USERNAME || !API_KEY) {
  console.error('❌ DIGIFLAZZ_USERNAME atau DIGIFLAZZ_API_KEY belum diisi')
  process.exit(1)
}

console.log(`\n=== Digiflazz API Test ===`)
console.log(`Username : ${USERNAME}`)
console.log(`API Key  : ${API_KEY.substring(0, 10)}...`)

// ── 1. Cek Saldo ─────────────────────────────────────────────────────────────
async function cekSaldo() {
  console.log('\n[1] Cek Saldo...')
  const sign = crypto.createHash('md5').update(USERNAME + API_KEY + 'depo').digest('hex')
  const res = await fetch(`${BASE_URL}/cek-saldo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'deposit', username: USERNAME, sign }),
  })
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
}

// ── 2. Daftar Harga ───────────────────────────────────────────────────────────
async function daftarHarga() {
  console.log('\n[2] Daftar Harga (prepaid)...')
  // Format signature untuk price list: MD5(username + apikey + "pricelist")
  const sign = crypto.createHash('md5').update(USERNAME + API_KEY + 'pricelist').digest('hex')
  const res = await fetch(`${BASE_URL}/price-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'prepaid', username: USERNAME, sign }),
  })
  const raw = await res.json()
  const products = raw.data ?? raw

  if (!Array.isArray(products)) {
    console.log('Response raw:', JSON.stringify(raw, null, 2))
    return []
  }

  console.log(`Total produk: ${products.length}`)

  // Filter game yang relevan
  const keywords = ['mobile legend', 'free fire', 'pubg', 'genshin', 'honor of kings', 'valorant']
  const gameProducts = products.filter((p: { brand?: string }) =>
    keywords.some(k => p.brand?.toLowerCase().includes(k))
  )

  console.log(`\nProduk game ditemukan: ${gameProducts.length}`)

  // Tampilkan unique brands
  const brands = [...new Set(gameProducts.map((p: { brand: string }) => p.brand))]
  console.log('\nBrand names di API Digiflazz:')
  brands.forEach(b => console.log(`  - "${b}"`))

  // Tampilkan 3 produk pertama per brand
  console.log('\nContoh produk per brand:')
  brands.forEach(brand => {
    const items = gameProducts
      .filter((p: { brand: string }) => p.brand === brand)
      .slice(0, 3)
    console.log(`\n  ${brand}:`)
    items.forEach((p: { buyer_sku_code: string; product_name: string; price: number; buyer_product_status: boolean }) => {
      console.log(`    [${p.buyer_sku_code}] ${p.product_name} — Rp${p.price.toLocaleString()} | aktif: ${p.buyer_product_status}`)
    })
  })

  return gameProducts
}

async function run() {
  try {
    await cekSaldo()
    await daftarHarga()
  } catch (err) {
    console.error('\n❌ Error:', err)
  }
}

run()
