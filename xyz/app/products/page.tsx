import Link from 'next/link'

export default function ProductListing() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-16">
      {/* Root Science Minimal Sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0">
        <h2 className="font-sans text-xs tracking-widest uppercase font-bold mb-8">Filter By</h2>
        
        <div className="mb-10">
          <h3 className="font-serif text-xl mb-4">Category</h3>
          <div className="flex flex-col gap-3 text-sm text-hybrid-ink-muted">
            <Link href="#" className="hover:text-hybrid-ink transition-colors">All Products</Link>
            <Link href="#" className="hover:text-hybrid-ink transition-colors">Skincare</Link>
            <Link href="#" className="hover:text-hybrid-ink transition-colors">Body Care</Link>
            <Link href="#" className="hover:text-hybrid-ink transition-colors">Accessories</Link>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-hybrid-border">
          <h1 className="font-serif text-3xl">All Products</h1>
          <span className="text-sm text-hybrid-ink-muted">12 Results</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(9)].map((_, i) => (
             <Link href={`/products/${i + 1}`} key={i} className="group flex flex-col cursor-pointer">
               <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border mb-4"></div>
               <h4 className="font-serif text-lg text-hybrid-ink text-center">Daily Hydrator</h4>
               <p className="text-hybrid-ink-muted text-sm text-center mt-1">$65.00</p>
             </Link>
          ))}
        </div>
      </main>
    </div>
  )
}