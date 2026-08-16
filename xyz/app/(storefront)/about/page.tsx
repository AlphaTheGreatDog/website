import { getAboutInfo } from '@/lib/db/queries'
import Reveal from '@/components/Reveal'

// Editable from the admin panel, so this shouldn't sit behind a long
// cache window — a saved change should show up on next load.
export const revalidate = 0

export default async function AboutPage() {
  const about = await getAboutInfo()

  const heading = about?.heading || 'About Us'
  const body =
    about?.body ||
    "We're a small team obsessed with the everyday essentials — sourcing thoughtfully made goods from independent makers and bringing them together in one place."

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
      <Reveal className="text-center mb-16">
        <p className="text-xs tracking-widest uppercase text-hybrid-ink-muted mb-4">Our Story</p>
        <h1 className="font-serif text-4xl md:text-5xl">{heading}</h1>
      </Reveal>

      <div className={`grid grid-cols-1 ${about?.imageUrl ? 'md:grid-cols-2' : ''} gap-12 items-center`}>
        {about?.imageUrl && (
          <Reveal>
            <div className="w-full aspect-[4/5] bg-hybrid-surface border border-hybrid-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.imageUrl} alt={heading} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        )}

        <Reveal delay={about?.imageUrl ? 150 : 0}>
          <p className="text-hybrid-ink-muted leading-relaxed whitespace-pre-line text-lg max-w-2xl mx-auto">
            {body}
          </p>
        </Reveal>
      </div>
    </div>
  )
}
