import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default async function AdminLoginPage() {
  const user = await getCurrentUser()
  if (user?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-hybrid-espresso flex items-center justify-center px-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <p className="font-sans text-xl tracking-[0.2em] font-bold uppercase text-white">L U M I N A</p>
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mt-2">Admin Panel</p>
        </div>

        <AdminLoginForm />

        <p className="text-center text-xs text-white/30 mt-10">
          Store administration only. Customers should use the regular sign-in page.
        </p>
      </div>
    </div>
  )
}
