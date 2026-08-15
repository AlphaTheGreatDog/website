'use client'

import { useState } from 'react'

type Section = {
  title: string
  content: string | null
}

const FALLBACKS: Record<string, string> = {
  Ingredients: 'Ingredient details for this product haven\u2019t been added yet.',
  'How to Use': 'Usage instructions for this product haven\u2019t been added yet.',
  'Shipping & Returns':
    'We offer free shipping on all U.S. orders. Unopened items can be returned within 30 days of delivery for a full refund.',
}

export default function ProductAccordion({ sections }: { sections: Section[] }) {
  // Nothing open by default — matches the original design, just now it
  // actually toggles instead of the "+" being decorative.
  const [openTitle, setOpenTitle] = useState<string | null>(null)

  return (
    <div className="border-t border-hybrid-border">
      {sections.map((section) => {
        const isOpen = openTitle === section.title
        const body = section.content?.trim() || FALLBACKS[section.title] || ''

        return (
          <div key={section.title} className="border-b border-hybrid-border">
            <button
              type="button"
              onClick={() => setOpenTitle(isOpen ? null : section.title)}
              aria-expanded={isOpen}
              className="w-full py-4 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity text-left"
            >
              <span className="font-serif text-lg">{section.title}</span>
              <span className="text-xl font-light">{isOpen ? '\u2212' : '+'}</span>
            </button>
            {isOpen && (
              <div className="pb-5 text-sm text-hybrid-ink-muted leading-relaxed whitespace-pre-line">
                {body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
