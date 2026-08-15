import { redirect } from 'next/navigation'
import { getCurrentUser } from './session'
import type { User } from '@/lib/db/schema'

/**
 * Server-side guard for admin pages and admin server actions.
 *
 * Redirects to /admin/login if there's no session at all, or if the
 * session belongs to a user whose role isn't 'admin' — a logged-in
 * customer hitting an admin URL gets bounced the same as a logged-out
 * visitor, rather than a 403 that would confirm the route exists.
 *
 * Called both from the (panel) layout (so every nested page is covered)
 * and again inside each server action, since a layout guard only runs on
 * navigation/render — it doesn't re-run for a Server Action invoked
 * directly from client JS.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    redirect('/admin/login')
  }
  return user
}
