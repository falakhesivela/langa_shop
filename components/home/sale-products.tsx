import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { listProducts } from "@/lib/api/products"
import { listActivePromotions } from "@/lib/api/promotions"
import { PromoCountdown } from "@/components/home/promo-countdown"
import { mapShopProduct } from "@/lib/products"

export async function SaleProducts() {
  let products: ReturnType<typeof mapShopProduct>[] = []
  let promo: Awaited<ReturnType<typeof listActivePromotions>>[number] | null =
    null

  try {
    const [saleProducts, promotions] = await Promise.all([
      listProducts({ on_sale: true, sort: "featured", limit: 4 }),
      listActivePromotions("sale_collection"),
    ])
    products = saleProducts.map(mapShopProduct)
    promo = promotions[0] ?? null
  } catch {
    return null
  }

  if (products.length === 0) return null

  const maxDiscount = Math.max(
    0,
    ...products
      .filter((p) => p.compareAtPrice != null && p.compareAtPrice > 0)
      .map((p) => Math.round((1 - p.price / (p.compareAtPrice as number)) * 100)),
  )

  const title = promo?.title ?? "The seasonal sale"
  const subtitle =
    promo?.subtitle ??
    "Selected pieces from the collection, marked down while stock lasts."
  const ctaHref = promo?.cta_href ?? "/products?on_sale=true"
  const ctaLabel = promo?.cta_label ?? "Shop the sale"

  return (
    <section className="bg-foreground py-16 text-background lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-background/60">
              Limited time
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl md:text-5xl">
              {title}
              {maxDiscount > 0 ? (
                <span className="mt-2 block text-accent">
                  Up to {maxDiscount}% off
                </span>
              ) : null}
            </h2>
            <p className="mt-4 leading-relaxed text-background/70">{subtitle}</p>
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            {promo?.ends_at ? <PromoCountdown endsAt={promo.ends_at} /> : null}
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-sm bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-accent-foreground transition-opacity hover:opacity-90"
            >
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 rounded-sm bg-background p-4 text-foreground sm:p-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
