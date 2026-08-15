"use client"

import { useState } from 'react'
import Link from 'next/link'

const allProducts = [
  { id: 1, title: 'Restorative Serum', badge: 'Best Seller', category: 'Skincare' },
  { id: 2, title: 'Botanical Cleanser', badge: 'Award Winner', category: 'Skincare' },
  { id: 3, title: 'Daily Hydrator', badge: '', category: 'Skincare' },
  { id: 4, title: 'Exfoliating Mask', badge: 'New', category: 'Skincare' },
  
  { id: 5, title: 'Artisan Clay Mug', badge: 'New', category: 'Home Decor' },
  { id: 6, title: 'Organic Linen Throw', badge: '', category: 'Home Decor' },
  { id: 7, title: 'Ceramic Vase', badge: 'Best Seller', category: 'Home Decor' },
  { id: 8, title: 'Beeswax Candle', badge: '', category: 'Home Decor' },
  
  { id: 9, title: 'Linen Button-Down', badge: '', category: 'Apparel' },
  { id: 10, title: 'Cotton Crewneck', badge: 'New', category: 'Apparel' },
  { id: 11, title: 'Ribbed Beanie', badge: '', category: 'Apparel' },
  { id: 12, title: 'Woven Scarf', badge: 'Best Seller', category: 'Apparel' },
  
  { id: 13, title: 'Aromatherapy Diffuser', badge: '', category: 'Wellness' },
  { id: 14, title: 'Meditation Cushion', badge: 'Best Seller', category: 'Wellness' },
  { id: 15, title: 'Essential Oil Set', badge: 'New', category: 'Wellness' },
  { id: 16, title: 'Yoga Mat', badge: '', category: 'Wellness' },
  
  { id: 17, title: 'Leather Tote', badge: '', category: 'Accessories' },
  { id: 18, title: 'Minimalist Watch', badge: 'New', category: 'Accessories' },
  { id: 19, title: 'Canvas Weekend Bag', badge: 'Best Seller', category: 'Accessories' },
  { id: 20, title: 'Tortoiseshell Sunglasses', badge: '', category: 'Accessories' },
];

const categories = ['Skincare', 'Home Decor', 'Apparel', 'Wellness', 'Accessories', 'New Arrivals'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Skincare');

  const handleCategoryClick = (cat: string) => {
    console.log(`Tab clicked: ${cat}`); // Debugging log
    setActiveCategory(cat);
  };

  const filteredProducts = activeCategory === 'New Arrivals'
    ? allProducts.filter(item => item.badge === 'New').slice(0, 4)
    : allProducts.filter(item => item.category === activeCategory).slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[75vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://familydoctor.org/wp-content/uploads/2026/07/GettyImages-2271698553.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
          <p className="font-sans text-xs tracking-[0.2em] uppercase mb-4">Curated Collection</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-6">Discover your next daily essential.</h1>
          <p className="font-sans text-lg mb-8 font-light text-white/90">Uniting the very best from emerging brands to deliver quality you can feel.</p>
          <Link href="/products" className="inline-block bg-white text-hybrid-ink px-8 py-3.5 text-sm font-bold tracking-wider uppercase hover:bg-gray-100 transition-colors rounded-sm">
            Start Exploring →
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-8 py-16">
        {/* Dynamic Category Pills */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="font-serif text-4xl mb-8">Featured Categories</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2 text-sm border border-hybrid-border rounded-full transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-hybrid-ink text-white border-hybrid-ink'
                    : 'bg-hybrid-surface text-hybrid-ink hover:border-hybrid-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <Link href={`/products/${item.id}`} key={item.id} className="group flex flex-col cursor-pointer">
                <div className="w-full aspect-[4/5] bg-hybrid-surface border border-hybrid-border mb-4 relative overflow-hidden flex items-center justify-center p-6">
                   <div className="w-full h-full bg-gray-100 rounded-md transition-transform duration-700 group-hover:scale-105"></div>
                   
                   {item.badge && (
                     <div className="absolute top-4 right-4 bg-hybrid-ink text-white text-[10px] uppercase tracking-wider font-bold w-14 h-14 rounded-full flex items-center justify-center text-center p-1 leading-tight">
                       {item.badge}
                     </div>
                   )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <h4 className="font-serif text-lg text-hybrid-ink mb-1">{item.title}</h4>
                  <p className="font-sans text-sm text-hybrid-ink-muted">$48.00</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-hybrid-ink-muted">
              No products found for this category.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}