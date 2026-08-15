import { createCategoryAction } from '@/lib/admin/actions'
import CategoryForm from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-3xl mb-1">New Category</h1>
        <p className="text-sm text-hybrid-ink-muted">Add a new category to the catalog.</p>
      </div>

      <CategoryForm action={createCategoryAction} submitLabel="Create Category" />
    </div>
  )
}
