'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addToCart } from '@/lib/cart/actions'

export default function AddToCartButton({
  productId,
  inStock,
}: {
  productId: number
  inStock: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await addToCart(productId, 1)
      if (result?.error) {
        setError(result.error)
        return
      }
      setJustAdded(true)
      router.refresh()
      setTimeout(() => setJustAdded(false), 1800)
    })
  }

  return (
    <div className="mb-12">
      <button
        type="button"
        onClick={handleClick}
        disabled={!inStock || isPending}
        className="w-full bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!inStock ? 'Out of Stock' : isPending ? 'Adding…' : justAdded ? 'Added to Bag ✓' : 'Add to Bag'}
      </button>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
