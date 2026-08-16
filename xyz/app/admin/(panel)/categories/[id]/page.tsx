import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/db/queries'
import { updateCategoryAction } from '@/lib/admin/actions'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id)) notFound()

  const category = await getCategoryById(id)
  if (!category) notFound()

  return (
    <div>
      <div className="mb-6 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl mb-1">Edit Category</h1>
        <p className="text-sm text-hybrid-ink-muted">{category.name}</p>
      </div>

      <CategoryForm action={updateCategoryAction.bind(null, id)} category={category} submitLabel="Save Changes" />
    </div>
  )
}
