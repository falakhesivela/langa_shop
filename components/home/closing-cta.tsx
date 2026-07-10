import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ClosingCta() {
  return (
    <section className="relative">
      <div className="relative h-[55vh] min-h-105 w-full overflow-hidden">
        <Image
          src="/campaign/hero.png"
          alt="The full collection"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-2xl px-5 text-center text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/75">
              The collection
            </p>
            <h2 className="mt-4 text-balance font-serif text-4xl leading-tight md:text-6xl">
              Wear it for years, not seasons
            </h2>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-sm bg-white px-8 py-4 text-sm font-medium uppercase tracking-widest text-neutral-900 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Shop all
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/products?on_sale=true"
                className="inline-flex items-center gap-2 rounded-sm border border-white/60 px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-neutral-900"
              >
                Shop sale
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
