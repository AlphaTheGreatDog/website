'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/auth/actions'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="max-w-md mx-auto px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl mb-3">Welcome back.</h1>
        <p className="text-sm text-hybrid-ink-muted">Sign in to continue to your account.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors"
            placeholder="jane@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
              Password
            </label>
            <Link href="#" className="text-xs text-hybrid-ink-muted underline hover:text-hybrid-ink transition-colors">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-hybrid-ink text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Signing In…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-hybrid-ink-muted mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-hybrid-ink underline hover:text-hybrid-ink-muted transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
