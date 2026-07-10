import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "Ordered three outfits on a whim and they all slapped. Shipping was quick and the prices are unreal.",
    name: "Naledi M.",
    location: "Johannesburg",
  },
  {
    quote:
      "Cute, bold, and actually fits. NewFit is my go-to when I need a new look for the weekend.",
    name: "Thandi K.",
    location: "Cape Town",
  },
  {
    quote:
      "The drops are addictive. I keep refreshing for new fits — my cart never stands a chance.",
    name: "Sarah V.",
    location: "Durban",
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Word of mouth</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Loved by our customers</h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-sm border border-border bg-card p-7"
          >
            <div className="flex gap-1" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="mt-5 flex-1 font-serif text-lg leading-relaxed">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t.name}</span> — {t.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
