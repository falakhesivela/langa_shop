import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const highlights = [
  "New drops every week",
  "Cute, bold & street-ready styles",
  "Prices made for add-to-cart energy",
]

export function EditorialSplit() {
  return (
    <section className="bg-secondary py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative sm:pb-14 sm:pr-16">
            <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-muted">
              <Image
                src="/campaign/editorial-1.png"
                alt="Editorial campaign imagery"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 hidden w-2/5 overflow-hidden rounded-sm border-6 border-secondary bg-muted sm:block">
              <div className="relative aspect-3/4">
                <Image
                  src="/campaign/editorial-2.png"
                  alt="Detail of a NewFit outfit"
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Why NewFit</p>
            <h2 className="mt-4 text-balance font-serif text-4xl leading-tight md:text-5xl">
              Your next outfit, now
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Scroll, tap, and find the fit. NewFit brings trendy women&apos;s fashion with fresh drops and looks that keep up with you.
            </p>
            <ul className="mt-7 flex flex-col gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/products"
              className="mt-9 inline-flex items-center gap-2 rounded-sm bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop new fits
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
