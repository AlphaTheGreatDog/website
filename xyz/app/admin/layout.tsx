import '../globals.css'
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: 'Xyz Admin',
  robots: { index: false, follow: false },
}

// This is a second, independent root layout (its own <html>/<body>) that
// only applies under /admin — the storefront's Header/promo-bar/footer
// never render here. Next.js supports multiple root layouts as long as
// each lives under its own top-level segment and none of them share a
// parent app/layout.tsx that also defines <html>.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-hybrid-bg text-hybrid-ink antialiased`}>
        {children}
      </body>
    </html>
  )
}
