"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { mapShopProduct, toApiSort } from "@/lib/products"
import { listProductsPage } from "@/lib/api/products"
import { listCategories } from "@/lib/api/categories"
import type { Product } from "@/lib/products"
import type { Category, ShopProductList } from "@/lib/types/product"

const PAGE_SIZE = 24

type SortKey = "featured" | "price-asc" | "price-desc"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "One Size"]

const PRICE_BANDS: {
  label: string
  min?: number
  max?: number
}[] = [
  { label: "Under R250", max: 25000 },
  { label: "R250 – R500", min: 25000, max: 50000 },
  { label: "R500 – R1 000", min: 50000, max: 100000 },
  { label: "Over R1 000", min: 100000 },
]

type Loaded = {
  key: string
  items: Product[]
  total: number
}

export function ProductsBrowser({
  initialPage = null,
  initialCategories = null,
}: {
  /** First page server-rendered for the current URL (SEO + fast first paint). */
  initialPage?: ShopProductList | null
  initialCategories?: string[] | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get("category") ?? "All"
  const searchQuery = (searchParams.get("search") ?? "").trim()
  const onSaleOnly = searchParams.get("on_sale") === "true"
  const sortParam = searchParams.get("sort")
  const sort: SortKey =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? sortParam
      : "featured"
  const sizeFilter = searchParams.get("size") ?? ""
  const minPrice = searchParams.get("min_price")
  const maxPrice = searchParams.get("max_price")

  const [categoryOptions, setCategoryOptions] = useState<string[]>(
    initialCategories ? ["All", ...initialCategories] : ["All"],
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queryKey = JSON.stringify({
    category,
    searchQuery,
    onSaleOnly,
    sort,
    sizeFilter,
    minPrice,
    maxPrice,
  })

  // Seed with the server-rendered page (it was fetched for this same URL).
  const [loaded, setLoaded] = useState<Loaded | null>(() =>
    initialPage
      ? {
          key: queryKey,
          items: initialPage.items.map(mapShopProduct),
          total: initialPage.total,
        }
      : null,
  )
  const skipInitialFetch = useRef(initialPage != null)

  const buildParams = useCallback(
    (offset: number) => ({
      category: category === "All" ? undefined : category,
      search: searchQuery || undefined,
      sort: toApiSort(
        sort === "price-asc"
          ? "price-asc"
          : sort === "price-desc"
            ? "price-desc"
            : "featured",
      ),
      on_sale: onSaleOnly ? true : undefined,
      size: sizeFilter || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    [category, searchQuery, sort, onSaleOnly, sizeFilter, minPrice, maxPrice],
  )

  const hasInitialCategories = initialCategories != null
  useEffect(() => {
    if (hasInitialCategories) return
    let cancelled = false
    void listCategories()
      .then((cats: Category[]) => {
        if (!cancelled) setCategoryOptions(["All", ...cats.map((c) => c.name)])
      })
      .catch(() => {
        if (!cancelled) setCategoryOptions(["All"])
      })
    return () => {
      cancelled = true
    }
  }, [hasInitialCategories])

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }
    let cancelled = false
    const params = JSON.parse(queryKey) as {
      category: string
      searchQuery: string
      onSaleOnly: boolean
      sort: SortKey
      sizeFilter: string
      minPrice: string | null
      maxPrice: string | null
    }
    listProductsPage({
      category: params.category === "All" ? undefined : params.category,
      search: params.searchQuery || undefined,
      sort: toApiSort(
        params.sort === "price-asc"
          ? "price-asc"
          : params.sort === "price-desc"
            ? "price-desc"
            : "featured",
      ),
      on_sale: params.onSaleOnly ? true : undefined,
      size: params.sizeFilter || undefined,
      min_price: params.minPrice ? Number(params.minPrice) : undefined,
      max_price: params.maxPrice ? Number(params.maxPrice) : undefined,
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((page) => {
        if (cancelled) return
        setLoaded({
          key: queryKey,
          items: page.items.map(mapShopProduct),
          total: page.total,
        })
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load products.")
      })
    return () => {
      cancelled = true
    }
  }, [queryKey])

  const isLoading = !error && loaded?.key !== queryKey
  const products = loaded?.key === queryKey ? loaded.items : []
  const total = loaded?.key === queryKey ? loaded.total : 0
  const hasMore = products.length < total

  async function loadMore() {
    if (!loaded || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const page = await listProductsPage(buildParams(loaded.items.length))
      setLoaded((prev) =>
        prev && prev.key === queryKey
          ? {
              ...prev,
              items: [...prev.items, ...page.items.map(mapShopProduct)],
              total: page.total,
            }
          : prev,
      )
    } catch {
      setError("Unable to load more products.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  function updateUrl(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    const query = params.toString()
    router.replace(query ? `/products?${query}` : "/products", { scroll: false })
  }

  function selectCategory(cat: string) {
    updateUrl((params) => {
      if (cat === "All") params.delete("category")
      else params.set("category", cat)
    })
  }

  function selectSort(value: SortKey) {
    updateUrl((params) => {
      if (value === "featured") params.delete("sort")
      else params.set("sort", value)
    })
  }

  function toggleSize(value: string) {
    updateUrl((params) => {
      if (sizeFilter === value) params.delete("size")
      else params.set("size", value)
    })
  }

  function selectPriceBand(band: (typeof PRICE_BANDS)[number]) {
    const isActive =
      (band.min !== undefined ? String(band.min) : null) === minPrice &&
      (band.max !== undefined ? String(band.max) : null) === maxPrice
    updateUrl((params) => {
      params.delete("min_price")
      params.delete("max_price")
      if (!isActive) {
        if (band.min !== undefined) params.set("min_price", String(band.min))
        if (band.max !== undefined) params.set("max_price", String(band.max))
      }
    })
  }

  function clearFilters() {
    updateUrl((params) => {
      params.delete("size")
      params.delete("min_price")
      params.delete("max_price")
      params.delete("on_sale")
      params.delete("category")
      params.delete("search")
    })
  }

  const activeFilterCount =
    (sizeFilter ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (onSaleOnly ? 1 : 0)
  const hasAnyFilter =
    activeFilterCount > 0 || category !== "All" || Boolean(searchQuery)

  return (
    <div>
      <div className="sticky top-[65px] z-30 -mx-5 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  category === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "border-foreground text-foreground"
                  : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-foreground px-1.5 text-xs text-background">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
            <select
              id="sort"
              value={sort}
              onChange={(e) => selectSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground sm:px-3"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtersOpen ? (
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Size
              </span>
              {SIZE_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSize(value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    sizeFilter === value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Price
              </span>
              {PRICE_BANDS.map((band) => {
                const isActive =
                  (band.min !== undefined ? String(band.min) : null) ===
                    minPrice &&
                  (band.max !== undefined ? String(band.max) : null) === maxPrice
                return (
                  <button
                    key={band.label}
                    type="button"
                    onClick={() => selectPriceBand(band)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {band.label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() =>
                  updateUrl((params) => {
                    if (onSaleOnly) params.delete("on_sale")
                    else params.set("on_sale", "true")
                  })
                }
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  onSaleOnly
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                On sale
              </button>
            </div>
            {hasAnyFilter ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <X className="size-3.5" aria-hidden />
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : null}
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
            : total === 0
              ? "No items"
              : `Showing ${products.length} of ${total} ${total === 1 ? "item" : "items"}`}
        </p>
      )}

      {!isLoading && !error && total === 0 ? (
        <div className="mt-16 flex flex-col items-center py-16 text-center">
          <p className="font-serif text-3xl">No pieces match your filters</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Try removing a filter or two — or browse the full collection for
            something new.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-8 rounded-sm bg-foreground px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-3/4 animate-pulse rounded-sm bg-muted"
                />
              ))
            : products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
        </div>
      )}

      {!isLoading && hasMore ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoadingMore}
            className="rounded-sm border border-foreground px-8 py-3.5 text-sm font-medium uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore
              ? "Loading…"
              : `Load more (${total - products.length} left)`}
          </button>
        </div>
      ) : null}
    </div>
  )
}
