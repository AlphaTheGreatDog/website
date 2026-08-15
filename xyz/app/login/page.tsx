'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: wire this up to real authentication once there's a users table
    // and a session mechanism (e.g. cookies-based sessions or an auth
    // library). For now this just simulates success so the UI/flow can be
    // reviewed, then sends the person home.
    await new Promise((resolve) => setTimeout(resolve, 400))
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl mb-3">Welcome back.</h1>
        <p className="text-sm text-hybrid-ink-muted">Sign in to continue to your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-hybrid-ink text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing In…' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-hybrid-ink-muted mt-8">
        Don&apos;t have an account?{' '}
        <Link href="#" className="text-hybrid-ink underline hover:text-hybrid-ink-muted transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
