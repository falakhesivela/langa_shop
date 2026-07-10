import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { listCategories } from "@/lib/api/categories"
import { listProducts } from "@/lib/api/products"
import { resolveMediaUrl } from "@/lib/media"

type CategoryTile = {
  name: string
  href: string
  image: string
  count: number
}

export async function CategoryGrid() {
  let categories: CategoryTile[] = []

  try {
    const [apiCategories, products] = await Promise.all([
      listCategories(),
      listProducts({ sort: "featured" }),
    ])

    categories = apiCategories.slice(0, 6).map((cat) => {
      const inCategory = products.filter(
        (product) => product.category?.toLowerCase() === cat.name.toLowerCase(),
      )
      const match = inCategory.find((product) => product.image)
      return {
        name: cat.name,
        href: `/products?category=${encodeURIComponent(cat.name)}`,
        image: match?.image ? resolveMediaUrl(match.image) : "/placeholder.svg",
        count: inCategory.length,
      }
    })
  } catch {
    categories = []
  }

  if (categories.length === 0) {
    return null
  }

  const [featured, ...rest] = categories

  return (
    <section
      id="shop-categories"
      className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 lg:px-8 lg:py-24"
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Explore</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Shop by category</h2>
        </div>
        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        <CategoryCard
          category={featured}
          className="md:col-span-2 md:row-span-2"
          imageClassName="aspect-4/5 md:aspect-auto md:h-full"
          sizes="(max-width: 768px) 80vw, 66vw"
          large
        />
        {rest.map((cat) => (
          <CategoryCard
            key={cat.name}
            category={cat}
            imageClassName="aspect-4/5"
            sizes="(max-width: 768px) 80vw, 33vw"
          />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  className = "",
  imageClassName,
  sizes,
  large = false,
}: {
  category: CategoryTile
  className?: string
  imageClassName: string
  sizes: string
  large?: boolean
}) {
  return (
    <Link
      href={category.href}
      className={`group relative w-[80%] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[55%] md:w-auto ${className}`}
    >
      <div className={`relative bg-muted ${imageClassName}`}>
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white lg:p-6">
        <div>
          <h3 className={`font-serif ${large ? "text-3xl lg:text-4xl" : "text-2xl"}`}>
            {category.name}
          </h3>
          {category.count > 0 ? (
            <p className="mt-1 text-xs uppercase tracking-widest text-white/75">
              {category.count} {category.count === 1 ? "piece" : "pieces"}
            </p>
          ) : null}
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}
