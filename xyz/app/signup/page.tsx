'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signup } from '@/lib/auth/actions'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="max-w-md mx-auto px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl mb-3">Create your account.</h1>
        <p className="text-sm text-hybrid-ink-muted">Join to save your bag and track orders.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
            {state.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors"
            placeholder="Jane Doe"
          />
        </div>

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
          <label htmlFor="password" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={mismatch}
            className={`border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none transition-colors ${
              mismatch ? 'border-red-400 focus:border-red-500' : 'border-hybrid-border focus:border-hybrid-ink'
            }`}
            placeholder="Re-enter your password"
          />
          {mismatch && <p className="text-xs text-red-600">Passwords don&apos;t match.</p>}
        </div>

        <button
          type="submit"
          disabled={isPending || mismatch}
          className="w-full bg-hybrid-ink text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-hybrid-ink-muted mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-hybrid-ink underline hover:text-hybrid-ink-muted transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
