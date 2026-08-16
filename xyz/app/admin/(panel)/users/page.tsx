import { getAllUsersAdmin } from '@/lib/db/queries'
import { getCurrentUser } from '@/lib/auth/session'
import { deleteUserAction } from '@/lib/admin/actions'
import RoleToggleButton from '@/components/admin/RoleToggleButton'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([getAllUsersAdmin(), getCurrentUser()])

  return (
    <div>
      <div className="mb-6 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl mb-1">Users</h1>
        <p className="text-sm text-hybrid-ink-muted">{users.length} total</p>
      </div>

      {/* Mobile: stacked cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="bg-hybrid-surface border border-hybrid-border rounded-sm p-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium">
                {u.name || <span className="text-hybrid-ink-muted">—</span>}
                {u.id === currentUser?.id && (
                  <span className="ml-2 text-[10px] font-bold tracking-wider uppercase text-hybrid-ink-muted">
                    (You)
                  </span>
                )}
              </p>
              <span
                className={`flex-shrink-0 inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${
                  u.role === 'admin' ? 'bg-hybrid-ink text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {u.role}
              </span>
            </div>
            <p className="text-sm text-hybrid-ink-muted mb-1">{u.email}</p>
            <p className="text-xs text-hybrid-ink-muted mb-4">
              Joined {u.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-hybrid-border">
              <RoleToggleButton userId={u.id} role={u.role} />
              {u.id !== currentUser?.id && (
                <DeleteButton
                  action={deleteUserAction.bind(null, u.id)}
                  confirmMessage={`Delete ${u.email}? This can't be undone.`}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-hybrid-surface border border-hybrid-border rounded-sm overflow-x-auto">
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
                  <div className="flex items-center justify-end gap-4">
                    <RoleToggleButton userId={u.id} role={u.role} />
                    {u.id !== currentUser?.id && (
                      <DeleteButton
                        action={deleteUserAction.bind(null, u.id)}
                        confirmMessage={`Delete ${u.email}? This can't be undone.`}
                      />
                    )}
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
