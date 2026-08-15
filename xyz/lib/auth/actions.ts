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

export async function logout() {
  const token = await getSessionTokenFromCookie()
  if (token) {
    await invalidateSession(token)
  }
  await deleteSessionCookie()

  // Without this, the layout segment (which is where Header gets its
  // `user` prop from) can keep serving its cached, still-logged-in render
  // to the client even after the cookie is cleared — the profile button
  // reopens the account popup instead of switching to the sign-in icon,
  // and pages that gate on auth (like /cart) end up demanding another
  // login even though logout genuinely worked server-side.
  //
  // Deliberately not calling redirect() here: this action is invoked as a
  // plain function from a button's onClick (like the cart actions), not
  // via a <form action>, and redirect() thrown from that context doesn't
  // always reach the client cleanly. The client does the navigation.
  revalidatePath('/', 'layout')
}
