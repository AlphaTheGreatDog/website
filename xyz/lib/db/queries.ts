import { and, asc, eq, lte, sql } from 'drizzle-orm'
import { db } from './index'
import {
  categories,
  products,
  cartItems,
  users,
  type NewCategory,
  type NewProduct,
  type Role,
} from './schema'

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

export async function getCategoryById(id: number) {
  return db.query.categories.findFirst({ where: eq(categories.id, id) })
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
// ADMIN — USERS
// ===========================================================================

export async function getAllUsersAdmin() {
  return db.query.users.findMany({
    orderBy: asc(users.createdAt),
  })
}

export async function countAdmins() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, 'admin'))
  return row?.count ?? 0
}

/**
 * Promotes/demotes a user. Refuses to demote the last remaining admin so
 * an admin can't accidentally lock everyone (including themselves) out of
 * the panel through the UI.
 */
export async function setUserRole(id: number, role: Role) {
  if (role === 'customer') {
    const admins = await countAdmins()
    const target = await db.query.users.findFirst({ where: eq(users.id, id) })
    if (target?.role === 'admin' && admins <= 1) {
      throw new Error('LAST_ADMIN')
    }
  }

  const [row] = await db.update(users).set({ role }).where(eq(users.id, id)).returning()
  return row
}

/**
 * Deletes a user (their sessions and cart items cascade automatically —
 * see the FK definitions in schema.ts). Refuses to delete the last
 * remaining admin so the panel can't be locked out through the UI.
 */
export async function deleteUser(id: number) {
  const target = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (target?.role === 'admin') {
    const admins = await countAdmins()
    if (admins <= 1) {
      throw new Error('LAST_ADMIN')
    }
  }

  await db.delete(users).where(eq(users.id, id))
}

// ===========================================================================
// ADMIN — DASHBOARD
// ===========================================================================

const LOW_STOCK_THRESHOLD = 5

export async function getDashboardStats() {
  const [allProducts, categoryRows, allUsers, cartRows] = await Promise.all([
    db
      .select({ price: products.price, stock: products.stock, isActive: products.isActive })
      .from(products),
    db.select({ id: categories.id }).from(categories),
    db.select({ role: users.role }).from(users),
    db.query.cartItems.findMany({ with: { product: true } }),
  ])

  const activeProducts = allProducts.filter((p) => p.isActive)
  const lowStockCount = allProducts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length

  // There's no orders/payments table yet, so there's no real "revenue" to
  // report. These two figures are clearly-labeled estimates instead:
  // the retail value currently sitting in stock, and the value currently
  // sitting in shoppers' carts (an "about to convert" signal).
  const inventoryValue = activeProducts.reduce((sum, p) => sum + Number(p.price) * p.stock, 0)
  const cartValue = cartRows.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  return {
    totalProducts: allProducts.length,
    activeProducts: activeProducts.length,
    totalCategories: categoryRows.length,
    totalCustomers: allUsers.filter((u) => u.role === 'customer').length,
    totalAdmins: allUsers.filter((u) => u.role === 'admin').length,
    lowStockCount,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    inventoryValue,
    cartValue,
  }
}

export async function getLowStockProductsAdmin(threshold = LOW_STOCK_THRESHOLD) {
  return db.query.products.findMany({
    where: lte(products.stock, threshold),
    with: { category: true },
    orderBy: asc(products.stock),
  })
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