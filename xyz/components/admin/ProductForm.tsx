'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import type { AdminActionState } from '@/lib/admin/actions'
import type { Category, Product, ProductImage } from '@/lib/db/schema'

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
  product?: Product & { images?: ProductImage[] }
  submitLabel: string
}) {
  const [state, formAction, isPending] = useActionState(action, null)
  const router = useRouter()
  // Additional gallery image URLs, beyond the single cover Image URL below.
  // Kept as local state (not defaultValue-driven inputs) so rows can be
  // added/removed dynamically before submit.
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    product?.images?.map((img) => img.url) ?? []
  )

  // The action no longer redirects itself (Server Action redirects weren't
  // reliably navigating the client here) — once it resolves with no error,
  // send the admin back to the list ourselves.
  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      router.push('/admin/products')
      router.refresh()
    }
    wasPending.current = isPending
  }, [isPending, state, router])

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
          defaultValue={product?.title ?? ''}
          className={inputClass}
          placeholder="Restorative Serum"
        />
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

      <div className="flex flex-col gap-3 border-t border-hybrid-border pt-6">
        <p className={labelClass}>Product Page Info Cards</p>
        <p className="text-xs text-hybrid-ink-muted -mt-1">
          Shown as expandable cards on the product page. Leave blank to fall back to default copy.
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="ingredients" className={labelClass}>Ingredients</label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={3}
            defaultValue={product?.ingredients ?? ''}
            className={inputClass}
            placeholder="Aqua, Glycerin, Niacinamide…"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="howToUse" className={labelClass}>How to Use</label>
          <textarea
            id="howToUse"
            name="howToUse"
            rows={3}
            defaultValue={product?.howToUse ?? ''}
            className={inputClass}
            placeholder="Apply a small amount to clean, dry skin morning and night."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="shippingReturns" className={labelClass}>Shipping &amp; Returns</label>
          <textarea
            id="shippingReturns"
            name="shippingReturns"
            rows={3}
            defaultValue={product?.shippingReturns ?? ''}
            className={inputClass}
            placeholder="Free shipping on all U.S. orders. Returns accepted within 30 days."
          />
        </div>
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
        <p className="text-xs text-hybrid-ink-muted">
          The cover image — shown in product grids, cart, and as the first photo on the product page.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-hybrid-border pt-6">
        <p className={labelClass}>Additional Images</p>
        <p className="text-xs text-hybrid-ink-muted -mt-1">
          Extra photos for the product page gallery (shown after the cover image above).
        </p>

        {galleryUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              name="galleryImageUrl"
              value={url}
              onChange={(e) => {
                const next = [...galleryUrls]
                next[index] = e.target.value
                setGalleryUrls(next)
              }}
              className={inputClass}
              placeholder="https://…"
            />
            <button
              type="button"
              onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))}
              className="flex-shrink-0 px-3 border border-hybrid-border rounded-sm hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setGalleryUrls([...galleryUrls, ''])}
          className="self-start flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted hover:text-hybrid-ink transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Image
        </button>
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
