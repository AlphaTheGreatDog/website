import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCategories } from '@/lib/db/queries'
import { deleteCategoryAction } from '@/lib/admin/actions'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl mb-1">Categories</h1>
          <p className="text-sm text-hybrid-ink-muted">{categories.length} total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center justify-center gap-2 bg-hybrid-ink text-white px-5 py-3 text-xs font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-hybrid-surface border border-hybrid-border rounded-sm">
          <p className="px-6 py-10 text-center text-sm text-hybrid-ink-muted">
            No categories yet. Create your first one.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {categories.map((c) => (
              <div key={c.id} className="bg-hybrid-surface border border-hybrid-border rounded-sm p-4">
                <Link href={`/admin/categories/${c.id}`} className="font-medium hover:text-hybrid-ink-muted transition-colors">
                  {c.name}
                </Link>
                <p className="text-xs text-hybrid-ink-muted mt-1 mb-4">{c.slug}</p>
                <div className="flex items-center justify-between pt-3 border-t border-hybrid-border">
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
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-hybrid-surface border border-hybrid-border rounded-sm overflow-x-auto">
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
          </div>
        </>
      )}
    </div>
  )
}
