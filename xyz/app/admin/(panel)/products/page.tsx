import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllProductsAdmin } from '@/lib/db/queries'
import { deleteProductAction } from '@/lib/admin/actions'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl mb-1">Products</h1>
          <p className="text-sm text-hybrid-ink-muted">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-hybrid-ink text-white px-5 py-3 text-xs font-bold tracking-widest uppercase hover:bg-hybrid-ink-muted transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-hybrid-surface border border-hybrid-border rounded-sm">
          <p className="px-6 py-10 text-center text-sm text-hybrid-ink-muted">
            No products yet. Create your first one.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="bg-hybrid-surface border border-hybrid-border rounded-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-hybrid-ink-muted transition-colors">
                    {p.title}
                  </Link>
                  <span
                    className={`flex-shrink-0 inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                      p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-hybrid-ink-muted mb-3">{p.category?.name ?? '—'}</p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span>${Number(p.price).toFixed(2)}</span>
                  <span className={p.stock <= 5 ? 'text-amber-700 font-semibold' : 'text-hybrid-ink-muted'}>
                    {p.stock} in stock
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-hybrid-border">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted hover:text-hybrid-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteProductAction.bind(null, p.id)}
                    confirmMessage={`Delete "${p.title}"? This can't be undone.`}
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
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold text-right">Price</th>
                  <th className="px-6 py-3 font-semibold text-right">Stock</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-hybrid-border last:border-0">
                    <td className="px-6 py-3">
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-hybrid-ink-muted transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-hybrid-ink-muted">{p.category?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-right">${Number(p.price).toFixed(2)}</td>
                    <td className={`px-6 py-3 text-right ${p.stock <= 5 ? 'text-amber-700 font-semibold' : ''}`}>
                      {p.stock}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                          p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted hover:text-hybrid-ink transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteProductAction.bind(null, p.id)}
                          confirmMessage={`Delete "${p.title}"? This can't be undone.`}
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
