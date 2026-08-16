import Link from 'next/link'
import { getActiveProductsWithCategory, getCategories } from '@/lib/db/queries'
import Reveal from '@/components/Reveal'

export const revalidate = 60

// Next.js 16: searchParams is a Promise and must be awaited.
export default async function ProductListing({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const [products, categories] = await Promise.all([
    getActiveProductsWithCategory(),
    getCategories(),
  ])

  const filteredProducts = category
    ? products.filter((p) => p.category.slug === category)
    : products

  const activeCategoryName = category
    ? categories.find((c) => c.slug === category)?.name
    : undefined

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-16">
      {/* Root Science Minimal Sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0">
        <h2 className="font-sans text-xs tracking-widest uppercase font-bold mb-8">Filter By</h2>

        <div className="mb-10">
          <h3 className="font-serif text-xl mb-4">Category</h3>
          <div className="flex flex-col gap-3 text-sm text-hybrid-ink-muted">
            <Link
              href="/products"
              className={`hover:text-hybrid-ink transition-colors ${!category ? 'text-hybrid-ink font-semibold' : ''}`}
            >
              All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className={`hover:text-hybrid-ink transition-colors ${category === c.slug ? 'text-hybrid-ink font-semibold' : ''}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-hybrid-border">
          <h1 className="font-serif text-3xl">{activeCategoryName ?? 'All Products'}</h1>
          <span className="text-sm text-hybrid-ink-muted">{filteredProducts.length} Results</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((item, index) => (
              <Reveal key={item.id} delay={(index % 6) * 70}>
                <Link href={`/products/${item.id}`} className="group flex flex-col cursor-pointer">
                  <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border mb-4 relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100"></div>
                    )}

                    {item.badge && (
                      <div className="absolute top-4 right-4 bg-hybrid-ink text-white text-[10px] uppercase tracking-wider font-bold w-14 h-14 rounded-full flex items-center justify-center text-center p-1 leading-tight">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif text-lg text-hybrid-ink text-center">{item.title}</h4>
                  <p className="text-hybrid-ink-muted text-sm text-center mt-1">${Number(item.price).toFixed(2)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-hybrid-ink-muted">No products found in this category.</div>
        )}
      </main>
    </div>
  )
}
