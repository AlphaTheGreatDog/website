'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category, Product } from '@/lib/db/schema'
import Reveal from '@/components/Reveal'

type ProductWithCategory = Product & { category: Category }

export default function ProductGrid({
  products,
  categoryNames,
}: {
  products: ProductWithCategory[]
  categoryNames: string[]
}) {
  const [activeCategory, setActiveCategory] = useState(categoryNames[0] ?? '')

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
  }

  const filteredProducts =
    activeCategory === 'New Arrivals'
      ? products.filter((p) => p.badge === 'New').slice(0, 4)
      : products.filter((p) => p.category.name === activeCategory).slice(0, 4)

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categoryNames.map((cat) => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <Link href={`/products/${item.id}`} className="group flex flex-col cursor-pointer">
                <div className="w-full aspect-[4/5] bg-hybrid-surface border border-hybrid-border mb-4 relative overflow-hidden flex items-center justify-center p-6">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-md transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md transition-transform duration-700 group-hover:scale-105"></div>
                  )}

                  {item.badge && (
                    <div className="absolute top-4 right-4 bg-hybrid-ink text-white text-[10px] uppercase tracking-wider font-bold w-14 h-14 rounded-full flex items-center justify-center text-center p-1 leading-tight">
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <h4 className="font-serif text-lg text-hybrid-ink mb-1">{item.title}</h4>
                  <p className="font-sans text-sm text-hybrid-ink-muted">${Number(item.price).toFixed(2)}</p>
                </div>
              </Link>
            </Reveal>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-hybrid-ink-muted">
            No products found for this category.
          </div>
        )}
      </div>
    </>
  )
}