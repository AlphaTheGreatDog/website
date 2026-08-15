import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env file.')
}

// A single, reused connection pool. Next.js can re-import this module across
// hot reloads in dev, so we keep the client on globalThis to avoid opening a
// fresh pool on every reload.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql }

const client =
  globalForDb.pgClient ??
  postgres(process.env.DATABASE_URL, {
    max: 10, // fine for a single small VPS running app + db together
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client
}

export const db = drizzle(client, { schema })