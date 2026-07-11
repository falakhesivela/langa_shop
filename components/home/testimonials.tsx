import Link from "next/link"
import { Star } from "lucide-react"
import { listFeaturedReviews } from "@/lib/api/reviews"
import type { Review } from "@/lib/types/review"

/**
 * Real customer reviews (top-rated, approved). Renders nothing until the
 * store has at least one approved review — no fabricated quotes.
 */
export async function Testimonials() {
  let reviews: Review[] = []
  try {
    reviews = await listFeaturedReviews(3)
  } catch {
    return null
  }
  if (reviews.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Word of mouth</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Loved by our customers</h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="flex flex-col rounded-sm border border-border bg-card p-7"
          >
            <div
              className="flex gap-1"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < review.rating
                      ? "fill-accent text-accent"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            <blockquote className="mt-5 flex-1 font-serif text-lg leading-relaxed">
              “{review.body.length > 160 ? `${review.body.slice(0, 157)}…` : review.body}”
            </blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {review.reviewer_name}
              </span>{" "}
              — verified buyer
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        <Link
          href="/products"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Shop the pieces they&apos;re talking about
        </Link>
      </p>
    </section>
  )
}
