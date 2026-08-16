'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { AdminActionState } from '@/lib/admin/actions'
import type { AboutInfo } from '@/lib/db/schema'

const inputClass =
  'border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors w-full'
const labelClass = 'text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted'

export default function AboutForm({
  action,
  about,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>
  about: AboutInfo | null
}) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [justSaved, setJustSaved] = useState(false)

  // Single settings page, not list-backed — show a brief confirmation and
  // stay put on success rather than navigating away.
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
          defaultValue={about?.heading ?? 'About Us'}
          className={inputClass}
          placeholder="About Us"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className={labelClass}>Story</label>
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={about?.body ?? ''}
          className={inputClass}
          placeholder="Tell customers who you are, what you make, and why it matters."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="imageUrl" className={labelClass}>Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={about?.imageUrl ?? ''}
          className={inputClass}
          placeholder="https://…"
        />
        <p className="text-xs text-hybrid-ink-muted">Optional photo shown alongside the story.</p>
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
