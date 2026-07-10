"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { mapShopProduct, toApiSort } from "@/lib/products"
import { listProducts } from "@/lib/api/products"
import { listCategories } from "@/lib/api/categories"
import type { Product } from "@/lib/products"
import type { Category } from "@/lib/types/product"

type SortKey = "featured" | "price-asc" | "price-desc"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export function ProductsBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") ?? "All"
  const searchQuery = (searchParams.get("search") ?? "").trim()
  const onSaleOnly = searchParams.get("on_sale") === "true"

  const [categoryOptions, setCategoryOptions] = useState<string[]>(["All"])
  const [active, setActive] = useState<string>(initialCategory)
  const [sort, setSort] = useState<SortKey>("featured")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void listCategories()
      .then((cats: Category[]) => {
        if (cancelled) return
        const names = ["All", ...cats.map((c) => c.name)]
        setCategoryOptions(names)
        if (initialCategory !== "All" && !names.includes(initialCategory)) {
          setActive("All")
        }
      })
      .catch(() => {
        if (!cancelled) setCategoryOptions(["All"])
      })
    return () => {
      cancelled = true
    }
  }, [initialCategory])

  useEffect(() => {
    setActive(searchParams.get("category") ?? "All")
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const apiProducts = await listProducts({
          category: active === "All" ? undefined : active,
          search: searchQuery || undefined,
          sort: toApiSort(sort),
          on_sale: onSaleOnly ? true : undefined,
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
  }, [active, sort, onSaleOnly, searchQuery])

  const filtered = useMemo(() => products, [products])

  function selectCategory(cat: string) {
    setActive(cat)
    const params = new URLSearchParams(searchParams.toString())
    if (cat === "All") {
      params.delete("category")
    } else {
      params.set("category", cat)
    }
    const query = params.toString()
    router.replace(query ? `/products?${query}` : "/products", { scroll: false })
  }

  return (
    <div>
      <div className="sticky top-[65px] z-30 -mx-5 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
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

      {searchQuery ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Results for{" "}
          <span className="text-foreground">&ldquo;{searchQuery}&rdquo;</span>
        </p>
      ) : null}

      {error ? (
        <p className={`text-sm text-accent ${searchQuery ? "mt-2" : "mt-6"}`}>{error}</p>
      ) : (
        <p className={`text-sm text-muted-foreground ${searchQuery ? "mt-2" : "mt-6"}`}>
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
