import Image from "next/image"
import Link from "next/link"

export function EditorialSplit() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-muted">
          <Image
            src="/campaign/editorial-1.png"
            alt="Editorial campaign imagery"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Our philosophy</p>
          <h2 className="mt-4 text-balance font-serif text-4xl leading-tight md:text-5xl">
            Fewer things, better made
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Every piece begins with the material. We work with mills that share our standards — virgin wool, grade-A cashmere, organic cotton and full-grain leather — then cut clean, enduring shapes around them.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The result is a wardrobe you reach for again and again, season after season.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-accent underline-offset-4 hover:underline"
          >
            Discover the materials →
          </Link>
        </div>
      </div>
    </section>
  )
}
