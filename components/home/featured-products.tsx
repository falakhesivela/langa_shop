import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { listProducts } from "@/lib/api/products"
import { mapShopProduct } from "@/lib/products"

export async function FeaturedProducts() {
  let featured: ReturnType<typeof mapShopProduct>[] = []
  try {
    featured = (await listProducts({ sort: "featured", limit: 8 })).map(
      mapShopProduct,
    )
  } catch {
    return null
  }

  if (featured.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Just landed</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">New arrivals</h2>
        </div>
        <Link
          href="/products"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline sm:inline-flex"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-sm border border-foreground px-8 py-3.5 text-sm font-medium uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
        >
          Shop all products
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}
