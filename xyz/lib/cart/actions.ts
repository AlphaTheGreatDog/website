'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/session'
import {
  addOrIncrementCartItem,
  getProductById,
  removeCartItem,
  setCartItemQuantity,
} from '@/lib/db/queries'

export type CartActionState = { error: string } | null

/** Every mutation needs the signed-in user; bounces guests to login. */
async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function addToCart(productId: number, quantity: number = 1): Promise<CartActionState> {
  const user = await requireUser()

  const product = await getProductById(productId)
  if (!product || !product.isActive) {
    return { error: 'This product is no longer available.' }
  }
  if (product.stock <= 0) {
    return { error: 'This product is out of stock.' }
  }

  await addOrIncrementCartItem(user.id, productId, quantity)

  // 'layout' so the cart-count badge in the header updates everywhere too.
  revalidatePath('/', 'layout')
  return null
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<CartActionState> {
  const user = await requireUser()

  if (quantity > 0) {
    const product = await getProductById(productId)
    if (product && quantity > product.stock) {
      return { error: `Only ${product.stock} left in stock.` }
    }
  }

  await setCartItemQuantity(user.id, productId, quantity)
  revalidatePath('/', 'layout')
  return null
}

export async function removeFromCart(productId: number): Promise<CartActionState> {
  const user = await requireUser()
  await removeCartItem(user.id, productId)
  revalidatePath('/', 'layout')
  return null
}
