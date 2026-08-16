'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { AdminActionState } from '@/lib/admin/actions'
import type { ContactInfo } from '@/lib/db/schema'

const inputClass =
  'border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors w-full'
const labelClass = 'text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted'

export default function ContactForm({
  action,
  contact,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>
  contact: ContactInfo | null
}) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [justSaved, setJustSaved] = useState(false)

  // This is a single settings page (not a list-backed form), so on success
  // we just show a brief confirmation and stay put rather than navigating
  // away like the product/category forms do.
  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      setJustSaved(true)
      const timeout = setTimeout(() => setJustSaved(false), 2500)
      return () => clearTimeout(timeout)
    }
    wasPending.current = isPending
  }, [isPending, state])

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="heading" className={labelClass}>Heading</label>
        <input
          id="heading"
          name="heading"
          type="text"
          required
          defaultValue={contact?.heading ?? 'Get in Touch'}
          className={inputClass}
          placeholder="Get in Touch"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          defaultValue={contact?.message ?? ''}
          className={inputClass}
          placeholder="We'd love to hear from you — reach out any time."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ''}
            className={inputClass}
            placeholder="hello@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            defaultValue={contact?.phone ?? ''}
            className={inputClass}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className={labelClass}>Address</label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={contact?.address ?? ''}
          className={inputClass}
          placeholder="123 Market Street, San Francisco, CA 94103"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto self-start bg-hybrid-ink text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
        {justSaved && <span className="text-sm text-green-700">Saved.</span>}
      </div>
    </form>
  )
}
