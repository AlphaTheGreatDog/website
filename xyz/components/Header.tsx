"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, ShoppingBag, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { logout } from '@/lib/auth/actions'

export default function Header({ user }: { user: { email: string; name: string | null } | null }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
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

  const handleLogout = async () => {
    setIsProfileOpen(false)
    await logout()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="px-8 py-5 bg-hybrid-surface border-b border-hybrid-border flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="w-1/4">
        <Link href="/" className="font-sans text-xl tracking-[0.2em] font-bold uppercase hover:opacity-70 transition-opacity">
          L U M I N A
        </Link>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex flex-1 justify-center gap-10 text-[13px] font-semibold tracking-wider uppercase">
        <Link href="/products" className="hover:text-hybrid-ink-muted transition-colors">The Shop</Link>
        <Link href="/products" className="hover:text-hybrid-ink-muted transition-colors">Brands</Link>
        <Link href="/products" className="hover:text-hybrid-ink-muted transition-colors">About Us</Link>
      </nav>

      {/* Utilities */}
      <div className="flex items-center justify-end gap-6 w-1/4">
        <button type="button" className="hover:text-hybrid-ink-muted transition-colors cursor-pointer">
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

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-red-600 hover:text-red-700 transition-colors pt-1 w-full text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
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
          <span className="text-sm font-medium">0</span>
        </Link>
      </div>
    </header>
  )
}