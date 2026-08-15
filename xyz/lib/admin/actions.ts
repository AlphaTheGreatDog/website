'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  setUserRole,
} from '@/lib/db/queries'
import type { NewProduct, NewCategory, Role } from '@/lib/db/schema'
import { slugify } from '@/lib/utils/slugify'

export type AdminActionState = { error: string } | null

// Postgres unique_violation / foreign_key_violation codes, for friendlier
// messages than "Could not create product." on the common failure paths.
const PG_UNIQUE_VIOLATION = '23505'
const PG_FK_VIOLATION = '23503'

const VALID_BADGES = ['', 'Best Seller', 'New', 'Award Winner']

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function parseProductForm(formData: FormData): { data: NewProduct } | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const slugInput = String(formData.get('slug') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '')
  const badge = String(formData.get('badge') ?? '')
  const imageUrl = String(formData.get('imageUrl') ?? '').trim()
  const categoryIdRaw = String(formData.get('categoryId') ?? '')
  const stockRaw = String(formData.get('stock') ?? '')
  const isActive = formData.get('isActive') === 'on'

  if (!title) return { error: 'Title is required.' }

  const price = Number(priceRaw)
  if (!Number.isFinite(price) || price < 0) return { error: 'Enter a valid price.' }

  const stock = Number(stockRaw)
  if (!Number.isInteger(stock) || stock < 0) return { error: 'Enter a valid stock quantity.' }

  const categoryId = Number(categoryIdRaw)
  if (!categoryIdRaw || Number.isNaN(categoryId)) return { error: 'Choose a category.' }

  if (!VALID_BADGES.includes(badge)) return { error: 'Invalid badge.' }

  return {
    data: {
      title,
      slug: slugify(slugInput || title),
      description: description || null,
      price: price.toFixed(2),
      badge: badge || null,
      imageUrl: imageUrl || null,
      categoryId,
      stock,
      isActive,
    },
  }
}

function revalidateProductPaths() {
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  // storefront pulls active products into the homepage + listing + PDP
  revalidatePath('/', 'layout')
}

export async function createProductAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()
  const parsed = parseProductForm(formData)
  if ('error' in parsed) return parsed

  try {
    await createProduct(parsed.data)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A product with that slug already exists. Try a different title or slug.' }
    }
    return { error: 'Could not create product. Please try again.' }
  }

  revalidateProductPaths()
  redirect('/admin/products')
}

export async function updateProductAction(
  id: number,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()
  const parsed = parseProductForm(formData)
  if ('error' in parsed) return parsed

  try {
    await updateProduct(id, parsed.data)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A product with that slug already exists. Try a different title or slug.' }
    }
    return { error: 'Could not update product. Please try again.' }
  }

  revalidateProductPaths()
  redirect('/admin/products')
}

export async function deleteProductAction(id: number): Promise<AdminActionState> {
  await requireAdmin()
  try {
    await deleteProduct(id)
  } catch {
    return { error: 'Could not delete product. Please try again.' }
  }
  revalidateProductPaths()
  return null
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function parseCategoryForm(formData: FormData): { data: NewCategory } | { error: string } {
  const name = String(formData.get('name') ?? '').trim()
  const slugInput = String(formData.get('slug') ?? '').trim()

  if (!name) return { error: 'Name is required.' }

  return { data: { name, slug: slugify(slugInput || name) } }
}

function revalidateCategoryPaths() {
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/', 'layout')
}

export async function createCategoryAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()
  const parsed = parseCategoryForm(formData)
  if ('error' in parsed) return parsed

  try {
    await createCategory(parsed.data)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A category with that name or slug already exists.' }
    }
    return { error: 'Could not create category. Please try again.' }
  }

  revalidateCategoryPaths()
  redirect('/admin/categories')
}

export async function updateCategoryAction(
  id: number,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()
  const parsed = parseCategoryForm(formData)
  if ('error' in parsed) return parsed

  try {
    await updateCategory(id, parsed.data)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A category with that name or slug already exists.' }
    }
    return { error: 'Could not update category. Please try again.' }
  }

  revalidateCategoryPaths()
  redirect('/admin/categories')
}

export async function deleteCategoryAction(id: number): Promise<AdminActionState> {
  await requireAdmin()
  try {
    await deleteCategory(id)
  } catch (err) {
    if (isPgError(err, PG_FK_VIOLATION)) {
      return { error: 'This category still has products assigned to it. Move or delete those first.' }
    }
    return { error: 'Could not delete category. Please try again.' }
  }
  revalidateCategoryPaths()
  return null
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function setUserRoleAction(id: number, role: Role): Promise<AdminActionState> {
  const admin = await requireAdmin()

  if (id === admin.id && role === 'customer') {
    return { error: 'You can\u2019t remove your own admin access.' }
  }

  try {
    await setUserRole(id, role)
  } catch (err) {
    if (err instanceof Error && err.message === 'LAST_ADMIN') {
      return { error: 'This is the only remaining admin — promote someone else first.' }
    }
    return { error: 'Could not update this user. Please try again.' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return null
}

// ---------------------------------------------------------------------------

function isPgError(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === code
}
