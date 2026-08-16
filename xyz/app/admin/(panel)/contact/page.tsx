import { getContactInfo } from '@/lib/db/queries'
import { updateContactInfoAction } from '@/lib/admin/actions'
import ContactForm from '@/components/admin/ContactForm'

export default async function AdminContactPage() {
  const contact = await getContactInfo()

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-serif text-3xl mb-1">Contact Us Page</h1>
        <p className="text-sm text-hybrid-ink-muted">
          Edit the content shown on the storefront&apos;s Contact Us page.
        </p>
      </div>

      <ContactForm action={updateContactInfoAction} contact={contact ?? null} />
    </div>
  )
}
