'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { hashPassword, verifyPassword } from './password'
import {
  createSession,
  deleteSessionCookie,
  generateSessionToken,
  getSessionTokenFromCookie,
  getUserByEmail,
  invalidateSession,
  setSessionCookie,
} from './session'

export type AuthActionState = { error: string } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  if (!EMAIL_RE.test(email)) {
    return { error: 'Enter a valid email address.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords don\u2019t match.' }
  }

  const existing = await getUserByEmail(email)
  if (existing) {
    return { error: 'An account with that email already exists.' }
  }

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: hashPassword(password), name: name || null })
    .returning()

  const token = generateSessionToken()
  const session = await createSession(token, user.id)
  await setSessionCookie(token, session.expiresAt)

  redirect('/')
}

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter your email and password.' }
  }

  const user = await getUserByEmail(email)
  // Run verifyPassword even when there's no user, against a dummy hash, so
  // the response time doesn't reveal whether the email exists.
  const passwordOk = verifyPassword(
    password,
    user?.passwordHash ?? '0000000000000000000000000000000:00'
  )

  if (!user || !passwordOk) {
    return { error: 'Incorrect email or password.' }
  }

  const token = generateSessionToken()
  const session = await createSession(token, user.id)
  await setSessionCookie(token, session.expiresAt)

  redirect('/')
}

export async function adminLogin(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter your email and password.' }
  }

  const user = await getUserByEmail(email)
  // Same dummy-hash trick as the customer login: verifyPassword always
  // runs, so a wrong password and a role rejection resolve in the same
  // rough time and this endpoint can't be used to enumerate admin emails.
  const passwordOk = verifyPassword(
    password,
    user?.passwordHash ?? '0000000000000000000000000000000:00'
  )

  if (!user || !passwordOk) {
    return { error: 'Incorrect email or password.' }
  }

  if (user.role !== 'admin') {
    return { error: 'This account does not have admin access.' }
  }

  const token = generateSessionToken()
  const session = await createSession(token, user.id)
  await setSessionCookie(token, session.expiresAt)

  // Deliberately NOT calling redirect('/admin') here. Server Action
  // redirects don't reliably drive client-side navigation in this app's
  // setup (the cookie/session write above always completes — that's why
  // a manual refresh "fixes" it — but the follow-up navigation to /admin
  // can silently fail to happen). Returning null (= no error) signals
  // success to AdminLoginForm, which does the navigation itself with
  // router.push()/router.refresh().
  return null
}

export async function logout() {
  const token = await getSessionTokenFromCookie()
  if (token) {
    await invalidateSession(token)
  }
  await deleteSessionCookie()

  // Without this, the layout segment (which is where Header gets its
  // `user` prop from) can keep serving its cached, still-logged-in render
  // to the client even after the cookie is cleared.
  revalidatePath('/', 'layout')

  // This action is now wired up via a real <form action={logout}> submit
  // in Header.tsx rather than being called as a plain onClick handler, so
  // redirect() here is reliable — form-based Server Action invocations are
  // the case Next.js's redirect() handling is actually built around.
  // (A plain onClick + router.push() was flaky: it could leave the page
  // showing stale, still-logged-in UI until a manual navigation happened.)
  redirect('/login')
}

/** Same as logout(), just lands back on /admin/login instead of /login. */
export async function adminLogout() {
  const token = await getSessionTokenFromCookie()
  if (token) {
    await invalidateSession(token)
  }
  await deleteSessionCookie()
  revalidatePath('/', 'layout')
  redirect('/admin/login')
}
