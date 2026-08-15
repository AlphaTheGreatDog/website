'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart/actions'

export default function AddToCartButton({
  productId,
  stock,
  initialCartQuantity = 0,
}: {
  productId: number
  /** Current stock as of page load — the server action re-checks this live before actually adding. */
  stock: number
  /** How many of this product the signed-in user already has in their cart, if any. */
  initialCartQuantity?: number
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)
  // Tracked locally so repeated clicks in the same visit stay capped at
  // stock client-side too, without waiting on a full page revalidation.
  const [cartQuantity, setCartQuantity] = useState(initialCartQuantity)
  const router = useRouter()

  const outOfStock = stock <= 0
  const atMax = cartQuantity >= stock

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await addToCart(productId, 1)
      if (result && 'authRequired' in result) {
        router.push('/login')
        return
      }
      if (result?.error) {
        setError(result.error)
        return
      }
      setCartQuantity((q) => q + 1)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1800)
    })
  }

  const label = outOfStock
    ? 'Out of Stock'
    : isPending
      ? 'Adding…'
      : justAdded
        ? 'Added to Bag ✓'
        : atMax
          ? 'Max Available in Bag'
          : 'Add to Bag'

  return (
    <div className="mb-12">
      <button
        type="button"
        onClick={handleClick}
        disabled={outOfStock || atMax || isPending}
        className="w-full bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {label}
      </button>
      {!outOfStock && cartQuantity > 0 && (
        <p className="text-xs text-hybrid-ink-muted mt-3">{cartQuantity} in your bag</p>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
