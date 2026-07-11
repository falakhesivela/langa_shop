"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { listProducts } from "@/lib/api/products"
import { mapShopProduct, formatPrice, type Product } from "@/lib/products"

/**
 * Expanded header search bar with instant results. Typing shows the top
 * matches inline; Enter (or "Search") still goes to the full results page.
 */
export function SearchTypeahead({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [value, setValue] = useState("")
  // Results tagged with the query they answer; anything else is stale.
  const [loaded, setLoaded] = useState<{ q: string; items: Product[] } | null>(
    null,
  )

  const query = value.trim()

  useEffect(() => {
    if (query.length < 2) return
    const handle = window.setTimeout(() => {
      listProducts({ search: query, limit: 5 })
        .then((items) => setLoaded({ q: query, items: items.map(mapShopProduct) }))
        .catch(() => setLoaded({ q: query, items: [] }))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  const results =
    query.length >= 2 && loaded?.q === query ? loaded.items : null
  const isSearching = query.length >= 2 && loaded?.q !== query

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onClose()
    router.push(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products",
    )
  }

  return (
    <div className="border-t border-border bg-background/95 px-5 py-3 backdrop-blur-md lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-7xl items-center gap-3"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="shrink-0 text-sm font-medium uppercase tracking-wide text-accent"
        >
          Search
        </button>
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </form>

      {query.length >= 2 ? (
        <div className="mx-auto max-w-7xl">
          {isSearching && results === null ? (
            <p className="py-4 text-sm text-muted-foreground">Searching…</p>
          ) : results && results.length > 0 ? (
            <ul className="divide-y divide-border border-t border-border mt-3">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 text-left text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </li>
            </ul>
          ) : results ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nothing found for &ldquo;{query}&rdquo; — try a different word.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
