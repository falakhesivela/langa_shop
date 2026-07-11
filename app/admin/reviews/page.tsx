"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  approveAdminReview,
  deleteAdminReview,
  listAdminReviews,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminReview } from "@/lib/types/review";
import { StarRating } from "@/components/reviews/star-rating";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 25;

type StatusFilter = "pending" | "approved" | "all";

type Loaded = {
  key: string;
  items: AdminReview[];
  total: number;
};

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const queryKey = JSON.stringify({ statusFilter, page, reloadTick });

  useEffect(() => {
    const query = JSON.parse(queryKey) as {
      statusFilter: StatusFilter;
      page: number;
    };
    let cancelled = false;
    listAdminReviews(
      query.statusFilter === "all" ? undefined : query.statusFilter,
      PAGE_SIZE,
      query.page * PAGE_SIZE,
    )
      .then((data) => {
        if (cancelled) return;
        setLoaded({ key: queryKey, items: data.items, total: data.total });
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load reviews."));
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const isLoading = !error && loaded?.key !== queryKey;
  const reviews = loaded?.key === queryKey ? loaded.items : [];
  const total = loaded?.key === queryKey ? loaded.total : 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleApprove(review: AdminReview) {
    setBusyId(review.id);
    try {
      await approveAdminReview(review.id);
      toast(`Review by ${review.reviewer_name} approved.`);
      setReloadTick((t) => t + 1);
    } catch (err) {
      toast(getErrorMessage(err, "Unable to approve review."), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(review: AdminReview) {
    if (!window.confirm("Delete this review permanently?")) return;
    setBusyId(review.id);
    try {
      await deleteAdminReview(review.id);
      toast("Review deleted.");
      setReloadTick((t) => t + 1);
    } catch (err) {
      toast(getErrorMessage(err, "Unable to delete review."), "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div>
        <h1 className="font-serif text-4xl">Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Approve customer reviews before they appear on the storefront.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setStatusFilter(value);
              setPage(0);
            }}
            className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
              statusFilter === value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">
            {statusFilter === "pending"
              ? "No reviews waiting for approval."
              : "No reviews found."}
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-sm border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating rating={review.rating} />
                    {review.title ? (
                      <p className="font-medium">{review.title}</p>
                    ) : null}
                    {!review.is_approved ? (
                      <span className="rounded-full border border-amber-600/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                    {review.body}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {review.reviewer_name} ({review.user_email}) on{" "}
                    <Link
                      href={`/products/${review.product_slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {review.product_name}
                    </Link>{" "}
                    · {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!review.is_approved ? (
                    <Button
                      variant="secondary"
                      onClick={() => void handleApprove(review)}
                      disabled={busyId === review.id}
                    >
                      Approve
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    onClick={() => void handleDelete(review)}
                    disabled={busyId === review.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {pageCount > 1 ? (
        <div className="mt-6 flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="rounded-sm border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1 || isLoading}
            className="rounded-sm border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
