'use client'

import { useActionState, useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { submitContactQuery, type ContactActionState } from '@/lib/contact/actions'

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactActionState, FormData>(
    submitContactQuery,
    null
  )
  const formRef = useRef<HTMLFormElement>(null)

  // Clear the fields once the message is sent so the form doesn't sit
  // there pre-filled after a successful submission.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  if (state?.success) {
    return (
      <div
        className="max-w-lg mx-auto flex flex-col items-center text-center gap-3 p-10 bg-hybrid-surface border border-hybrid-border rounded-sm"
        role="status"
      >
        <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
        <h3 className="font-serif text-2xl">Message sent</h3>
        <p className="text-sm text-hybrid-ink-muted leading-relaxed">
          Thanks for reaching out — our team has been notified and will get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="max-w-lg mx-auto flex flex-col gap-6">
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
          required
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
        <label htmlFor="query" className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">
          Your Query
        </label>
        <textarea
          id="query"
          name="query"
          required
          rows={5}
          maxLength={5000}
          className="border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors resize-none"
          placeholder="Tell us what's on your mind…"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-hybrid-ink text-white py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
