"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, User } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { useAuth } from "@/lib/auth/context"
import { APP_NAME } from "@/lib/config"

const navLinks = [
  { href: "/products", label: "Shop All" },
  { href: "/products?category=Outerwear", label: "Outerwear" },
  { href: "/products?category=Knitwear", label: "Knitwear" },
  { href: "/products?category=Accessories", label: "Accessories" },
]

export function SiteHeader() {
  const { count, open } = useCart()
  const { user } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
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

        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-[0.2em] lg:text-3xl"
        >
          {APP_NAME.toUpperCase()}
        </Link>

        <div className="flex flex-1 items-center justify-end gap-1">
          <button
            aria-label="Search"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <Search className="size-5" />
          </button>
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

      <div
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <nav
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-card text-card-foreground shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-serif text-lg tracking-[0.2em]">{APP_NAME.toUpperCase()}</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1 px-3 py-4">
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
            href={user ? "/account" : "/login"}
            className="rounded-sm px-3 py-3 font-serif text-xl transition-colors hover:bg-muted"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        </div>
      </nav>
    </header>
  )
}
