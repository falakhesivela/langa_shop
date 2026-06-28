"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { addCartItem, listCartItems, removeCartItem } from "@/lib/api/cart"
import { checkout } from "@/lib/api/orders"
import { mapShopProduct } from "@/lib/products"
import { useAuth } from "@/lib/auth/context"
import { getErrorMessage } from "@/lib/api/errors"

export type CartItem = {
  cartItemId?: number
  productId: number
  slug: string
  name: string
  price: number
  image: string
  size: string
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  isOpen: boolean
  isLoading: boolean
  isCheckingOut: boolean
  error: string | null
  open: () => void
  close: () => void
  addItem: (item: Omit<CartItem, "qty" | "cartItemId">, qty?: number) => Promise<void>
  removeItem: (slug: string, size: string) => Promise<void>
  checkout: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

function mapApiCartItem(item: Awaited<ReturnType<typeof listCartItems>>[number]): CartItem | null {
  if (!item.product) return null

  const product = mapShopProduct(item.product)
  return {
    cartItemId: item.id,
    productId: item.product_id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    size: item.size,
    qty: item.quantity,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }

    setIsLoading(true)
    try {
      const apiItems = await listCartItems()
      setItems(
        apiItems
          .map(mapApiCartItem)
          .filter((item): item is CartItem => item !== null),
      )
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authLoading) return
    void loadCart()
  }, [authLoading, loadCart])

  const addItem = useCallback(
    async (item: Omit<CartItem, "qty" | "cartItemId">, qty = 1) => {
      setError(null)

      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      try {
        await addCartItem({
          product_id: item.productId,
          size: item.size,
          quantity: qty,
        })
        await loadCart()
        setIsOpen(true)
      } catch (err) {
        setError(getErrorMessage(err, "Unable to add item to bag."))
      }
    },
    [isAuthenticated, loadCart, router],
  )

  const removeItem = useCallback(
    async (slug: string, size: string) => {
      setError(null)
      const target = items.find((item) => item.slug === slug && item.size === size)
      if (!target?.cartItemId) {
        setItems((prev) => prev.filter((item) => !(item.slug === slug && item.size === size)))
        return
      }

      try {
        await removeCartItem(target.cartItemId)
        await loadCart()
      } catch (err) {
        setError(getErrorMessage(err, "Unable to remove item."))
      }
    },
    [items, loadCart],
  )

  const handleCheckout = useCallback(async () => {
    setError(null)

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (items.length === 0) {
      return
    }

    setIsCheckingOut(true)
    try {
      const result = await checkout()
      window.location.href = result.authorization_url
    } catch (err) {
      setError(getErrorMessage(err, "Unable to start checkout."))
      setIsCheckingOut(false)
    }
  }, [isAuthenticated, items.length, router])

  const count = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        isOpen,
        isLoading,
        isCheckingOut,
        error,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        addItem,
        removeItem,
        checkout: handleCheckout,
        refresh: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
