"use client"

import Image from "next/image"
import Link from "next/link"
import { type Product, formatPrice } from "@/lib/products"
import { useCart } from "@/components/cart-context"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

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
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            void addItem(
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                size: product.sizes[0],
              },
              1,
            )
          }}
          className="absolute bottom-3 left-1/2 w-[calc(100%-1.5rem)] -translate-x-1/2 translate-y-2 rounded-sm bg-background/95 py-3 text-xs font-medium uppercase tracking-widest opacity-0 backdrop-blur transition-all duration-300 hover:bg-accent hover:text-accent-foreground group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick add
        </button>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium leading-snug transition-colors group-hover:text-accent">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
        </div>
        <p className="shrink-0 font-medium">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}
