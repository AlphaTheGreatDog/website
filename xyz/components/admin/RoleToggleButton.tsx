'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { setUserRoleAction } from '@/lib/admin/actions'
import type { Role } from '@/lib/db/schema'

export default function RoleToggleButton({ userId, role }: { userId: number; role: Role }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const nextRole: Role = role === 'admin' ? 'customer' : 'admin'
  const confirmMessage =
    nextRole === 'admin'
      ? 'Grant this user admin access to the panel?'
      : 'Remove admin access from this user?'

  const handleClick = () => {
    if (!window.confirm(confirmMessage)) return
    setError(null)
    startTransition(async () => {
      const result = await setUserRoleAction(userId, nextRole)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          role === 'admin' ? 'text-hybrid-ink-muted hover:text-red-600' : 'text-hybrid-ink-muted hover:text-hybrid-ink'
        }`}
      >
        {role === 'admin' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
        {isPending ? 'Updating…' : role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
      </button>
      {error && <p className="text-xs text-red-600 max-w-[220px] text-right">{error}</p>}
    </div>
  )
}
