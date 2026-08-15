import { randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sessions, users, type User } from '@/lib/db/schema'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
const RENEW_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15 // renew if <15 days left

export function generateSessionToken(): string {
  return randomBytes(20).toString('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(token: string, userId: number) {
  const id = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await db.insert(sessions).values({ id, userId, expiresAt })
  return { id, userId, expiresAt }
}

export type SessionValidationResult =
  | { session: typeof sessions.$inferSelect; user: User }
  | { session: null; user: null }

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const id = hashToken(token)

  const row = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: { user: true },
  })

  if (!row) return { session: null, user: null }

  if (Date.now() >= row.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, id))
    return { session: null, user: null }
  }

  // Sliding expiration: push the expiry out when the session is getting
  // close to expiring, so active users don't get logged out mid-use. Must
  // also re-set the cookie itself — extending the DB row alone doesn't
  // change the `expires` attribute already stored in the browser's cookie.
  if (Date.now() >= row.expiresAt.getTime() - RENEW_THRESHOLD_MS) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, id))
    row.expiresAt = newExpiresAt
    await setSessionCookie(token, newExpiresAt)
  }

  const { user, ...session } = row
  return { session, user }
}

export async function invalidateSession(token: string) {
  const id = hashToken(token)
  await db.delete(sessions).where(eq(sessions.id, id))
}

// ---------------------------------------------------------------------------
// Cookie helpers — httpOnly so client JS can never read the token.
//
// `secure` is controlled by COOKIE_SECURE rather than assumed from
// NODE_ENV, because a lot of VPS deployments serve over plain HTTP by IP
// before a domain + TLS (nginx/certbot etc.) is set up. A cookie marked
// `secure` is silently dropped by the browser on a non-HTTPS origin, which
// breaks login in a very confusing way (login "succeeds" but the session
// never comes back). Set COOKIE_SECURE=true once the site is served over
// HTTPS.
// ---------------------------------------------------------------------------
const isSecureCookie = process.env.COOKIE_SECURE === 'true'

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function deleteSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function getSessionTokenFromCookie(): Promise<string | null> {
  const store = await cookies()
  return store.get(SESSION_COOKIE_NAME)?.value ?? null
}

/** Look up the current user from the request's session cookie, if any. */
export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionTokenFromCookie()
  if (!token) return null

  const { user } = await validateSessionToken(token)
  return user
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) })
}
