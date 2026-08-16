import { Mail, Phone, MapPin } from 'lucide-react'
import { getContactInfo } from '@/lib/db/queries'

// Editable from the admin panel, so this shouldn't sit behind a long
// cache window — a saved change should show up on next load.
export const revalidate = 0

export default async function ContactPage() {
  const contact = await getContactInfo()

  const heading = contact?.heading || 'Get in Touch'
  const message =
    contact?.message ||
    "We'd love to hear from you. Reach out with any questions about orders, products, or anything else."

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <div className="text-center mb-16">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Contact Us</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-6">{heading}</h1>
        <p className="text-hybrid-ink-muted leading-relaxed max-w-xl mx-auto">{message}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {contact?.email && (
          <div className="flex flex-col items-center text-center gap-3 p-8 bg-hybrid-surface border border-hybrid-border rounded-sm">
            <Mail className="w-5 h-5 stroke-[1.5]" />
            <p className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">Email</p>
            <a href={`mailto:${contact.email}`} className="text-sm hover:opacity-70 transition-opacity break-all">
              {contact.email}
            </a>
          </div>
        )}

        {contact?.phone && (
          <div className="flex flex-col items-center text-center gap-3 p-8 bg-hybrid-surface border border-hybrid-border rounded-sm">
            <Phone className="w-5 h-5 stroke-[1.5]" />
            <p className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">Phone</p>
            <a href={`tel:${contact.phone}`} className="text-sm hover:opacity-70 transition-opacity">
              {contact.phone}
            </a>
          </div>
        )}

        {contact?.address && (
          <div className="flex flex-col items-center text-center gap-3 p-8 bg-hybrid-surface border border-hybrid-border rounded-sm">
            <MapPin className="w-5 h-5 stroke-[1.5]" />
            <p className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">Address</p>
            <p className="text-sm whitespace-pre-line">{contact.address}</p>
          </div>
        )}
      </div>

      {!contact?.email && !contact?.phone && !contact?.address && (
        <p className="text-center text-sm text-hybrid-ink-muted mt-4">
          Contact details haven&apos;t been added yet — check back soon.
        </p>
      )}
    </div>
  )
}
