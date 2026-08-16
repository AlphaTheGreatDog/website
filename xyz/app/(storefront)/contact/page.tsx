import { Mail, Phone, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { getContactInfo } from '@/lib/db/queries'
import Reveal from '@/components/Reveal'
import ContactForm from '@/components/ContactForm'

// Editable from the admin panel, so this shouldn't sit behind a long
// cache window — a saved change should show up on next load.
export const revalidate = 0

export default async function ContactPage() {
  const contact = await getContactInfo()

  const heading = contact?.heading || 'Get in Touch'
  const message =
    contact?.message ||
    "We'd love to hear from you. Reach out with any questions about orders, products, or anything else."

  const cards = [
    contact?.email && {
      key: 'email',
      icon: Mail,
      label: 'Email',
      node: (
        <a href={`mailto:${contact.email}`} className="text-sm hover:opacity-70 transition-opacity break-all">
          {contact.email}
        </a>
      ),
    },
    contact?.phone && {
      key: 'phone',
      icon: Phone,
      label: 'Phone',
      node: (
        <a href={`tel:${contact.phone}`} className="text-sm hover:opacity-70 transition-opacity">
          {contact.phone}
        </a>
      ),
    },
    contact?.address && {
      key: 'address',
      icon: MapPin,
      label: 'Address',
      node: <p className="text-sm whitespace-pre-line">{contact.address}</p>,
    },
  ].filter(Boolean) as { key: string; icon: typeof Mail; label: string; node: ReactNode }[]

  return (
    <div className="max-w-4xl mx-auto px-8 py-20">
      <Reveal className="text-center mb-16">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Contact Us</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-6">{heading}</h1>
        <p className="text-hybrid-ink-muted leading-relaxed max-w-xl mx-auto">{message}</p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {cards.map(({ key, icon: Icon, label, node }, index) => (
          <Reveal key={key} delay={index * 100}>
            <div className="flex flex-col items-center text-center gap-3 p-8 bg-hybrid-surface border border-hybrid-border rounded-sm">
              <Icon className="w-5 h-5 stroke-[1.5]" />
              <p className="text-xs font-semibold tracking-widest uppercase text-hybrid-ink-muted">{label}</p>
              {node}
            </div>
          </Reveal>
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-center text-sm text-hybrid-ink-muted mt-4">
          Contact details haven&apos;t been added yet — check back soon.
        </p>
      )}

      <Reveal className="mt-20 pt-16 border-t border-hybrid-border">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Send a Message</p>
          <h2 className="font-serif text-3xl mb-4">Have a question?</h2>
          <p className="text-hybrid-ink-muted leading-relaxed max-w-xl mx-auto">
            Fill out the form below and our team will get back to you shortly.
          </p>
        </div>

        <ContactForm />
      </Reveal>
    </div>
  )
}
