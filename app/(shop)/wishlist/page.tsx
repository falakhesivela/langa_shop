"use client";

import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const { items, isReady, count } = useWishlist();

  if (!isReady) {
    return <p className="py-16 text-center text-muted-foreground">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-serif text-3xl">Your wishlist is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Tap the heart on any product to save it here.
        </p>
        <Button href="/products" className="mt-6">
          Explore products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <h1 className="font-serif text-4xl">Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        {count} saved {count === 1 ? "item" : "items"}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
