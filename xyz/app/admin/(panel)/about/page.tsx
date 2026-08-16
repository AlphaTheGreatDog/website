import { getAboutInfo } from '@/lib/db/queries'
import { updateAboutInfoAction } from '@/lib/admin/actions'
import AboutForm from '@/components/admin/AboutForm'

export default async function AdminAboutPage() {
  const about = await getAboutInfo()

  return (
    <div>
      <div className="mb-6 sm:mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl mb-1">About Us Page</h1>
        <p className="text-sm text-hybrid-ink-muted">
          Edit the content shown on the storefront&apos;s About Us page.
        </p>
      </div>

      <AboutForm action={updateAboutInfoAction} about={about ?? null} />
    </div>
  )
}
