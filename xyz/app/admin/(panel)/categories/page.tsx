import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCategories } from '@/lib/db/queries'
import { deleteCategoryAction } from '@/lib/admin/actions'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl mb-1">Categories</h1>
          <p className="text-sm text-hybrid-ink-muted">{categories.length} total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-hybrid-ink text-white px-5 py-3 text-xs font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      <div className="bg-hybrid-surface border border-hybrid-border rounded-sm overflow-hidden">
        {categories.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-hybrid-ink-muted">
            No categories yet. Create your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted border-b border-hybrid-border">
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Slug</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-hybrid-border last:border-0">
                  <td className="px-6 py-3">
                    <Link href={`/admin/categories/${c.id}`} className="font-medium hover:text-hybrid-ink-muted transition-colors">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-hybrid-ink-muted">{c.slug}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted hover:text-hybrid-ink transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCategoryAction.bind(null, c.id)}
                        confirmMessage={`Delete "${c.name}"? This can't be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
