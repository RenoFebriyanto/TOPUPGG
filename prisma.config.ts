import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export default defineConfig({
  ...(process.env.DATABASE_URL && {
    datasource: {
      url: process.env.DATABASE_URL,
    },
  }),
})