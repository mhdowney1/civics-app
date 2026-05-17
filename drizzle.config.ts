import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

loadEnvConfig(process.cwd())

const connectionString =
  process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_CONNECTION_STRING

if (!connectionString) {
  throw new Error(
    'Missing database connection string. Set DATABASE_URL or NEON_POSTGRES_CONNECTION_STRING.',
  )
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
})
