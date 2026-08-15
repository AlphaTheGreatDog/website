import { getCategories } from '@/lib/db/queries'
import { createProductAction } from '@/lib/admin/actions'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-3xl mb-1">New Product</h1>
        <p className="text-sm text-hybrid-ink-muted">Add a new item to the catalog.</p>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-hybrid-ink-muted">
          You need at least one category before you can create a product.{' '}
          <a href="/admin/categories/new" className="underline hover:text-hybrid-ink transition-colors">
            Create one first
          </a>
          .
        </p>
      ) : (
        <ProductForm action={createProductAction} categories={categories} submitLabel="Create Product" />
      )}
    </div>
  )
}
