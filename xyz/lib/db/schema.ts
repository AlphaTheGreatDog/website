import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
// A proper Postgres enum instead of a boolean `isAdmin` flag — leaves room
// to add more roles later (e.g. 'staff') without another migration that
// touches every existing row.
export const roleEnum = pgEnum('role', ['customer', 'admin'])
export type Role = (typeof roleEnum.enumValues)[number]

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  badge: varchar('badge', { length: 50 }), // 'Best Seller' | 'New' | 'Award Winner' | null
  imageUrl: varchar('image_url', { length: 500 }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  stock: integer('stock').notNull().default(0),
  // Content for the expandable info cards on the product detail page.
  // Nullable — the page falls back to sensible default copy when empty.
  ingredients: text('ingredients'),
  howToUse: text('how_to_use'),
  shippingReturns: text('shipping_returns'),
  // lets the admin dashboard hide a product without deleting it
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}))

// ---------------------------------------------------------------------------
// Product images
// ---------------------------------------------------------------------------
// `products.imageUrl` stays as the single "cover" image used everywhere a
// product is shown as a small tile (grid, cart, etc.) — cheap, no join
// needed. This table holds *additional* gallery images for the product
// detail page only, ordered by `position`.
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export type ProductImage = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert

// ---------------------------------------------------------------------------
// Contact info
// ---------------------------------------------------------------------------
// A singleton row (id is always 1) holding the editable content shown on
// the storefront's Contact Us page. Modeled as a table rather than a
// hardcoded constant so admins can update it without a redeploy.
export const contactInfo = pgTable('contact_info', {
  id: integer('id').primaryKey().default(1),
  heading: varchar('heading', { length: 200 }).notNull().default('Get in Touch'),
  message: text('message'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type ContactInfo = typeof contactInfo.$inferSelect
export type NewContactInfo = typeof contactInfo.$inferInsert

// ---------------------------------------------------------------------------
// About info
// ---------------------------------------------------------------------------
// Same singleton pattern as contactInfo (id is always 1) for the About Us
// page's editable content.
export const aboutInfo = pgTable('about_info', {
  id: integer('id').primaryKey().default(1),
  heading: varchar('heading', { length: 200 }).notNull().default('About Us'),
  body: text('body'),
  imageUrl: varchar('image_url', { length: 500 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type AboutInfo = typeof aboutInfo.$inferSelect
export type NewAboutInfo = typeof aboutInfo.$inferInsert

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
  role: roleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}))

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
// `id` stores the SHA-256 hash of the session token, never the raw token —
// so a DB dump/leak doesn't hand over usable session credentials. The raw
// token only ever lives in the user's httpOnly cookie.
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
})

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

// ---------------------------------------------------------------------------
// Cart items
// ---------------------------------------------------------------------------
export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [unique('cart_items_user_product_unique').on(table.userId, table.productId)]
)

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}))

// ---------------------------------------------------------------------------
// Inferred types — reuse these everywhere instead of hand-writing interfaces
// ---------------------------------------------------------------------------
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type CartItem = typeof cartItems.$inferSelect
export type NewCartItem = typeof cartItems.$inferInsert