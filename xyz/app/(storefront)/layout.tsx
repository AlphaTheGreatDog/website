import '../globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import Header from '@/components/Header'
import Reveal from '@/components/Reveal'
import { getCurrentUser } from '@/lib/auth/session'
import { getCartItemCount } from '@/lib/db/queries'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const cartCount = user ? await getCartItemCount(user.id) : 0

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-hybrid-bg text-hybrid-ink antialiased`}>
        <div className="bg-hybrid-ink text-white text-xs py-2 text-center font-medium tracking-widest uppercase">
          Free Shipping on all U.S. orders
        </div>

        <Header user={user ? { email: user.email, name: user.name } : null} cartCount={cartCount} />

        <main>{children}</main>
        
        <footer className="bg-hybrid-espresso text-white py-16 px-8 mt-24">
          <Reveal className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl mb-4">We&apos;re Xyz.</h2>
              <p className="text-white/80 font-light text-lg">Curating the best in modern lifestyle and wellness.</p>
            </div>
            <div className="flex flex-col md:items-end justify-center gap-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">Company</p>
              <Link href="/about" className="text-white/90 hover:text-white transition-colors underline underline-offset-4">
                About Us
              </Link>
              <Link href="/contact" className="text-white/90 hover:text-white transition-colors underline underline-offset-4">
                Contact Us
              </Link>
            </div>
          </Reveal>
        </footer>
      </body>
    </html>
  )
}