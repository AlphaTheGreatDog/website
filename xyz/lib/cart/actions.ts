'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/session'
import {
  addOrIncrementCartItem,
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
