import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import { hashPassword } from '../lib/auth/password'

// Usage:
//   pnpm db:seed:admin
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... ADMIN_NAME="Your Name" pnpm db:seed:admin
//
// Idempotent: re-running just promotes the existing account to 'admin'
// rather than erroring or creating a duplicate.
const email = (process.env.ADMIN_EMAIL ?? 'admin@apex.com').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? 'apex1234'
const name = process.env.ADMIN_NAME ?? 'Admin'

async function seedAdmin() {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`${email} is already an admin. Nothing to do.`)
    } else {
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, existing.id))
      console.log(`Promoted existing user ${email} to admin.`)
    }
    process.exit(0)
  }

  await db.insert(users).values({
    email,
    passwordHash: hashPassword(password),
    name,
    role: 'admin',
  })

  console.log(`Created admin user:`)
  console.log(`  email:    ${email}`)
  console.log(`  password: ${password}`)
  console.log(`Sign in at /admin/login — change the password after first login.`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('Admin seed failed:', err)
  process.exit(1)
})
