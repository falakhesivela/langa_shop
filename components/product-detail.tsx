"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Check, Heart } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"
import { useCart } from "@/components/cart-context"

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "")
  const [qty, setQty] = useState(1)
  const [error, setError] = useState(false)

  async function handleAdd() {
    if (!size) {
      setError(true)
      return
    }
    await addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
      },
      qty,
    )
  }

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{product.category}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
      <p className="mt-4 text-2xl">{formatPrice(product.price)}</p>

      <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

      {/* Size selector */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-wide">
            Size {product.sizes.length === 1 && <span className="text-muted-foreground">— One size</span>}
          </span>
          <button className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Size guide
          </button>
        </div>
        {product.sizes.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s)
                  setError(false)
                }}
                className={`min-w-12 rounded-sm border px-4 py-2.5 text-sm transition-colors ${
                  size === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-accent">Please select a size.</p>}
      </div>

      {/* Quantity + Add */}
      <div className="mt-8 flex items-stretch gap-3">
        <div className="flex items-center rounded-sm border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex size-12 items-center justify-center transition-colors hover:bg-muted"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex size-12 items-center justify-center transition-colors hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          onClick={() => void handleAdd()}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
        >
          Add to bag — {formatPrice(product.price * qty)}
        </button>
        <button
          aria-label="Add to wishlist"
          className="flex size-12 items-center justify-center rounded-sm border border-border transition-colors hover:bg-muted"
        >
          <Heart className="size-5" />
        </button>
      </div>

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
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur">
            {product.badge}
          </span>
        )}
      </div>
    </div>
  )
}
