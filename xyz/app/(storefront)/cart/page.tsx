import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/session'
import { getCartItemsForUser } from '@/lib/db/queries'
import CartItemRow from '@/components/CartItemRow'

export default async function Cart() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-8 py-24 text-center">
        <h1 className="font-serif text-4xl mb-4">Your Shopping Bag</h1>
        <p className="text-sm text-hybrid-ink-muted mb-8">Sign in to see what&apos;s in your bag.</p>
        <Link
          href="/login"
          className="inline-block bg-hybrid-ink text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const items = await getCartItemsForUser(user.id)
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl text-center mb-10 sm:mb-12 border-b border-hybrid-border pb-6">Your Shopping Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-hybrid-ink-muted mb-8">Your bag is empty.</p>
          <Link
            href="/products"
            className="inline-block bg-hybrid-ink text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-8 mb-12">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                productId={item.productId}
                title={item.product.title}
                imageUrl={item.product.imageUrl}
                price={item.product.price}
                quantity={item.quantity}
                stock={item.product.stock}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="flex flex-col items-end">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center mb-6 font-serif text-2xl">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-hybrid-ink-muted mb-8 text-right">Shipping and taxes calculated at checkout.</p>
              <Link
                href="/checkout"
                className="block w-full text-center bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
              >
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
