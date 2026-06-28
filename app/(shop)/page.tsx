import { Hero } from "@/components/home/hero";
import { ValueProps } from "@/components/home/value-props";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { EditorialSplit } from "@/components/home/editorial-split";

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <ValueProps />
      <CategoryGrid />
      <FeaturedProducts />
      <EditorialSplit />
    </main>
  );
}
