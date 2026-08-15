'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({
  action,
  confirmMessage,
  label = 'Delete',
}: {
  action: () => Promise<{ error: string } | null>
  confirmMessage: string
  label?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = () => {
    if (!window.confirm(confirmMessage)) return
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result?.error) {
        setError(result.error)
      } else {
        // Belt-and-suspenders: make sure the row actually disappears
        // without needing a manual refresh.
        router.refresh()
      }
    })
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-red-600 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {isPending ? 'Deleting…' : label}
      </button>
      {error && <p className="text-xs text-red-600 max-w-[220px] text-right">{error}</p>}
    </div>
  )
}
