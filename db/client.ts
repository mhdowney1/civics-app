import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Db = NeonHttpDatabase<typeof schema>

let cached: Db | null = null

function getDb(): Db {
  if (cached) return cached
  const connectionString =
    process.env.DATABASE_URL ?? process.env.NEON_POSTGRES_CONNECTION_STRING
  if (!connectionString) {
    throw new Error(
      'Missing database connection string. Set DATABASE_URL or NEON_POSTGRES_CONNECTION_STRING.',
    )
  }
  const sql = neon(connectionString)
  cached = drizzle(sql, { schema })
  return cached
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
}) as Db

export { schema }
