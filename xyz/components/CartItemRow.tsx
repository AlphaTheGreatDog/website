'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

  const productHref = `/products/${productId}`

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center border-b border-hybrid-border pb-8">
      <div className="flex gap-4 sm:contents">
        <Link
          href={productHref}
          className="w-20 h-28 sm:w-24 sm:h-32 bg-hybrid-surface border border-hybrid-border flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
          aria-label={`View ${title}`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : null}
        </Link>

        <div className="flex-1 sm:hidden">
          <Link href={productHref} className="hover:opacity-70 transition-opacity">
            <h3 className="font-serif text-xl">{title}</h3>
          </Link>
          <p className="text-sm text-hybrid-ink-muted mt-1">${Number(price).toFixed(2)} each</p>
          <p className="font-sans text-base mt-2">${(Number(price) * quantity).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1">
        <Link href={productHref} className="hidden sm:inline-block hover:opacity-70 transition-opacity">
          <h3 className="font-serif text-xl">{title}</h3>
        </Link>
        <p className="hidden sm:block text-sm text-hybrid-ink-muted mt-1">${Number(price).toFixed(2)} each</p>

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

      <div className="hidden sm:block font-sans text-lg">${(Number(price) * quantity).toFixed(2)}</div>
    </div>
  )
}
