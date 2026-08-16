import 'dotenv/config'
import { eq, isNull } from 'drizzle-orm'
import { db } from '../lib/db'
import { products } from '../lib/db/schema'

/**
 * One-off backfill for stores that already have products seeded before
 * images were part of the schema. Only touches rows where imageUrl is
 * currently null — never overwrites an image an admin has already set.
 *
 * Run with: pnpm tsx scripts/backfill-images.ts
 */

function defaultImageUrl(slug: string) {
  return `https://picsum.photos/seed/${slug}/800/800`
}

async function backfill() {
  const missing = await db.query.products.findMany({
    where: isNull(products.imageUrl),
  })

  if (missing.length === 0) {
    console.log('No products are missing an image — nothing to do.')
    process.exit(0)
  }

  console.log(`Found ${missing.length} product(s) without an image. Assigning defaults...`)

  for (const product of missing) {
    const url = defaultImageUrl(product.slug)
    await db.update(products).set({ imageUrl: url }).where(eq(products.id, product.id))
    console.log(`  ${product.title} -> ${url}`)
  }

  console.log('Done. Replace any of these from the admin panel whenever you have real product photos.')
  process.exit(0)
}

backfill().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
