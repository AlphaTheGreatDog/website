"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Integrate auth provider logic here (e.g., NextAuth, Supabase, Firebase)
    console.log(isSignUp ? 'Signing up:' : 'Logging in:', formData)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-hybrid-bg text-hybrid-ink">
      <div className="w-full max-w-md bg-hybrid-surface border border-hybrid-border p-8 md:p-10 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-normal mb-2">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="font-sans text-sm text-hybrid-ink-muted">
            {isSignUp 
              ? 'Join Lumina for exclusive access and faster checkout.' 
              : 'Sign in to access your account and order history.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-hybrid-ink mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 bg-transparent border border-hybrid-border rounded-none text-sm focus:outline-none focus:border-hybrid-ink transition-colors placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-hybrid-ink mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 bg-transparent border border-hybrid-border rounded-none text-sm focus:outline-none focus:border-hybrid-ink transition-colors placeholder:text-gray-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold tracking-wider uppercase text-hybrid-ink">
                Password
              </label>
              {!isSignUp && (
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-hybrid-ink-muted hover:text-hybrid-ink transition-colors underline"
                >
                  Forgot?
                </Link>
              )}
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-transparent border border-hybrid-border rounded-none text-sm focus:outline-none focus:border-hybrid-ink transition-colors placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-hybrid-ink text-white font-sans text-xs tracking-widest uppercase font-bold hover:bg-black transition-colors rounded-none mt-2"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-8 pt-6 border-t border-hybrid-border text-center text-xs text-hybrid-ink-muted">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-hybrid-ink font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-hybrid-ink font-semibold hover:underline"
              >
                Create One
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
