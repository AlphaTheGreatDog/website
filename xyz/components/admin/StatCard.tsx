import type { LucideIcon } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: 'default' | 'warning'
}) {
  return (
    <div className="bg-hybrid-surface border border-hybrid-border rounded-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">{label}</p>
        <Icon className={`w-4 h-4 stroke-[1.5] ${tone === 'warning' ? 'text-amber-600' : 'text-hybrid-ink-muted'}`} />
      </div>
      <p className={`font-serif text-3xl ${tone === 'warning' ? 'text-amber-700' : 'text-hybrid-ink'}`}>{value}</p>
      {hint && <p className="text-xs text-hybrid-ink-muted">{hint}</p>}
    </div>
  )
}
