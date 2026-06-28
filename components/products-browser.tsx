"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { categories, mapShopProduct, toApiSort } from "@/lib/products"
import { listProducts } from "@/lib/api/products"
import type { Product } from "@/lib/products"

type SortKey = "featured" | "price-asc" | "price-desc"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export function ProductsBrowser() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") ?? "All"
  const [active, setActive] = useState<string>(
    categories.includes(initialCategory as (typeof categories)[number]) ? initialCategory : "All",
  )
  const [sort, setSort] = useState<SortKey>("featured")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const apiProducts = await listProducts({
          category: active === "All" ? undefined : active,
          sort: toApiSort(sort),
        })

        if (!cancelled) {
          setProducts(apiProducts.map(mapShopProduct))
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load products.")
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [active, sort])

  const filtered = useMemo(() => products, [products])

  return (
    <div>
      <div className="sticky top-[65px] z-30 -mx-5 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-6 text-sm text-accent">{error}</p>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          {isLoading
            ? "Loading products…"
            : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-3/4 animate-pulse rounded-sm bg-muted"
              />
            ))
          : filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
      </div>
    </div>
  )
}
