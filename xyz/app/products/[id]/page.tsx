import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/db/queries'

export const revalidate = 60

// Next.js 16: params is a Promise and must be awaited.
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  if (!Number.isInteger(productId)) {
    notFound()
  }

  const product = await getProductById(productId)

  if (!product || !product.isActive) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16">
      {/* Left: Gallery */}
      <div className="w-full lg:w-1/2">
        <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100"></div>
          )}
        </div>
      </div>

      {/* Right: Details (Root Science Typography) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">{product.category.name}</p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-4">{product.title}</h1>
        <p className="text-xl mb-8">${Number(product.price).toFixed(2)}</p>

        <p className="text-hybrid-ink-muted leading-relaxed mb-8">
          {product.description ??
            'A thoughtfully made addition to your daily routine, crafted with quality materials and built to last.'}
        </p>

        {/* CTA */}
        <button
          type="button"
          disabled={product.stock <= 0}
          className="w-full bg-hybrid-ink text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm mb-12 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
        </button>

        {/* Minimal Accordion Info */}
        <div className="border-t border-hybrid-border">
          {['Ingredients', 'How to Use', 'Shipping & Returns'].map((title, i) => (
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
