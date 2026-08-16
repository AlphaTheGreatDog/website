'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Tags, Users, Mail, Info } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/about', label: 'About Us', icon: Info },
  { href: '/admin/contact', label: 'Contact Us', icon: Mail },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        // exact match for /admin so it doesn't stay "active" on every sub-route
        const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-colors ${
              isActive
                ? 'bg-white text-hybrid-espresso font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4 stroke-[1.5]" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
