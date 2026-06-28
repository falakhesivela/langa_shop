import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products-browser";

export const metadata: Metadata = {
  title: `Shop All`,
  description: "Browse the full collection of natural-fibre essentials.",
};

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
      <header className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">The collection</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Shop All</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          A focused wardrobe of natural-fibre essentials — tailored, knitted and finished to last.
        </p>
      </header>

      <div className="mt-10">
        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
          <ProductsBrowser />
        </Suspense>
      </div>
    </main>
  );
}
