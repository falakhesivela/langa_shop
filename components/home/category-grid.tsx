import Image from "next/image"
import Link from "next/link"

const categories = [
  { name: "Outerwear", image: "/products/wool-coat.png", href: "/products?category=Outerwear" },
  { name: "Knitwear", image: "/products/cashmere-knit.png", href: "/products?category=Knitwear" },
  { name: "Accessories", image: "/products/leather-bag.png", href: "/products?category=Accessories" },
]

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Explore</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Shop by category</h2>
        </div>
        <Link
          href="/products"
          className="hidden shrink-0 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline sm:inline"
        >
          View all
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.name} href={cat.href} className="group relative overflow-hidden rounded-sm">
            <div className="relative aspect-4/5 bg-muted">
              <Image
                src={cat.image || "/placeholder.svg"}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-background">
              <h3 className="font-serif text-2xl">{cat.name}</h3>
              <span className="text-sm uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
                Shop →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
