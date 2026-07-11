"use client"

import Image from "next/image"
import Link from "next/link"
import { X, ShoppingBag, Minus, Plus } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { formatPrice } from "@/lib/products"
import { ColorSwatch } from "@/components/color-swatch"

function cartLineKey(item: { slug: string; size: string; color: string }) {
  return `${item.slug}-${item.size}-${item.color}`
}

export function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, count, error } =
    useCart()

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={close}
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Shopping bag"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card text-card-foreground shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-xl">
            Your Bag <span className="text-muted-foreground">({count})</span>
          </h2>
          <button
            onClick={close}
            aria-label="Close bag"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1} />
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link
              href="/products"
              onClick={close}
              className="text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error ? (
                <p className="mb-4 text-sm text-accent">{error}</p>
              ) : null}
              <ul className="flex flex-col gap-6">
                {items.map((item) => (
                  <li key={cartLineKey(item)} className="flex gap-4">
                    <div className="relative aspect-3/4 w-20 shrink-0 overflow-hidden rounded-sm bg-muted">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="font-medium leading-snug">{item.name}</p>
                        <p className="font-medium">{formatPrice(item.price * item.qty)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Size {item.size}
                        {item.color ? (
                          <>
                            {" "}
                            ·{" "}
                            <span className="inline-flex items-center gap-1.5 align-middle">
                              <ColorSwatch color={item.color} size="sm" />
                              {item.color}
                            </span>
                          </>
                        ) : null}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <div className="flex items-center rounded-sm border border-border">
                          <button
                            onClick={() =>
                              void updateQuantity(
                                item.slug,
                                item.size,
                                item.color,
                                item.qty - 1,
                              )
                            }
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                            className="flex size-9 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              void updateQuantity(
                                item.slug,
                                item.size,
                                item.color,
                                item.qty + 1,
                              )
                            }
                            disabled={
                              item.stock > 0 &&
                              items
                                .filter((i) => i.productId === item.productId)
                                .reduce((sum, i) => sum + i.qty, 0) >= item.stock
                            }
                            aria-label="Increase quantity"
                            className="flex size-9 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            void removeItem(item.slug, item.size, item.color)
                          }
                          className="text-xs uppercase tracking-wide text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm uppercase tracking-wide text-muted-foreground">Subtotal</span>
                <span className="font-serif text-xl">{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full rounded-sm bg-primary py-3.5 text-center text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={close}
                className="mt-2 block w-full rounded-sm border border-border py-3 text-center text-sm font-medium uppercase tracking-widest transition-colors hover:bg-muted"
              >
                View bag
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
