import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

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
  // lets the admin dashboard hide a product without deleting it
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}))

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
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
// Inferred types — reuse these everywhere instead of hand-writing interfaces
// ---------------------------------------------------------------------------
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect