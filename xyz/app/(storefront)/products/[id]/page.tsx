import { notFound } from 'next/navigation'
import { getCartItem, getProductById } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import AddToCartButton from '@/components/AddToCartButton'
import ProductAccordion from '@/components/ProductAccordion'
import ProductGallery from '@/components/ProductGallery'
import Reveal from '@/components/Reveal'

// Stock changes whenever someone checks out or an admin edits it, so this
// page can't sit behind a long ISR window — the whole point of task 2 is
// that what's shown here (and checked before adding to cart) reflects the
// *current* stock, not a value that might be up to a minute stale.
export const revalidate = 0

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

  const [product, user] = await Promise.all([getProductById(productId), getCurrentUser()])

  if (!product || !product.isActive) {
    notFound()
  }

  const existingCartItem = user ? await getCartItem(user.id, productId) : null
  const cartQuantity = existingCartItem?.quantity ?? 0

  // Cover image first, then any additional gallery images, deduped in case
  // an admin also re-added the cover URL as one of the gallery rows.
  // Trimmed defensively — a URL saved with stray whitespace would otherwise
  // dedupe incorrectly or slip past the Boolean() check inconsistently.
  const galleryUrls = product.images?.map((img) => img.url.trim()) ?? []
  const allImages = [product.imageUrl?.trim(), ...galleryUrls].filter(
    (url, index, arr): url is string => Boolean(url) && arr.indexOf(url) === index
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col lg:flex-row gap-10 lg:gap-16">
      {/* Left: Gallery */}
      <Reveal className="w-full lg:w-1/2">
        <ProductGallery images={allImages} title={product.title} />
      </Reveal>

      {/* Right: Details (Root Science Typography) */}
      <Reveal delay={150} className="w-full lg:w-1/2 flex flex-col justify-center">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">{product.category.name}</p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-4">{product.title}</h1>
        <p className="text-xl mb-8">${Number(product.price).toFixed(2)}</p>

        <p className="text-hybrid-ink-muted leading-relaxed mb-8">
          {product.description ??
            'A thoughtfully made addition to your daily routine, crafted with quality materials and built to last.'}
        </p>

        {/* Stock status */}
        <p
          className={`text-xs font-semibold tracking-widest uppercase mb-4 ${
            product.stock <= 0
              ? 'text-red-600'
              : product.stock <= 5
                ? 'text-amber-700'
                : 'text-hybrid-ink-muted'
          }`}
        >
          {product.stock <= 0
            ? 'Out of stock'
            : product.stock <= 5
              ? `Only ${product.stock} left in stock`
              : 'In stock'}
        </p>

        {/* CTA */}
        <AddToCartButton
          productId={product.id}
          stock={product.stock}
          initialCartQuantity={cartQuantity}
        />

        {/* Expandable info cards */}
        <ProductAccordion
          sections={[
            { title: 'Ingredients', content: product.ingredients },
            { title: 'How to Use', content: product.howToUse },
            { title: 'Shipping & Returns', content: product.shippingReturns },
          ]}
        />
      </Reveal>
    </div>
  )
}
