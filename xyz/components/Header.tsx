"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, ShoppingBag, User, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth/actions'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

export default function Header({
  user,
  cartCount,
}: {
  user: { email: string; name: string | null } | null
  cartCount: number
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Check if user is currently on the login page
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!isProfileOpen) return

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsProfileOpen(false)
    }

    // mousedown + touchstart covers both mouse and touch/mobile browsers
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isProfileOpen])

  // Close the mobile menu on route change, and don't let it persist open
  // if someone rotates back to desktop width.
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const closeMenuOnSubmit = () => setIsProfileOpen(false)

  return (
    <header className="bg-hybrid-surface border-b border-hybrid-border sticky top-0 z-50">
      <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden hover:text-hybrid-ink-muted transition-colors cursor-pointer p-1 -ml-1"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
        </button>

        {/* Logo */}
        <div className="md:w-1/4">
          <Link href="/" className="font-sans text-lg sm:text-xl tracking-[0.2em] font-bold uppercase hover:opacity-70 transition-opacity">
            X Y Z
          </Link>
        </div>

        {/* Navigation (desktop) */}
        <nav className="hidden md:flex flex-1 justify-center gap-10 text-[13px] font-semibold tracking-wider uppercase">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-hybrid-ink-muted transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex items-center justify-end gap-4 sm:gap-6 md:w-1/4">
          <button type="button" className="hidden sm:inline-flex hover:text-hybrid-ink-muted transition-colors cursor-pointer">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Profile / Account (hidden on /login) */}
          {!isLoginPage && user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="hover:text-hybrid-ink-muted transition-colors flex items-center focus:outline-none cursor-pointer p-1"
                aria-expanded={isProfileOpen}
                aria-label="User account menu"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Account Profile Popup */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-hybrid-surface border border-hybrid-border shadow-lg py-3 px-4 z-[100] flex flex-col gap-2 rounded-sm text-left">
                  <p className="text-xs text-hybrid-ink font-medium truncate pb-2 border-b border-hybrid-border">
                    {user.name || user.email}
                  </p>

                  <form action={logout} onSubmit={closeMenuOnSubmit}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-red-600 hover:text-red-700 transition-colors pt-1 w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {!isLoginPage && !user && (
            <Link
              href="/login"
              className="hover:text-hybrid-ink-muted transition-colors flex items-center p-1"
              aria-label="Sign in"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          )}

          <Link href="/cart" className="relative hover:text-hybrid-ink-muted transition-colors flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            <span className="text-sm font-medium">{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Navigation (mobile) */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden flex flex-col border-t border-hybrid-border px-4 py-2 text-sm font-semibold tracking-wider uppercase"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 border-b border-hybrid-border last:border-b-0 hover:text-hybrid-ink-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
