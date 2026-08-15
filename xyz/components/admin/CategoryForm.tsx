'use client'

import { useActionState, useState } from 'react'
import type { AdminActionState } from '@/lib/admin/actions'
import type { Category } from '@/lib/db/schema'
import { slugify } from '@/lib/utils/slugify'

const inputClass =
  'border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors w-full'
const labelClass = 'text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted'

export default function CategoryForm({
  action,
  category,
  submitLabel,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>
  category?: Category
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-md">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={inputClass}
          placeholder="Skincare"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className={labelClass}>Slug</label>
        <input
          id="slug"
          name="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(e.target.value)
          }}
          className={inputClass}
          placeholder="skincare"
        />
        <p className="text-xs text-hybrid-ink-muted">Auto-generated from the name unless you edit it.</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto self-start bg-hybrid-ink text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
