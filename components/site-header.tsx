"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, User, Heart } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { useWishlist } from "@/components/wishlist-context"
import { BrandLogo } from "@/components/brand-logo"
import { SearchTypeahead } from "@/components/search-typeahead"
import { useAuth } from "@/lib/auth/context"
import { APP_NAME } from "@/lib/config"
import { listCategories } from "@/lib/api/categories"
import type { Category } from "@/lib/types/product"

export function SiteHeader() {
  const { count, open } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [navLinks, setNavLinks] = useState([
    { href: "/products", label: "Shop All" },
  ])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close overlays when the route changes — done as a render-time state
  // adjustment (React's recommended pattern) instead of an effect.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
  }

  useEffect(() => {
    let cancelled = false
    void listCategories()
      .then((cats: Category[]) => {
        if (cancelled) return
        setNavLinks([
          { href: "/products", label: "Shop All" },
          ...cats.slice(0, 4).map((cat) => ({
            href: `/products?category=${encodeURIComponent(cat.name)}`,
            label: cat.name,
          })),
        ])
      })
      .catch(() => {
        /* keep Shop All only */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [searchOpen])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8 lg:py-1">
          <div className="flex flex-1 items-center gap-6">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <nav className="hidden items-center gap-7 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm tracking-wide text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label={APP_NAME} className="flex items-center">
            <BrandLogo variant="monogram" className="h-11 w-auto lg:hidden" />
            <BrandLogo variant="wordmark" className="hidden w-auto lg:block lg:h-24" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <Search className="size-5" />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Sign in"}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <User className="size-5" />
            </Link>
            <button
              onClick={open}
              aria-label="Open bag"
              className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <SearchTypeahead onClose={() => setSearchOpen(false)} />
        ) : null}
      </header>

      <div
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <nav
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-background text-foreground shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <BrandLogo className="h-16 w-auto" />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-sm px-3 py-3 font-serif text-xl transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            className="rounded-sm px-3 py-3 font-serif text-xl transition-colors hover:bg-muted"
          >
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="rounded-sm px-3 py-3 font-serif text-xl transition-colors hover:bg-muted"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        </div>
      </nav>
    </>
  )
}
