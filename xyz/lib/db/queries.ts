import { and, asc, eq } from 'drizzle-orm'
import { db } from './index'
import { categories, products, cartItems, type NewCategory, type NewProduct } from './schema'

// ===========================================================================
// STOREFRONT READS (used by app/page.tsx today)
// ===========================================================================

export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: asc(categories.name),
  })
}

/** Active products with their category attached, for the homepage grid. */
export async function getActiveProductsWithCategory() {
  return db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { category: true },
    orderBy: asc(products.createdAt),
  })
}

export async function getProductBySlug(slug: string) {
  return db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: { category: true },
  })
}

// ===========================================================================
// ADMIN DASHBOARD — not wired to any UI yet, but ready to import directly
// into server actions / route handlers when the admin panel is built.
// ===========================================================================

export async function getAllProductsAdmin() {
  return db.query.products.findMany({
    with: { category: true },
    orderBy: asc(products.id),
  })
}

export async function getProductById(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { category: true },
  })
}

export async function createProduct(data: NewProduct) {
  const [row] = await db.insert(products).values(data).returning()
  return row
}

export async function updateProduct(id: number, data: Partial<NewProduct>) {
  const [row] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()
  return row
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id))
}

export async function createCategory(data: NewCategory) {
  const [row] = await db.insert(categories).values(data).returning()
  return row
}

export async function updateCategory(id: number, data: Partial<NewCategory>) {
  const [row] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning()
  return row
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id))
}

// ===========================================================================
// CART
// ===========================================================================

/** Cart rows for a user, with product data attached, oldest-added first. */
export async function getCartItemsForUser(userId: number) {
  return db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: { product: true },
    orderBy: asc(cartItems.createdAt),
  })
}

/** Total item count for the header badge — cheap query, no product join. */
export async function getCartItemCount(userId: number) {
  const rows = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
  return rows.reduce((sum, row) => sum + row.quantity, 0)
}

export async function getCartItem(userId: number, productId: number) {
  return db.query.cartItems.findFirst({
    where: and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
  })
}

/** Adds a product to the cart, or increments quantity if it's already there. */
export async function addOrIncrementCartItem(userId: number, productId: number, quantity: number) {
  const existing = await getCartItem(userId, productId)

  if (existing) {
    const [row] = await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id))
      .returning()
    return row
  }

  const [row] = await db.insert(cartItems).values({ userId, productId, quantity }).returning()
  return row
}

export async function setCartItemQuantity(userId: number, productId: number, quantity: number) {
  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    return null
  }

  const [row] = await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .returning()
  return row
}

export async function removeCartItem(userId: number, productId: number) {
  await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
}