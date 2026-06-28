import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { listProducts } from "@/lib/api/products"
import { mapShopProduct } from "@/lib/products"

export async function FeaturedProducts() {
  const featured = (await listProducts({ sort: "featured" }))
    .slice(0, 4)
    .map(mapShopProduct)

  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">The edit</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">New arrivals</h2>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline sm:inline"
          >
            View all
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
