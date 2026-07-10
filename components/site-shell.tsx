"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/components/cart-context"
import { WishlistProvider } from "@/components/wishlist-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartDrawer } from "@/components/cart-drawer"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SiteHeader />
        <div className="min-h-screen">{children}</div>
        <SiteFooter />
        <CartDrawer />
      </WishlistProvider>
    </CartProvider>
  )
}
