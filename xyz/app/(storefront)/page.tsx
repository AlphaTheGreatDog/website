import Link from 'next/link'
import { getActiveProductsWithCategory, getCategories } from '@/lib/db/queries'
import ProductGrid from '@/components/ProductGrid'
import Reveal from '@/components/Reveal'

// Re-fetch product data at most once a minute. Cheap on a single VPS and
// means edits made in the (future) admin panel show up without a redeploy.
export const revalidate = 60

export default async function Home() {
  const [products, categories] = await Promise.all([
    getActiveProductsWithCategory(),
    getCategories(),
  ])

  const categoryNames = [...categories.map((c) => c.name), 'New Arrivals']

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] sm:h-[75vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://familydoctor.org/wp-content/uploads/2026/07/GettyImages-2271698553.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <Reveal className="relative z-10 p-6 sm:p-8 md:p-16 max-w-2xl text-white">
          <p className="font-sans text-xs tracking-[0.2em] uppercase mb-4">Curated Collection</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight mb-6">Discover your next daily essential.</h1>
          <p className="font-sans text-base sm:text-lg mb-8 font-light text-white/90">Uniting the very best from emerging brands to deliver quality you can feel.</p>
          <Link href="/products" className="inline-block bg-white text-hybrid-ink px-8 py-3.5 text-sm font-bold tracking-wider uppercase hover:bg-gray-100 transition-colors rounded-sm">
            Start Exploring →
          </Link>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-16">
        <Reveal className="flex flex-col items-center mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl mb-8">Featured Categories</h2>
        </Reveal>

        <ProductGrid products={products} categoryNames={categoryNames} />
      </section>
    </div>
  )
}
