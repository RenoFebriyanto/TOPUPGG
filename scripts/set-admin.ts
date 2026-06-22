import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  // Tampilkan semua user
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  })

  console.log('\n=== USER LIST ===')
  if (users.length === 0) {
    console.log('Tidak ada user. Daftar dulu di http://localhost:3000/auth/register')
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} | ${u.name} | role: ${u.role}`)
    })
  }

  // Set semua user jadi ADMIN (untuk testing)
  // Ganti email di bawah jika mau spesifik
  const TARGET_EMAIL = process.env.ADMIN_EMAIL ?? users[0]?.email

  if (!TARGET_EMAIL) {
    console.log('\nTidak ada user untuk dijadikan admin.')
    return
  }

  const updated = await prisma.user.update({
    where: { email: TARGET_EMAIL },
    data: { role: 'ADMIN' },
    select: { email: true, name: true, role: true },
  })

  console.log(`\n✅ User ${updated.email} sekarang role: ${updated.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
