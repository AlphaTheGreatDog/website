import { getAllUsersAdmin } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import RoleToggleButton from '@/components/admin/RoleToggleButton'

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([getAllUsersAdmin(), getCurrentUser()])

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-3xl mb-1">Users</h1>
        <p className="text-sm text-hybrid-ink-muted">{users.length} total</p>
      </div>

      <div className="bg-hybrid-surface border border-hybrid-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wider uppercase text-hybrid-ink-muted border-b border-hybrid-border">
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-hybrid-border last:border-0">
                <td className="px-6 py-3 font-medium">
                  {u.name || <span className="text-hybrid-ink-muted">—</span>}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-[10px] font-bold tracking-wider uppercase text-hybrid-ink-muted">
                      (You)
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-hybrid-ink-muted">{u.email}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                      u.role === 'admin' ? 'bg-hybrid-ink text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-hybrid-ink-muted">
                  {u.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end">
                    <RoleToggleButton userId={u.id} role={u.role} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
