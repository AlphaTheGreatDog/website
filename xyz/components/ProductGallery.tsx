'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Touch-swipe tracking on the main slide.
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const count = images.length

  const goTo = (index: number) => {
    setSelected(((index % count) + count) % count)
  }
  const goPrev = () => goTo(selected - 1)
  const goNext = () => goTo(selected + 1)

  // Keep the active thumbnail scrolled into view as selection changes
  // (e.g. via arrow keys) so it isn't hidden off the edge of the strip.
  useEffect(() => {
    thumbRefs.current[selected]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [selected])

  if (count === 0) {
    return (
      <div className="w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center">
        <div className="w-full h-full bg-gray-100"></div>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 40
    if (touchDeltaX.current > SWIPE_THRESHOLD) {
      goPrev()
    } else if (touchDeltaX.current < -SWIPE_THRESHOLD) {
      goNext()
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  return (
    <div>
      {/* Main slide */}
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-hybrid-surface border border-hybrid-border p-8 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-hybrid-ink/30 select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={selected}
          src={images[selected]}
          alt={`${title} — image ${selected + 1} of ${count}`}
          draggable={false}
          className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-hybrid-surface/90 border border-hybrid-border hover:bg-hybrid-surface transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-hybrid-surface/90 border border-hybrid-border hover:bg-hybrid-surface transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Slide counter */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-hybrid-ink/80 text-white text-[11px] font-semibold tracking-wider tabular-nums">
              {selected + 1} / {count}
            </div>

            {/* Dots (mobile-friendly alternative to the thumbnail strip) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {images.map((src, index) => (
                <button
                  key={src + index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to image ${index + 1}`}
                  aria-current={selected === index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                    selected === index ? 'bg-hybrid-ink' : 'bg-hybrid-ink/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="hidden sm:flex gap-3 mt-4 overflow-x-auto">
          {images.map((src, index) => (
            <button
              key={src + index}
              ref={(el) => {
                thumbRefs.current[index] = el
              }}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View image ${index + 1} of ${count}`}
              aria-current={selected === index}
              className={`w-16 h-16 flex-shrink-0 border bg-hybrid-surface p-1.5 rounded-sm transition-colors cursor-pointer ${
                selected === index ? 'border-hybrid-ink' : 'border-hybrid-border hover:border-hybrid-ink-muted'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} className="w-full h-full object-cover rounded-sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
