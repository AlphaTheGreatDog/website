import 'dotenv/config'
import { db } from '../lib/db'
import { categories, products, contactInfo } from '../lib/db/schema'

const categoryData = [
  { name: 'Skincare', slug: 'skincare' },
  { name: 'Home Decor', slug: 'home-decor' },
  { name: 'Apparel', slug: 'apparel' },
  { name: 'Wellness', slug: 'wellness' },
  { name: 'Accessories', slug: 'accessories' },
]

const productData = [
  { title: 'Restorative Serum', badge: 'Best Seller', category: 'Skincare' },
  { title: 'Botanical Cleanser', badge: 'Award Winner', category: 'Skincare' },
  { title: 'Daily Hydrator', badge: '', category: 'Skincare' },
  { title: 'Exfoliating Mask', badge: 'New', category: 'Skincare' },

  { title: 'Artisan Clay Mug', badge: 'New', category: 'Home Decor' },
  { title: 'Organic Linen Throw', badge: '', category: 'Home Decor' },
  { title: 'Ceramic Vase', badge: 'Best Seller', category: 'Home Decor' },
  { title: 'Beeswax Candle', badge: '', category: 'Home Decor' },

  { title: 'Linen Button-Down', badge: '', category: 'Apparel' },
  { title: 'Cotton Crewneck', badge: 'New', category: 'Apparel' },
  { title: 'Ribbed Beanie', badge: '', category: 'Apparel' },
  { title: 'Woven Scarf', badge: 'Best Seller', category: 'Apparel' },

  { title: 'Aromatherapy Diffuser', badge: '', category: 'Wellness' },
  { title: 'Meditation Cushion', badge: 'Best Seller', category: 'Wellness' },
  { title: 'Essential Oil Set', badge: 'New', category: 'Wellness' },
  { title: 'Yoga Mat', badge: '', category: 'Wellness' },

  { title: 'Leather Tote', badge: '', category: 'Accessories' },
  { title: 'Minimalist Watch', badge: 'New', category: 'Accessories' },
  { title: 'Canvas Weekend Bag', badge: 'Best Seller', category: 'Accessories' },
  { title: 'Tortoiseshell Sunglasses', badge: '', category: 'Accessories' },
]

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Deterministic placeholder photo per product — same slug always gets the
// same image, so re-seeding doesn't shuffle photos around. Swap these out
// for real product photography in the admin panel whenever you have it;
// this is just so the storefront doesn't launch with empty gray boxes.
function defaultImageUrl(slug: string) {
  return `https://picsum.photos/seed/${slug}/800/800`
}

async function seed() {
  console.log('Seeding categories...')
  const insertedCategories = await db.insert(categories).values(categoryData).returning()
  const categoryIdByName = new Map(insertedCategories.map((c) => [c.name, c.id]))

  console.log('Seeding products...')
  await db.insert(products).values(
    productData.map((p) => {
      const slug = slugify(p.title)
      return {
        title: p.title,
        slug,
        badge: p.badge || null,
        price: '48.00',
        categoryId: categoryIdByName.get(p.category)!,
        stock: 100,
        imageUrl: defaultImageUrl(slug),
      }
    })
  )

  console.log(`Done. Seeded ${insertedCategories.length} categories and ${productData.length} products.`)

  console.log('Seeding contact info...')
  await db
    .insert(contactInfo)
    .values({
      id: 1,
      heading: 'Get in Touch',
      message: "We'd love to hear from you. Reach out with any questions about orders, products, or anything else.",
      email: 'hello@xyz.com',
      phone: '(555) 123-4567',
      address: '123 Market Street, San Francisco, CA 94103',
    })
    .onConflictDoNothing()

  console.log('Done seeding contact info.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})