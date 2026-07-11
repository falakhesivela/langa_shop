"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { ColorSwatch } from "@/components/color-swatch";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, isLoading, error, updateQuantity, removeItem } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16 text-center">
        <p className="text-muted-foreground">Loading your bag…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-md px-5 py-24 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-6 font-serif text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Fill it with something you&apos;ll love.
        </p>
        <Button href="/products" className="mt-8">
          Continue shopping
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
      <h1 className="font-serif text-4xl md:text-5xl">Your bag</h1>
      <p className="mt-2 text-muted-foreground">
        {items.reduce((sum, item) => sum + item.qty, 0)} item
        {items.length === 1 && items[0].qty === 1 ? "" : "s"}
      </p>

      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <ul className="divide-y divide-border border-t border-border">
          {items.map((item) => {
            const productQty = items
              .filter((i) => i.productId === item.productId)
              .reduce((sum, i) => sum + i.qty, 0);
            return (
              <li
                key={`${item.slug}-${item.size}-${item.color}`}
                className="flex gap-5 py-6"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-28"
                >
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium leading-snug underline-offset-4 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Size {item.size}
                        {item.color ? (
                          <>
                            {" "}
                            ·{" "}
                            <span className="inline-flex items-center gap-1.5 align-middle">
                              <ColorSwatch color={item.color} size="sm" />
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
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
                        className="flex size-10 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm tabular-nums">
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
                        disabled={item.stock > 0 && productQty >= item.stock}
                        aria-label="Increase quantity"
                        className="flex size-10 items-center justify-center transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        void removeItem(item.slug, item.size, item.color)
                      }
                      aria-label={`Remove ${item.name}`}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-sm border border-border p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <Button href="/checkout" className="mt-6 w-full">
            Checkout — {formatPrice(subtotal)}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Discount codes are applied at checkout.
          </p>
          <Link
            href="/products"
            className="mt-4 block text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
