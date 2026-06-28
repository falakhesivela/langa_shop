import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <Image
          src="/campaign/hero.png"
          alt="Model wearing the Atelier autumn collection"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-5 pb-14 lg:px-8 lg:pb-20">
            <div className="max-w-xl text-background">
              <p className="text-sm uppercase tracking-[0.3em]">Autumn / Winter</p>
              <h1 className="mt-4 text-balance font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
                Quiet luxury, made to last
              </h1>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-background/85">
                A considered edit of natural-fibre essentials. Refined tailoring, honest materials, and silhouettes that never date.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-sm bg-background px-7 py-3.5 text-sm font-medium uppercase tracking-widest text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Shop the collection
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/products?category=Outerwear"
                  className="inline-flex items-center gap-2 rounded-sm border border-background/60 px-7 py-3.5 text-sm font-medium uppercase tracking-widest text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  Outerwear
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
