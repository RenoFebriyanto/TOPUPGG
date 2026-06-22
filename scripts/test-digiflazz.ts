/**
 * Script untuk test langsung ke Digiflazz staging
 * Jalankan: npx tsx scripts/test-digiflazz.ts
 *
 * Test case resmi dari CS Digiflazz:
 *   customer_no  : 087800001232
 *   sku_code     : xld10
 */
import crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const USERNAME = process.env.DIGIFLAZZ_USERNAME ?? ''
const API_KEY  = process.env.DIGIFLAZZ_API_KEY ?? ''
const BASE_URL = 'https://api.digiflazz.com/v1'
const IS_STAGING = API_KEY.startsWith('dev-')

if (!USERNAME || !API_KEY) {
  console.error('❌ DIGIFLAZZ_USERNAME atau DIGIFLAZZ_API_KEY belum diisi di .env.local')
  process.exit(1)
}

console.log(`\n=== Digiflazz Staging Test ===`)
console.log(`Username  : ${USERNAME}`)
console.log(`API Key   : ${API_KEY.substring(0, 10)}...`)
console.log(`IS_STAGING: ${IS_STAGING}`)

// ── 1. Cek Saldo ────────────────────────────────────────────────────────────
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
  return data
}

// ── 2. Daftar Harga (filter game) ────────────────────────────────────────────
async function daftarHarga() {
  console.log('\n[2] Daftar Harga (prepaid)...')
  const sign = crypto.createHash('md5').update(USERNAME + API_KEY + 'pricelist').digest('hex')
  const res = await fetch(`${BASE_URL}/price-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: 'prepaid', username: USERNAME, sign }),
  })
  const data = await res.json()
  const products = data.data ?? []
  console.log(`Total produk: ${products.length}`)

  // Filter hanya game yang relevan
  const gameKeywords = ['Mobile Legend', 'Free Fire', 'PUBG', 'Genshin', 'Honor of Kings', 'Valorant']
  const gameProducts = products.filter((p: { brand: string }) =>
    gameKeywords.some(k => p.brand?.toLowerCase().includes(k.toLowerCase()))
  )
  console.log(`Produk game (ML/FF/PUBG/dll): ${gameProducts.length}`)
  if (gameProducts.length > 0) {
    console.log('\nContoh 5 produk pertama:')
    gameProducts.slice(0, 5).forEach((p: { brand: string; product_name: string; price: number; buyer_sku_code: string; buyer_product_status: boolean }) => {
      console.log(`  - [${p.buyer_sku_code}] ${p.brand} — ${p.product_name} — Rp${p.price.toLocaleString()} | aktif: ${p.buyer_product_status}`)
    })
  }
  return gameProducts
}

// ── 3. Test Transaksi (xld10 ke 087800001232) ────────────────────────────────
async function testTransaksi() {
  console.log('\n[3] Test Transaksi ke Digiflazz Staging...')
  console.log('    SKU     : xld10')
  console.log('    Tujuan  : 087800001232')

  const refId = `test-${Date.now()}`
  const sign = crypto.createHash('md5').update(USERNAME + API_KEY + refId).digest('hex')

  const payload: Record<string, unknown> = {
    username: USERNAME,
    buyer_sku_code: 'xld10',
    customer_no: '087800001232',
    ref_id: refId,
    sign,
  }

  if (IS_STAGING) {
    payload.testing = true
    console.log('    Mode    : STAGING (testing: true)')
  }

  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  console.log('\nResponse:')
  console.log(JSON.stringify(data, null, 2))

  const status = data?.data?.status
  const message = data?.data?.message
  const sn = data?.data?.sn

  if (status === 'Sukses') {
    console.log(`\n✅ SUKSES! SN: ${sn}`)
  } else if (status === 'Pending') {
    console.log(`\n⏳ PENDING — ${message}`)
    console.log('   ref_id:', refId)
    console.log('   Kirim ref_id ini ke CS Digiflazz jika diminta')
  } else if (status === 'Gagal') {
    console.log(`\n❌ GAGAL — ${message}`)
  } else {
    console.log('\n⚠️  Status tidak dikenal atau error')
  }

  return { refId, data }
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function run() {
  try {
    await cekSaldo()
    await daftarHarga()
    const { refId, data } = await testTransaksi()

    console.log('\n=== RINGKASAN UNTUK CS DIGIFLAZZ ===')
    console.log(`Username : ${USERNAME}`)
    console.log(`API Key  : ${API_KEY}`)
    console.log(`Ref ID   : ${refId}`)
    console.log(`Status   : ${data?.data?.status ?? 'Error'}`)
    console.log(`Message  : ${data?.data?.message ?? '-'}`)
    console.log('=====================================')
    console.log('\nScreenshot output ini dan kirim ke CS Digiflazz!')
  } catch (err) {
    console.error('\n❌ Error:', err)
  }
}

run()
