'use client'

import { useActionState, useState } from 'react'
import type { AdminActionState } from '@/lib/admin/actions'
import type { Category, Product } from '@/lib/db/schema'
import { slugify } from '@/lib/utils/slugify'

const BADGES = ['', 'Best Seller', 'New', 'Award Winner']

const inputClass =
  'border border-hybrid-border bg-hybrid-surface px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-hybrid-ink transition-colors w-full'
const labelClass = 'text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted'

export default function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>
  categories: Category[]
  product?: Product
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, null)
  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className={labelClass}>Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
          placeholder="Restorative Serum"
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
          placeholder="restorative-serum"
        />
        <p className="text-xs text-hybrid-ink-muted">Auto-generated from the title unless you edit it.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ''}
          className={inputClass}
          placeholder="A short description shown on the product page."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="price" className={labelClass}>Price (USD)</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price ?? ''}
            className={inputClass}
            placeholder="48.00"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="stock" className={labelClass}>Stock</label>
          <input
            id="stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={product?.stock ?? 0}
            className={inputClass}
            placeholder="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="categoryId" className={labelClass}>Category</label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ''}
            className={inputClass}
          >
            <option value="" disabled>Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="badge" className={labelClass}>Badge</label>
          <select id="badge" name="badge" defaultValue={product?.badge ?? ''} className={inputClass}>
            {BADGES.map((b) => (
              <option key={b} value={b}>{b || 'None'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="imageUrl" className={labelClass}>Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl ?? ''}
          className={inputClass}
          placeholder="https://…"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="w-4 h-4 accent-hybrid-ink"
        />
        <span className="text-sm">Active — visible on the storefront</span>
      </label>

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
