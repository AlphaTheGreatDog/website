'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeFromCart, updateCartItemQuantity } from '@/lib/cart/actions'

type CartItemRowProps = {
  productId: number
  title: string
  imageUrl: string | null
  price: string
  quantity: number
  stock: number
}

export default function CartItemRow({ productId, title, imageUrl, price, quantity, stock }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const changeQuantity = (next: number) => {
    setError(null)
    startTransition(async () => {
      const result = await updateCartItemQuantity(productId, next)
      if (result && 'authRequired' in result) {
        router.push('/login')
        return
      }
      if (result?.error) {
        setError(result.error)
        return
      }
    })
  }

  const handleRemove = () => {
    setError(null)
    startTransition(async () => {
      const result = await removeFromCart(productId)
      if (result && 'authRequired' in result) {
        router.push('/login')
      }
    })
  }

  return (
    <div className="flex gap-6 items-center border-b border-hybrid-border pb-8">
      <div className="w-24 h-32 bg-hybrid-surface border border-hybrid-border flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1">
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="text-sm text-hybrid-ink-muted mt-1">${Number(price).toFixed(2)} each</p>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center border border-hybrid-border rounded-sm">
            <button
              type="button"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={isPending}
              className="px-3 py-1 text-sm hover:bg-hybrid-surface transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-4 text-sm min-w-[2.5rem] text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={isPending || quantity >= stock}
              className="px-3 py-1 text-sm hover:bg-hybrid-surface transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs uppercase tracking-widest underline hover:text-hybrid-ink-muted disabled:opacity-50"
          >
            Remove
          </button>
        </div>

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>

      <div className="font-sans text-lg">${(Number(price) * quantity).toFixed(2)}</div>
    </div>
  )
}
