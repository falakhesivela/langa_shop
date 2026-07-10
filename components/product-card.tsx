"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"
import { useCart } from "@/components/cart-context"
import { useWishlist } from "@/components/wishlist-context"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isSaved, toggle } = useWishlist()
  const saved = isSaved(product.id)
  const hasMultipleSizes = product.sizes.length > 1
  const hasMultipleColors = product.colors.length > 1
  const needsSelection = hasMultipleSizes || hasMultipleColors
  const outOfStock = product.stock <= 0

  return (
    <div className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-muted">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
              {product.badge}
            </span>
          )}
          {outOfStock && (
            <span className="absolute left-3 bottom-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
              Out of stock
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              void toggle(product)
            }}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={`size-4.5 ${saved ? "fill-accent text-accent" : "text-foreground"}`}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            // Products with real size options need a choice — let the click
            // fall through to the Link and open the product page instead of
            // silently adding the first size.
            if (needsSelection || outOfStock) return
            e.preventDefault()
            void addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                size: product.sizes[0],
                color: product.colors[0] ?? "",
                stock: product.stock,
                sharesProductStock: Object.keys(product.variantStock).length === 0,
              },
              1,
            )
          }}
          className="absolute bottom-3 left-1/2 w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-sm bg-background/95 py-3 text-xs font-medium uppercase tracking-widest backdrop-blur transition-all duration-300 hover:bg-accent hover:text-accent-foreground opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {outOfStock
            ? "Out of stock"
            : needsSelection
              ? "Choose options"
              : "Quick add"}
        </button>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium leading-snug transition-colors group-hover:text-accent">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-medium">{formatPrice(product.price)}</p>
          {product.isOnSale && product.compareAtPrice != null && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
