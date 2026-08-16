import Link from 'next/link'
import { Package, Tags, Users, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react'
import { getDashboardStats, getLowStockProductsAdmin } from '@/lib/db/queries'
import StatCard from '@/components/admin/StatCard'

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default async function AdminDashboardPage() {
  const [stats, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getLowStockProductsAdmin(),
  ])

  return (
    <div>
      <div className="mb-6 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl mb-1">Dashboard</h1>
        <p className="text-sm text-hybrid-ink-muted">An overview of the store.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-10">
        <StatCard
          label="Products"
          value={String(stats.totalProducts)}
          hint={`${stats.activeProducts} active`}
          icon={Package}
        />
        <StatCard label="Categories" value={String(stats.totalCategories)} icon={Tags} />
        <StatCard
          label="Users"
          value={String(stats.totalCustomers + stats.totalAdmins)}
          hint={`${stats.totalCustomers} customers · ${stats.totalAdmins} admins`}
          icon={Users}
        />
        <StatCard
          label="Low Stock"
          value={String(stats.lowStockCount)}
          hint={`${stats.lowStockThreshold} units or fewer`}
          icon={AlertTriangle}
          tone={stats.lowStockCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Inventory Value"
          value={money(stats.inventoryValue)}
          hint="Retail value of active stock (est.)"
          icon={DollarSign}
        />
        <StatCard
          label="In Carts"
          value={money(stats.cartValue)}
          hint="Value sitting in open carts (est.)"
          icon={ShoppingBag}
        />
      </div>

      <div className="bg-hybrid-surface border border-hybrid-border rounded-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-hybrid-border">
          <h2 className="font-serif text-xl">Low Stock</h2>
          <Link href="/admin/products" className="text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted hover:text-hybrid-ink transition-colors">
            View all products
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-hybrid-ink-muted">
            Nothing running low right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted border-b border-hybrid-border">
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-hybrid-border last:border-0">
                    <td className="px-6 py-3">
                      <Link href={`/admin/products/${p.id}`} className="hover:text-hybrid-ink-muted transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-hybrid-ink-muted">{p.category.name}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-700'}`}>
                      {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
