'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/session'
import {
  addOrIncrementCartItem,
  getCartItem,
  getProductById,
  removeCartItem,
  setCartItemQuantity,
} from '@/lib/db/queries'

// 'auth' is a distinct case from a plain error string: it tells the client
// to navigate to /login itself. Calling redirect() from inside a server
// action that's invoked as a plain async function (as these are, from
// onClick handlers) rather than as a <form action> is unreliable — the
// thrown NEXT_REDIRECT signal doesn't always reach the client cleanly and
// can leave the calling UI stuck in a pending state. Returning a value and
// letting the client call router.push() is the safe pattern here.
export type CartActionState = { error: string } | { authRequired: true } | null

async function getAuthedUser() {
  return getCurrentUser()
}

export async function addToCart(productId: number, quantity: number = 1): Promise<CartActionState> {
  const user = await getAuthedUser()
  if (!user) return { authRequired: true }

  // Always re-read stock fresh here rather than trusting whatever the
  // client last rendered — the product page can be up to 60s stale (ISR)
  // and someone else may have bought the last units in the meantime.
  const product = await getProductById(productId)
  if (!product || !product.isActive) {
    return { error: 'This product is no longer available.' }
  }
  if (product.stock <= 0) {
    return { error: 'This product is out of stock.' }
  }

  // Cap against what's *already* in this user's cart too — otherwise
  // repeated clicks (or an already-full cart) could push the cart
  // quantity past real stock, since addOrIncrementCartItem just adds on
  // top of whatever's there.
  const existing = await getCartItem(user.id, productId)
  const alreadyInCart = existing?.quantity ?? 0
  if (alreadyInCart + quantity > product.stock) {
    const remaining = product.stock - alreadyInCart
    return {
      error:
        remaining > 0
          ? `Only ${remaining} more available — you already have ${alreadyInCart} in your bag.`
          : `You already have the maximum available stock (${product.stock}) in your bag.`,
    }
  }

  await addOrIncrementCartItem(user.id, productId, quantity)

  // 'layout' so the cart-count badge in the header updates everywhere too.
  revalidatePath('/', 'layout')
  return null
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<CartActionState> {
  const user = await getAuthedUser()
  if (!user) return { authRequired: true }

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
  const user = await getAuthedUser()
  if (!user) return { authRequired: true }

  await removeCartItem(user.id, productId)
  revalidatePath('/', 'layout')
  return null
}
