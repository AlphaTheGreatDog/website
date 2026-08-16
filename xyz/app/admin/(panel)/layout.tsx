import { requireAdmin } from '@/lib/auth/admin'
import { adminLogout } from '@/lib/auth/actions'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminMobileNav from '@/components/admin/AdminMobileNav'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-hybrid-bg text-hybrid-ink">
      {/* Top bar + slide-down drawer nav (mobile only) */}
      <AdminMobileNav adminLabel={admin.name || admin.email} logoutAction={adminLogout} />

      {/* Sidebar (desktop only) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-hybrid-espresso text-white flex-col py-8">
        <Link href="/admin" className="px-8 mb-10 block">
          <p className="font-sans text-lg tracking-[0.2em] font-bold uppercase text-white">X Y Z</p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mt-1">Admin Panel</p>
        </Link>

        <AdminSidebar />

        <div className="mt-auto px-4 pt-8">
          <div className="border-t border-white/10 pt-4 px-4">
            <p className="text-xs text-white/40 truncate">Signed in as</p>
            <p className="text-sm text-white truncate mb-4">{admin.name || admin.email}</p>
            <form action={adminLogout}>
              <button
                type="submit"
                className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  )
}
