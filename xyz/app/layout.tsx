import './globals.css'
import { Inter, Playfair_Display } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-hybrid-bg text-hybrid-ink antialiased`}>
        <div className="bg-hybrid-ink text-white text-xs py-2 text-center font-medium tracking-widest uppercase">
          Free Shipping on all U.S. orders
        </div>

        <Header />

        <main>{children}</main>
        
        <footer className="bg-hybrid-espresso text-white py-16 px-8 mt-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-3xl mb-4">We're Lumina.</h2>
              <p className="text-white/80 font-light text-lg">Curating the best in modern lifestyle and wellness.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}