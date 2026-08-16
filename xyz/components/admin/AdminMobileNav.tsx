'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminMobileNav({
  adminLabel,
  logoutAction,
}: {
  adminLabel: string
  logoutAction: () => Promise<void>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer whenever the route changes, and don't let it persist
  // open if the viewport is resized back up to desktop width.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll while the drawer is open so the page behind it
  // doesn't scroll along with it on mobile.
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <div className="md:hidden sticky top-0 z-40 bg-hybrid-espresso text-white">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/admin" className="block" onClick={() => setIsOpen(false)}>
          <p className="font-sans text-base tracking-[0.2em] font-bold uppercase text-white">X Y Z</p>
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/40 mt-0.5">Admin Panel</p>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1 hover:text-white/70 transition-colors cursor-pointer"
          aria-expanded={isOpen}
          aria-controls="admin-mobile-nav"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
        </button>
      </div>

      {isOpen && (
        <div
          id="admin-mobile-nav"
          className="border-t border-white/10 flex flex-col py-6"
        >
          <AdminSidebar onNavigate={() => setIsOpen(false)} />

          <div className="mt-6 px-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 truncate px-4">Signed in as</p>
            <p className="text-sm text-white truncate mb-4 px-4">{adminLabel}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 text-xs font-semibold tracking-wider uppercase text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
