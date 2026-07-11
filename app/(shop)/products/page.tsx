import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products-browser";
import { listProductsPage } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { toApiSort } from "@/lib/products";
import type { ShopProductList } from "@/lib/types/product";

export const metadata: Metadata = {
  title: `Shop All`,
  description: "Browse the full NewFit collection of women's fashion.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sortParam = first(params.sort);
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc"
      ? sortParam
      : "featured";

  // Server-render the first page for the current URL so the catalog is in the
  // HTML (SEO + faster first paint). The browser component takes over from here.
  let initialPage: ShopProductList | null = null;
  let initialCategories: string[] | null = null;
  try {
    const [page, categories] = await Promise.all([
      listProductsPage({
        category: first(params.category),
        search: first(params.search),
        sort: toApiSort(sort),
        on_sale: first(params.on_sale) === "true" ? true : undefined,
        size: first(params.size),
        min_price: first(params.min_price)
          ? Number(first(params.min_price))
          : undefined,
        max_price: first(params.max_price)
          ? Number(first(params.max_price))
          : undefined,
        limit: 24,
        offset: 0,
      }),
      listCategories(),
    ]);
    initialPage = page;
    initialCategories = categories.map((category) => category.name);
  } catch {
    // API unreachable server-side — the client component fetches on mount.
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
      <header className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">The collection</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Shop All</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Fresh women&apos;s fits — dresses, tops, sets, and street style ready to add to cart.
        </p>
      </header>

      <div className="mt-10">
        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
          <ProductsBrowser
            initialPage={initialPage}
            initialCategories={initialCategories}
          />
        </Suspense>
      </div>
    </main>
  );
}
