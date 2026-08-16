'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Wraps children in a fade-up reveal that plays once, the first time the
 * element scrolls into view (IntersectionObserver, not scroll-position
 * math — cheap and doesn't run on every scroll event).
 *
 * The actual transition lives in globals.css as `.reveal` / `.is-visible`,
 * scoped under `prefers-reduced-motion: no-preference` — so this component
 * degrades to "just render the children" for anyone who has reduced
 * motion turned on, with zero extra logic here.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  threshold = 0.15,
}: {
  children: ReactNode
  /** Stagger delay in ms — handy for lists (delay = index * 80). */
  delay?: number
  className?: string
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Already in view on mount (e.g. above the fold) — skip straight to
    // visible instead of waiting on the observer's first callback, so
    // above-the-fold content doesn't flash in a beat late.
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties

  return (
    <div ref={ref} style={style} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}
