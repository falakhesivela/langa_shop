"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { type Product, mapShopProduct } from "@/lib/products"
import { useAuth } from "@/lib/auth/context"
import {
  addWishlistItem,
  listWishlistItems,
  removeWishlistItem,
} from "@/lib/api/wishlist"
import {
  WISHLIST_KEY,
  clearWishlist,
  readWishlist,
  writeWishlist,
} from "@/lib/wishlist/storage"

type WishlistContextValue = {
  items: Product[]
  count: number
  isReady: boolean
  isSaved: (productId: number) => boolean
  toggle: (product: Product) => Promise<void>
  remove: (productId: number) => Promise<void>
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<Product[]>([])
  const [isReady, setIsReady] = useState(false)

  const loadWishlist = useCallback(async () => {
    // Guests keep their wishlist in localStorage.
    if (!isAuthenticated) {
      setItems(readWishlist())
      setIsReady(true)
      return
    }

    try {
      // Merge any wishlist built while logged out into the server, then adopt
      // the server list as the source of truth (synced across devices).
      const local = readWishlist()
      if (local.length > 0) {
        for (const product of local) {
          try {
            await addWishlistItem(product.id)
          } catch {
            // Skip items that can't be merged (e.g. product removed).
          }
        }
        clearWishlist()
      }

      const apiItems = await listWishlistItems()
      setItems(
        apiItems
          .map((item) => (item.product ? mapShopProduct(item.product) : null))
          .filter((p): p is Product => p !== null),
      )
    } catch {
      setItems([])
    } finally {
      setIsReady(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authLoading) return
    void loadWishlist()
  }, [authLoading, loadWishlist])

  // Cross-tab sync for guests (members are server-backed).
  useEffect(() => {
    if (isAuthenticated) return
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === WISHLIST_KEY) {
        setItems(readWishlist())
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [isAuthenticated])

  const toggle = useCallback(
    async (product: Product) => {
      const wasSaved = items.some((p) => p.id === product.id)

      // Optimistic update for both guests and members.
      setItems((prev) => {
        const next = wasSaved
          ? prev.filter((p) => p.id !== product.id)
          : [product, ...prev]
        if (!isAuthenticated) writeWishlist(next)
        return next
      })

      if (!isAuthenticated) return

      try {
        if (wasSaved) await removeWishlistItem(product.id)
        else await addWishlistItem(product.id)
      } catch {
        // Re-sync with the server on failure.
        await loadWishlist()
      }
    },
    [isAuthenticated, items, loadWishlist],
  )

  const remove = useCallback(
    async (productId: number) => {
      setItems((prev) => {
        const next = prev.filter((p) => p.id !== productId)
        if (!isAuthenticated) writeWishlist(next)
        return next
      })

      if (!isAuthenticated) return

      try {
        await removeWishlistItem(productId)
      } catch {
        await loadWishlist()
      }
    },
    [isAuthenticated, loadWishlist],
  )

  const isSaved = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items],
  )

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isReady,
        isSaved,
        toggle,
        remove,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
