import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_CONNECTION_STRING

if (!connectionString) {
  throw new Error(
    'Missing database connection string. Set DATABASE_URL or NEON_POSTGRES_CONNECTION_STRING.',
  )
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
export { schema }
