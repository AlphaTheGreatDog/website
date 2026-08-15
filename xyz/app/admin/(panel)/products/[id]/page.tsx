import { notFound } from 'next/navigation'
import { getCategories, getProductById } from '@/lib/db/queries'
import { updateProductAction } from '@/lib/admin/actions'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id)) notFound()

  const [product, categories] = await Promise.all([getProductById(id), getCategories()])
  if (!product) notFound()

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-3xl mb-1">Edit Product</h1>
        <p className="text-sm text-hybrid-ink-muted">{product.title}</p>
      </div>

      <ProductForm
        action={updateProductAction.bind(null, id)}
        categories={categories}
        product={product}
        submitLabel="Save Changes"
      />
    </div>
  )
}
