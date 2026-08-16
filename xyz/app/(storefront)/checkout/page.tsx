import Link from 'next/link'
import { Hammer } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function CheckoutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-8 py-24 sm:py-32 text-center">
      <Reveal className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-hybrid-surface border border-hybrid-border flex items-center justify-center">
          <Hammer className="w-6 h-6 stroke-[1.5]" />
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Checkout</p>
          <h1 className="font-serif text-3xl sm:text-4xl mb-4">We&apos;re still building this page.</h1>
          <p className="text-hybrid-ink-muted leading-relaxed">
            Checkout and billing aren&apos;t ready yet. Your bag is saved, so come back soon to complete your order.
          </p>
        </div>

        <Link
          href="/cart"
          className="inline-block bg-hybrid-ink text-white px-8 py-3.5 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
        >
          Back to Bag
        </Link>
      </Reveal>
    </div>
  )
}
