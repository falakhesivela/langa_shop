import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryGrid } from "@/components/home/category-grid";
import { SaleProducts } from "@/components/home/sale-products";
import { FeaturedProducts } from "@/components/home/featured-products";
import { EditorialSplit } from "@/components/home/editorial-split";
import { Testimonials } from "@/components/home/testimonials";
import { ClosingCta } from "@/components/home/closing-cta";
import {
  CategoryGridSkeleton,
  ProductRailSkeleton,
} from "@/components/home/skeletons";

// Promotions, sale pricing, and stock change from the admin panel — regenerate
// the storefront at most once a minute instead of freezing it at build time.
export const revalidate = 60;

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <ValueProps />
      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>
      <Suspense fallback={<ProductRailSkeleton rows={2} />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={null}>
        <SaleProducts />
      </Suspense>
      <EditorialSplit />
      <Testimonials />
      <ClosingCta />
    </main>
  );
}
