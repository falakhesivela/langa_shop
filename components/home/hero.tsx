import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { listActivePromotions } from "@/lib/api/promotions"
import { PromoCountdown } from "@/components/home/promo-countdown"
import { APP_NAME } from "@/lib/config"

export async function Hero() {
  let promo = null
  try {
    const promotions = await listActivePromotions("hero")
    promo = promotions[0] ?? null
  } catch {
    promo = null
  }

  const eyebrow = promo ? "Limited campaign" : "New drops"
  const title = promo?.title ?? "Cute. Bold. New."
  const subtitle =
    promo?.subtitle ??
    "Trendy women's fits at scroll-and-buy prices. Fresh drops, street energy, and looks you'll actually wear."
  const imageSrc = promo?.image_url || "/campaign/hero.png"
  const primaryHref = promo?.cta_href || "/products"
  const primaryLabel = promo?.cta_label || "Shop new fits"

  return (
    <section className="relative">
      <div className="relative h-[92vh] min-h-150 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={promo?.title ?? `Model wearing the ${APP_NAME} collection`}
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
            <div className="max-w-2xl text-white">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                  {eyebrow}
                </p>
                {promo?.ends_at ? (
                  <PromoCountdown endsAt={promo.ends_at} variant="chip" />
                ) : null}
              </div>
              <h1 className="mt-5 text-balance font-serif text-5xl leading-[1.02] md:text-7xl lg:text-8xl">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-pretty leading-relaxed text-white/85">
                {subtitle}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="inline-flex items-center gap-2 rounded-sm bg-white px-8 py-4 text-sm font-medium uppercase tracking-widest text-neutral-900 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#shop-categories"
                  className="inline-flex items-center gap-2 rounded-sm border border-white/60 px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-neutral-900"
                >
                  Explore categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
