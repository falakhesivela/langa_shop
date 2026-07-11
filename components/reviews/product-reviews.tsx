"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { createReview, listProductReviews } from "@/lib/api/reviews"
import { getErrorMessage } from "@/lib/api/errors"
import { useAuth } from "@/lib/auth/context"
import type { Review, ReviewList } from "@/lib/types/review"
import { StarRating, StarRatingInput } from "@/components/reviews/star-rating"
import { Alert } from "@/components/ui/Alert"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useToast } from "@/components/ui/Toast"

const PAGE_SIZE = 10

function ReviewForm({ productId }: { productId: number }) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (rating === 0) {
      setError("Pick a star rating first.")
      return
    }
    setIsSubmitting(true)
    try {
      await createReview(productId, {
        rating,
        title: title.trim() || null,
        body: body.trim(),
      })
      setIsSubmitted(true)
      toast("Thanks! Your review will appear once it's approved.")
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit your review."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Alert variant="info">
        Thanks for your review — it&apos;ll appear here once approved.
      </Alert>
    )
  }

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Write a review
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-sm border border-border p-5"
    >
      {error ? <Alert>{error}</Alert> : null}
      <div className="space-y-2">
        <Label>Your rating</Label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sums it up"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-body">Your review</Label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          minLength={10}
          maxLength={4000}
          required
          placeholder="How's the fit, the fabric, the everything?"
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Submit review
        </Button>
        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Reviews are limited to verified purchasers and appear after moderation.
      </p>
    </form>
  )
}

export function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: number
  initialReviews: ReviewList
}) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<Review[]>(initialReviews.items)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const total = initialReviews.total
  const average = initialReviews.average_rating

  async function loadMore() {
    setIsLoadingMore(true)
    try {
      const page = await listProductReviews(productId, PAGE_SIZE, items.length)
      setItems((prev) => [...prev, ...page.items])
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section className="mt-24" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">Reviews</h2>
          {total > 0 && average != null ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <StarRating rating={average} />
              {average.toFixed(1)} · {total} review{total === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        {isAuthenticated ? (
          <ReviewForm productId={productId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>{" "}
            to review a purchase.
          </p>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No reviews yet — be the first to share how it wears.
        </p>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-border border-t border-border">
            {items.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex flex-wrap items-center gap-3">
                  <StarRating rating={review.rating} />
                  {review.title ? (
                    <p className="font-medium">{review.title}</p>
                  ) : null}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                  {review.body}
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {review.reviewer_name} ·{" "}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
          {items.length < total ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="mt-6 text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50"
            >
              {isLoadingMore ? "Loading…" : "Show more reviews"}
            </button>
          ) : null}
        </>
      )}
    </section>
  )
}
