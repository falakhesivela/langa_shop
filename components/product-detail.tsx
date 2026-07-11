"use client"

import { useEffect, useState, type KeyboardEvent, type TouchEvent } from "react"
import Image from "next/image"
import { Minus, Plus, Check, Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"
import { useCart } from "@/components/cart-context"
import { useWishlist } from "@/components/wishlist-context"
import { ColorSwatch } from "@/components/color-swatch"
import { getVariantStock } from "@/lib/stock"
import { useToast } from "@/components/ui/Toast"
import { StockAlertForm } from "@/components/stock-alert-form"

type SizeGuide = {
  columns: string[]
  rows: string[][]
  note: string
}

// Category-specific measurement tables (cm). Categories are matched by
// keyword; anything unrecognized falls back to the tops guide, and one-size
// products hide the guide entirely.
const TOPS_GUIDE: SizeGuide = {
  columns: ["Size", "Bust", "Waist", "Hip"],
  rows: [
    ["XS", "80–84", "62–66", "86–90"],
    ["S", "84–88", "66–70", "90–94"],
    ["M", "88–92", "70–74", "94–98"],
    ["L", "92–98", "74–80", "98–104"],
    ["XL", "98–104", "80–86", "104–110"],
  ],
  note: "Body measurements in centimetres. If between sizes, size up.",
}

const BOTTOMS_GUIDE: SizeGuide = {
  columns: ["Size", "Waist", "Hip", "Inseam"],
  rows: [
    ["XS", "62–66", "86–90", "74"],
    ["S", "66–70", "90–94", "75"],
    ["M", "70–74", "94–98", "76"],
    ["L", "74–80", "98–104", "77"],
    ["XL", "80–86", "104–110", "78"],
  ],
  note: "Body measurements in centimetres. Inseam is the finished garment length.",
}

const BOTTOMS_KEYWORDS = ["trouser", "pant", "jean", "skirt", "short", "bottom"]

function sizeGuideFor(category: string, sizes: string[]): SizeGuide | null {
  // One-size products (accessories, bags) have nothing to measure against.
  const onlyOneSize =
    sizes.length <= 1 && (sizes[0] ?? "One Size").toLowerCase() === "one size"
  if (onlyOneSize) return null
  const normalized = category.toLowerCase()
  if (BOTTOMS_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return BOTTOMS_GUIDE
  }
  return TOPS_GUIDE
}

function SizeGuideDialog({
  open,
  onClose,
  guide,
}: {
  open: boolean
  onClose: () => void
  guide: SizeGuide
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close size guide"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-sm bg-background p-6 shadow-xl sm:rounded-sm sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="size-guide-title" className="font-serif text-2xl">
              Size guide
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{guide.note}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              {guide.columns.map((column, index) => (
                <th
                  key={column}
                  className={`py-2 font-medium ${index < guide.columns.length - 1 ? "pr-3" : ""}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row[0]} className="border-b border-border/70">
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={`py-2.5 ${index < row.length - 1 ? "pr-3" : ""} ${
                      index === 0 ? "font-medium" : "tabular-nums"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const { toast } = useToast()
  const { isSaved, toggle } = useWishlist()
  const saved = isSaved(product.id)
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "")
  const [color, setColor] = useState(
    product.colors.length === 1 ? product.colors[0] : "",
  )
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const sizeGuide = sizeGuideFor(product.category, product.sizes)
  const hasVariants = Object.keys(product.variantStock).length > 0
  const selectedStock =
    size || product.sizes.length === 1
      ? getVariantStock(
          product.variantStock,
          product.stock,
          size || product.sizes[0],
          color || (product.colors[0] ?? ""),
        )
      : product.stock

  const inCartQty = items
    .filter((item) => {
      if (item.productId !== product.id) return false
      if (!hasVariants) return true
      return (
        item.size === (size || product.sizes[0]) &&
        item.color === (color || (product.colors[0] ?? ""))
      )
    })
    .reduce((sum, item) => sum + item.qty, 0)
  const remaining = Math.max(0, selectedStock - inCartQty)
  const outOfStock = selectedStock <= 0
  const maxQty = Math.max(1, remaining || (outOfStock ? 1 : selectedStock))
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [colorError, setColorError] = useState(false)

  // Keep the selector within what's still available as the bag changes.
  const effectiveQty = Math.min(qty, Math.max(1, remaining || 1))

  function sizeAvailable(s: string) {
    if (!hasVariants) return true
    if (product.colors.length === 0) {
      return getVariantStock(product.variantStock, product.stock, s, "") > 0
    }
    const checkColor = color || product.colors[0]
    if (!checkColor && product.colors.length > 1) {
      return product.colors.some(
        (c) => getVariantStock(product.variantStock, product.stock, s, c) > 0,
      )
    }
    return getVariantStock(product.variantStock, product.stock, s, checkColor) > 0
  }

  async function handleAdd() {
    if (outOfStock || remaining <= 0) return
    const needsSize = product.sizes.length > 1
    const needsColor = product.colors.length > 1
    if (needsSize && !size) {
      setSizeError(true)
      return
    }
    if (needsColor && !color) {
      setColorError(true)
      return
    }
    const resolvedSize = size || product.sizes[0]
    const resolvedColor = color || (product.colors[0] ?? "")
    const added = await addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        size: resolvedSize,
        color: resolvedColor,
        stock: getVariantStock(
          product.variantStock,
          product.stock,
          resolvedSize,
          resolvedColor,
        ),
        sharesProductStock: !hasVariants,
      },
      Math.min(effectiveQty, remaining),
    )
    if (added) {
      toast(`${product.name} added to your bag.`)
    }
  }

  return (
    <div>
      {sizeGuide ? (
        <SizeGuideDialog
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          guide={sizeGuide}
        />
      ) : null}
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{product.category}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
      <div className="mt-4 flex items-baseline gap-3">
        <p className="text-2xl">{formatPrice(product.price)}</p>
        {product.isOnSale && product.compareAtPrice != null && (
          <p className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice)}
          </p>
        )}
      </div>

      <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

      {/* Size selector */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide">
            Size {product.sizes.length === 1 && <span className="text-muted-foreground">— One size</span>}
          </span>
          {sizeGuide ? (
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Size guide
            </button>
          ) : null}
        </div>
        {product.sizes.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const available = sizeAvailable(s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  onClick={() => {
                    setSize(s)
                    setSizeError(false)
                  }}
                  className={`min-w-12 rounded-sm border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        )}
        {sizeError && <p className="mt-2 text-sm text-accent">Please select a size.</p>}
      </div>

      {product.colors.length > 0 && (
        <div className="mt-8">
          <span className="text-sm font-medium uppercase tracking-wide">
            Color{" "}
            {product.colors.length === 1 && (
              <span className="text-muted-foreground">— One color</span>
            )}
          </span>
          {product.colors.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((value) => {
                const checkSize = size || (product.sizes.length === 1 ? product.sizes[0] : "")
                const available =
                  !hasVariants ||
                  !checkSize ||
                  getVariantStock(product.variantStock, product.stock, checkSize, value) > 0
                return (
                  <ColorSwatch
                    key={value}
                    color={value}
                    selected={color === value}
                    disabled={!available}
                    onClick={() => {
                      if (!available) return
                      setColor(value)
                      setColorError(false)
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="mt-3">
              <ColorSwatch color={product.colors[0]} />
            </div>
          )}
          {colorError && (
            <p className="mt-2 text-sm text-accent">Please select a color.</p>
          )}
        </div>
      )}

      {/* Quantity + Add */}
      <div className="mt-8 flex items-stretch gap-3">
        <div className="flex items-center rounded-sm border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || remaining <= 0}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{effectiveQty}</span>
          <button
            onClick={() =>
              setQty((q) => Math.min(maxQty, Math.max(1, remaining), q + 1))
            }
            disabled={outOfStock || remaining <= 0 || effectiveQty >= remaining}
            aria-label="Increase quantity"
            className="flex size-12 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          onClick={() => void handleAdd()}
          disabled={outOfStock || remaining <= 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {outOfStock
            ? "Out of stock"
            : remaining <= 0
              ? "Max in bag"
              : `Add to bag — ${formatPrice(product.price * effectiveQty)}`}
        </button>
        <button
          type="button"
          onClick={() => void toggle(product)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className={`flex size-12 items-center justify-center rounded-sm border transition-colors ${
            saved
              ? "border-accent bg-accent/10 text-accent"
              : "border-border hover:bg-muted"
          }`}
        >
          <Heart className={`size-5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
      {!outOfStock && selectedStock <= 5 && (
        <p className="mt-3 text-sm text-accent">
          {remaining <= 0
            ? "You've added all available stock to your bag."
            : selectedStock === 1
              ? "Only 1 left"
              : `Only ${selectedStock} left`}
        </p>
      )}
      {outOfStock && (
        <>
          <p className="mt-3 text-sm text-accent">
            This item is currently out of stock.
          </p>
          <StockAlertForm
            productId={product.id}
            size={size || product.sizes[0]}
            color={color || product.colors[0]}
          />
        </>
      )}

      {/* Details */}
      <dl className="mt-10 divide-y divide-border border-t border-border">
        <div className="flex justify-between gap-6 py-4">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Materials</dt>
          <dd className="text-right text-sm">{product.materials}</dd>
        </div>
        <div className="py-4">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Details</dt>
          <dd className="mt-3">
            <ul className="flex flex-col gap-2">
              {product.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {d}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function ProductGallery({ product }: { product: Product }) {
  const images =
    product.images.length > 0
      ? product.images
      : product.image
        ? [
            {
              id: 0,
              url: product.image,
              altText: product.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ]
        : []

  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasMultiple = images.length > 1
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0))
  const active = images[safeIndex]

  function goTo(index: number) {
    if (images.length === 0) return
    const next = ((index % images.length) + images.length) % images.length
    setActiveIndex(next)
  }

  // Lock scroll and handle keys while the zoom overlay is open.
  useEffect(() => {
    if (!lightboxOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) => (i - 1 + images.length) % images.length)
      }
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (i + 1) % images.length)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [lightboxOpen, images.length])

  function onKeyDown(e: KeyboardEvent) {
    if (!hasMultiple) return
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      goTo(safeIndex - 1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      goTo(safeIndex + 1)
    }
  }

  function onTouchStart(e: TouchEvent) {
    setTouchStartX(e.touches[0]?.clientX ?? null)
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchStartX == null || !hasMultiple) return
    const delta = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
    setTouchStartX(null)
    if (Math.abs(delta) < 40) return
    goTo(delta < 0 ? safeIndex + 1 : safeIndex - 1)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${product.name} images`}
        tabIndex={hasMultiple ? 0 : undefined}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="group relative aspect-3/4 overflow-hidden rounded-sm bg-muted outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
      >
        {active ? (
          <Image
            key={active.id}
            src={active.url || "/placeholder.svg"}
            alt={active.altText || product.name}
            fill
            priority={safeIndex === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover animate-in fade-in duration-300"
          />
        ) : (
          <Image
            src="/placeholder.svg"
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        )}

        {active ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Zoom image"
            className="absolute inset-0 z-[5] cursor-zoom-in"
          />
        ) : null}

        {product.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
            {product.badge}
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(safeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(safeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-[11px] tabular-nums tracking-wide text-foreground backdrop-blur">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((img, index) => {
            const selected = index === safeIndex
            return (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`View image ${index + 1} of ${images.length}`}
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-sm transition-[opacity,box-shadow] sm:w-20 ${
                  selected
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url || "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {lightboxOpen && active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image zoom`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95"
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setLightboxOpen(false)}
            className="absolute inset-0 cursor-zoom-out"
          />
          <div className="pointer-events-none relative h-[88vh] w-[94vw] max-w-6xl">
            <Image
              key={active.id}
              src={active.url || "/placeholder.svg"}
              alt={active.altText || product.name}
              fill
              sizes="94vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
          >
            <X className="size-5" />
          </button>
          {hasMultiple ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goTo(safeIndex - 1)}
                className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goTo(safeIndex + 1)}
                className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-[11px] tabular-nums tracking-wide text-foreground backdrop-blur">
                {safeIndex + 1} / {images.length}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
