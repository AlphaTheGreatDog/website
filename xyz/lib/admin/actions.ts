'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  replaceProductImages,
  createCategory,
  updateCategory,
  deleteCategory,
  setUserRole,
  deleteUser,
  upsertContactInfo,
  upsertAboutInfo,
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

function parseProductForm(
  formData: FormData
): { data: NewProduct; galleryUrls: string[] } | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '')
  const badge = String(formData.get('badge') ?? '')
  const imageUrl = String(formData.get('imageUrl') ?? '').trim()
  const categoryIdRaw = String(formData.get('categoryId') ?? '')
  const stockRaw = String(formData.get('stock') ?? '')
  const isActive = formData.get('isActive') === 'on'
  const ingredients = String(formData.get('ingredients') ?? '').trim()
  const howToUse = String(formData.get('howToUse') ?? '').trim()
  const shippingReturns = String(formData.get('shippingReturns') ?? '').trim()
  // Repeatable "Additional Images" rows in ProductForm all share this name,
  // so getAll collects every one of them in order.
  const galleryUrls = formData
    .getAll('galleryImageUrl')
    .map((v) => String(v).trim())
    .filter(Boolean)

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
      // The admin panel no longer exposes a slug field — nothing in the
      // storefront routes on product slug (routing is by id), so it's
      // just derived from the title to satisfy the DB's not-null/unique
      // constraint without asking admins to fill in a value nobody uses.
      slug: slugify(title),
      description: description || null,
      price: price.toFixed(2),
      badge: badge || null,
      imageUrl: imageUrl || null,
      categoryId,
      stock,
      isActive,
      ingredients: ingredients || null,
      howToUse: howToUse || null,
      shippingReturns: shippingReturns || null,
    },
    galleryUrls,
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
    const product = await createProduct(parsed.data)
    await replaceProductImages(product.id, parsed.galleryUrls)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A product with a matching title already exists. Try a different title.' }
    }
    return { error: 'Could not create product. Please try again.' }
  }

  revalidateProductPaths()
  // No redirect() here — see the comment on adminLogin in
  // lib/auth/actions.ts. ProductForm navigates to /admin/products itself
  // once it sees this action resolve with no error.
  return null
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
    await replaceProductImages(id, parsed.galleryUrls)
  } catch (err) {
    if (isPgError(err, PG_UNIQUE_VIOLATION)) {
      return { error: 'A product with a matching title already exists. Try a different title.' }
    }
    return { error: 'Could not update product. Please try again.' }
  }

  revalidateProductPaths()
  return null
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
  return null
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
  return null
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

export async function deleteUserAction(id: number): Promise<AdminActionState> {
  const admin = await requireAdmin()

  if (id === admin.id) {
    return { error: 'You can\u2019t delete your own account.' }
  }

  try {
    await deleteUser(id)
  } catch (err) {
    if (err instanceof Error && err.message === 'LAST_ADMIN') {
      return { error: 'This is the only remaining admin — promote someone else first.' }
    }
    return { error: 'Could not delete this user. Please try again.' }
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  return null
}

// ---------------------------------------------------------------------------
// Contact info
// ---------------------------------------------------------------------------

export async function updateContactInfoAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()

  const heading = String(formData.get('heading') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()

  if (!heading) return { error: 'Heading is required.' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' }
  }

  try {
    await upsertContactInfo({
      heading,
      message: message || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
    })
  } catch {
    return { error: 'Could not save contact info. Please try again.' }
  }

  revalidatePath('/admin/contact')
  revalidatePath('/contact')
  return null
}

// ---------------------------------------------------------------------------
// About info
// ---------------------------------------------------------------------------

export async function updateAboutInfoAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin()

  const heading = String(formData.get('heading') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const imageUrl = String(formData.get('imageUrl') ?? '').trim()

  if (!heading) return { error: 'Heading is required.' }

  try {
    await upsertAboutInfo({
      heading,
      body: body || null,
      imageUrl: imageUrl || null,
    })
  } catch {
    return { error: 'Could not save About Us page. Please try again.' }
  }

  revalidatePath('/admin/about')
  revalidatePath('/about')
  return null
}

// ---------------------------------------------------------------------------

function isPgError(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === code
}
