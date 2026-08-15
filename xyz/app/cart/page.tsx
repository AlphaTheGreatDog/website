import Link from 'next/link'

export default function Cart() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <h1 className="font-serif text-4xl text-center mb-12 border-b border-hybrid-border pb-6">Your Shopping Bag</h1>
      
      <div className="flex flex-col gap-8 mb-12">
        {/* Item */}
        <div className="flex gap-6 items-center border-b border-hybrid-border pb-8">
          <div className="w-24 h-32 bg-hybrid-surface border border-hybrid-border flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="font-serif text-xl">Restorative Night Serum</h3>
            <p className="text-sm text-hybrid-ink-muted mt-1">30 ml / 1 oz</p>
            <button className="text-xs uppercase tracking-widest underline mt-4 hover:text-hybrid-ink-muted">Remove</button>
          </div>
          <div className="font-sans text-lg">$85.00</div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col items-end">
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-6 font-serif text-2xl">
            <span>Subtotal</span>
            <span>$85.00</span>
          </div>
          <p className="text-sm text-hybrid-ink-muted mb-8 text-right">Shipping and taxes calculated at checkout.</p>
          <button className="w-full bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm">
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}