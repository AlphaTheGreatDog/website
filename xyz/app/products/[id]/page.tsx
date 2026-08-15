export default function ProductDetail() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16">
      {/* Left: Gallery */}
      <div className="w-full lg:w-1/2">
        <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center">
            {/* Image Placeholder */}
            <div className="w-full h-full bg-gray-100"></div>
        </div>
      </div>

      {/* Right: Details (Root Science Typography) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Skincare</p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-4">Restorative Night Serum</h1>
        <p className="text-xl mb-8">$85.00</p>

        <p className="text-hybrid-ink-muted leading-relaxed mb-8">
          A potent blend of active botanicals designed to rejuvenate and repair while you sleep. Wake up to skin that feels nourished and looks visibly brighter.
        </p>

        {/* CTA */}
        <button className="w-full bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm mb-12">
          Add to Bag
        </button>

        {/* Minimal Accordion Info */}
        <div className="border-t border-hybrid-border">
          {[ 'Ingredients', 'How to Use', 'Shipping & Returns' ].map((title, i) => (
            <div key={i} className="border-b border-hybrid-border py-4 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity">
              <span className="font-serif text-lg">{title}</span>
              <span className="text-xl font-light">+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}