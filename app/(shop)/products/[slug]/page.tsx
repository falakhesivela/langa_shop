import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, listProducts } from "@/lib/api/products";
import { mapShopProduct } from "@/lib/products";
import { ProductPurchase, ProductGallery } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/reviews/product-reviews";
import { JsonLd } from "@/components/json-ld";
import { listProductReviews } from "@/lib/api/reviews";
import type { ReviewList } from "@/lib/types/review";
import { APP_NAME, DEFAULT_CURRENCY, SITE_URL } from "@/lib/config";

// Stock and pricing are validated server-side at add-to-cart and checkout, so
// a few minutes of staleness here is safe — and lets PDPs be cached/served fast.
export const revalidate = 300;

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
      openGraph: {
        title: product.name,
        description: product.description,
        type: "website",
        url: `/products/${product.slug}`,
        images: product.image ? [{ url: product.image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: product.image ? [product.image] : undefined,
      },
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

  // Prefer same-category products; top up from the featured list when the
  // category is thin. (Server-side limits arrive with the paginated API.)
  let recommendations: ReturnType<typeof mapShopProduct>[] = [];
  try {
    const sameCategory = (
      await listProducts({
        category: product.category,
        sort: "featured",
        limit: 8,
      })
    )
      .map(mapShopProduct)
      .filter((p) => p.slug !== product.slug);
    recommendations = sameCategory.slice(0, 4);
    if (recommendations.length < 2) {
      const featured = (await listProducts({ sort: "featured", limit: 8 }))
        .map(mapShopProduct)
        .filter(
          (p) =>
            p.slug !== product.slug &&
            !recommendations.some((r) => r.slug === p.slug),
        );
      recommendations = [...recommendations, ...featured].slice(0, 4);
    }
  } catch {
    recommendations = [];
  }

  let reviews: ReviewList = {
    items: [],
    total: 0,
    average_rating: null,
    rating_counts: {},
  };
  try {
    reviews = await listProductReviews(product.id);
  } catch {
    // Reviews are non-critical; render the page without them.
  }

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    sku: String(product.id),
    brand: { "@type": "Brand", name: APP_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: DEFAULT_CURRENCY,
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
  if (reviews.total > 0 && reviews.average_rating != null) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.average_rating,
      reviewCount: reviews.total,
    };
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${SITE_URL}/products`,
      },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-8 lg:px-8 lg:pt-10">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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

      <ProductReviews productId={product.id} initialReviews={reviews} />

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
