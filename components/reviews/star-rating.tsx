"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/** Read-only star display. */
export function StarRating({
  rating,
  className,
  size = "size-4",
}: {
  rating: number
  className?: string
  size?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden
          className={cn(
            size,
            value <= Math.round(rating)
              ? "fill-accent text-accent"
              : "text-border",
          )}
        />
      ))}
    </span>
  )
}

/** Interactive star picker for the review form. */
export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          className="rounded-sm p-0.5 transition-transform hover:scale-110"
        >
          <Star
            aria-hidden
            className={cn(
              "size-6",
              star <= value ? "fill-accent text-accent" : "text-border",
            )}
          />
        </button>
      ))}
    </div>
  )
}
