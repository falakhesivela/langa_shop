import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/api/products";
import { mapShopProduct } from "@/lib/products";
import { ProductPurchase, ProductGallery } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = mapShopProduct(await getProductBySlug(slug));
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: "Not found" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = mapShopProduct(await getProductBySlug(slug));
  } catch {
    notFound();
  }

  const allProducts = (await listProducts()).map(mapShopProduct);
  const related = allProducts
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);
  const fallback = allProducts.filter((p) => p.slug !== product.slug).slice(0, 4);
  const recommendations = related.length >= 2 ? related : fallback;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-8 lg:px-8 lg:pt-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery product={product} />
        <div className="lg:py-4">
          <ProductPurchase product={product} />
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl md:text-4xl">You may also like</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {recommendations.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
