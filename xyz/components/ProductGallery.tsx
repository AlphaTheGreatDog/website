'use client'

import { useState } from 'react'

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center">
        <div className="w-full h-full bg-gray-100"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[selected]}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={selected === index}
              className={`w-16 h-16 flex-shrink-0 border bg-hybrid-surface p-1.5 rounded-sm transition-colors cursor-pointer ${
                selected === index ? 'border-hybrid-ink' : 'border-hybrid-border hover:border-hybrid-ink-muted'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover rounded-sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
