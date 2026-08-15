'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/lib/auth/actions'

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLogin, null)
  const router = useRouter()

  // Tracks the previous isPending value so we can detect the exact
  // "just finished, no error" transition and treat it as success — the
  // server action no longer redirects itself (see lib/auth/actions.ts).
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      router.push('/admin')
      router.refresh()
    }
    wasPending.current = isPending
  }, [isPending, state, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900/60 rounded-sm px-4 py-3" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-semibold tracking-widest uppercase text-white/50">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border border-white/15 bg-white/5 text-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
          placeholder="admin@apex.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-xs font-semibold tracking-widest uppercase text-white/50">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-white/15 bg-white/5 text-white px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/30"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-hybrid-espresso py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-white/85 transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Signing In…' : 'Sign In'}
      </button>
    </form>
  )
}
