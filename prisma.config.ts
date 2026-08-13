import { defineConfig } from 'prisma/config'

// ⚠️ Pon tu URL REAL de Neon aquí (reemplaza con tu URL)
const DATABASE_URL = "postgresql://neondb_owner:npg_rvhf8AJ9uoPl@ep-dark-dream-avx1ivpt-pooler.c-11.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: DATABASE_URL,
  },
})