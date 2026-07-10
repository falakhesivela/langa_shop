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
import {
  addCartItem,
  listCartItems,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart"
import { checkout } from "@/lib/api/orders"
import { mapShopProduct } from "@/lib/products"
import { useAuth } from "@/lib/auth/context"
import { getErrorMessage } from "@/lib/api/errors"
import {
  clearGuestCart,
  readGuestCart,
  writeGuestCart,
} from "@/lib/cart/guest-cart"
import { getVariantStock } from "@/lib/stock"

export type CartItem = {
  cartItemId?: number
  productId: number
  slug: string
  name: string
  price: number
  image: string
  size: string
  color: string
  qty: number
  /** Available stock for this line's constraint. */
  stock: number
  /**
   * When true (default), stock is product-level and shared across sizes/colors.
   * When false, stock is per size/color variant.
   */
  sharesProductStock?: boolean
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
  updateQuantity: (slug: string, size: string, color: string, qty: number) => Promise<void>
  removeItem: (slug: string, size: string, color: string) => Promise<void>
  checkout: () => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

function productQtyInCart(
  items: CartItem[],
  productId: number,
  exclude?: { size: string; color: string },
): number {
  return items.reduce((sum, item) => {
    if (item.productId !== productId) return sum
    if (
      exclude &&
      item.size === exclude.size &&
      item.color === exclude.color
    ) {
      return sum
    }
    return sum + item.qty
  }, 0)
}

function variantQtyInCart(
  items: CartItem[],
  productId: number,
  size: string,
  color: string,
  exclude?: { size: string; color: string },
): number {
  return items.reduce((sum, item) => {
    if (item.productId !== productId) return sum
    if (item.size !== size || item.color !== color) return sum
    if (
      exclude &&
      item.size === exclude.size &&
      item.color === exclude.color
    ) {
      return sum
    }
    return sum + item.qty
  }, 0)
}

function qtyAgainstStock(
  items: CartItem[],
  item: Pick<CartItem, "productId" | "size" | "color" | "sharesProductStock">,
  exclude?: { size: string; color: string },
): number {
  if (item.sharesProductStock === false) {
    return variantQtyInCart(
      items,
      item.productId,
      item.size,
      item.color,
      exclude,
    )
  }
  return productQtyInCart(items, item.productId, exclude)
}

function mapApiCartItem(item: Awaited<ReturnType<typeof listCartItems>>[number]): CartItem | null {
  if (!item.product) return null

  const product = mapShopProduct(item.product)
  const color = item.color ?? ""
  const hasVariants = Object.keys(product.variantStock).length > 0
  const variantStock = hasVariants
    ? getVariantStock(product.variantStock, product.stock, item.size, color)
    : product.stock
  return {
    cartItemId: item.id,
    productId: item.product_id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    size: item.size,
    color,
    qty: item.quantity,
    stock: variantStock,
    sharesProductStock: !hasVariants,
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
    // Guests keep their bag in localStorage — no server round-trip.
    if (!isAuthenticated) {
      setItems(readGuestCart())
      return
    }

    setIsLoading(true)
    try {
      // If they built a bag while logged out, merge it into the server cart
      // (best-effort — an item that's now out of stock is simply skipped).
      const guestItems = readGuestCart()
      if (guestItems.length > 0) {
        for (const guestItem of guestItems) {
          try {
            await addCartItem({
              product_id: guestItem.productId,
              size: guestItem.size,
              color: guestItem.color ?? "",
              quantity: guestItem.qty,
            })
          } catch {
            // Skip items that can't be merged.
          }
        }
        clearGuestCart()
      }

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
      const addQty = Math.max(1, Math.floor(qty))
      const stock = Math.max(0, item.stock ?? 0)

      // Guests: add straight to the localStorage bag, no login required.
      if (!isAuthenticated) {
        if (stock <= 0) {
          setError("This item is out of stock.")
          setIsOpen(true)
          return
        }

        let blocked = false
        setItems((prev) => {
          const color = item.color ?? ""
          const line = { ...item, color }
          const alreadyInCart = qtyAgainstStock(prev, line)
          const remaining = stock - alreadyInCart
          if (remaining <= 0) {
            blocked = true
            return prev
          }

          const allowedQty = Math.min(addQty, remaining)
          const existing = prev.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === color,
          )
          const next =
            existing >= 0
              ? prev.map((i, idx) =>
                  idx === existing
                    ? { ...i, qty: i.qty + allowedQty, stock }
                    : i,
                )
              : [
                  ...prev,
                  { ...item, color, qty: allowedQty, stock },
                ]
          writeGuestCart(next)
          return next
        })

        if (blocked) {
          setError(
            stock === 1
              ? "Only 1 left in stock — it's already in your bag."
              : `Only ${stock} left in stock — your bag already has the maximum.`,
          )
          setIsOpen(true)
        }
        return
      }

      try {
        await addCartItem({
          product_id: item.productId,
          size: item.size,
          color: item.color ?? "",
          quantity: addQty,
        })
        await loadCart()
      } catch (err) {
        setError(getErrorMessage(err, "Unable to add item to bag."))
        setIsOpen(true)
      }
    },
    [isAuthenticated, loadCart],
  )

  const updateQuantity = useCallback(
    async (slug: string, size: string, color: string, qty: number) => {
      setError(null)
      const target = items.find(
        (item) =>
          item.slug === slug && item.size === size && item.color === color,
      )
      if (!target) return

      const stock = Math.max(0, target.stock ?? 0)
      const othersQty = qtyAgainstStock(items, target, {
        size: target.size,
        color: target.color,
      })
      const maxForLine = Math.max(1, stock - othersQty)
      const nextQty = Math.min(maxForLine, Math.max(1, Math.floor(qty)))

      if (Math.floor(qty) > maxForLine) {
        setError(
          stock === 1
            ? "Only 1 left in stock."
            : `Only ${stock} left in stock.`,
        )
      }

      if (target.qty === nextQty) return

      // Optimistic update for both guests and members.
      setItems((prev) => {
        const next = prev.map((item) =>
          item.slug === slug && item.size === size && item.color === color
            ? { ...item, qty: nextQty }
            : item,
        )
        if (!isAuthenticated) writeGuestCart(next)
        return next
      })

      if (!isAuthenticated || !target.cartItemId) return

      try {
        await updateCartItem(target.cartItemId, nextQty)
      } catch (err) {
        setError(getErrorMessage(err, "Unable to update quantity."))
        // Revert to the server's source of truth.
        await loadCart()
      }
    },
    [isAuthenticated, items, loadCart],
  )

  const removeItem = useCallback(
    async (slug: string, size: string, color: string) => {
      setError(null)

      if (!isAuthenticated) {
        setItems((prev) => {
          const next = prev.filter(
            (item) =>
              !(
                item.slug === slug &&
                item.size === size &&
                item.color === color
              ),
          )
          writeGuestCart(next)
          return next
        })
        return
      }

      const target = items.find(
        (item) =>
          item.slug === slug && item.size === size && item.color === color,
      )
      if (!target?.cartItemId) {
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(
                item.slug === slug &&
                item.size === size &&
                item.color === color
              ),
          ),
        )
        return
      }

      try {
        await removeCartItem(target.cartItemId)
        await loadCart()
      } catch (err) {
        setError(getErrorMessage(err, "Unable to remove item."))
      }
    },
    [isAuthenticated, items, loadCart],
  )

  const handleCheckout = useCallback(async () => {
    setError(null)

    if (items.length === 0) {
      return
    }

    // Guests complete checkout on the dedicated page (email + address form).
    if (!isAuthenticated) {
      router.push("/checkout")
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
        updateQuantity,
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
