"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAdminReturns, updateAdminReturn } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import type { AdminReturnRequest, ReturnStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 25;

type StatusFilter = ReturnStatus | "all";

type Loaded = {
  key: string;
  items: AdminReturnRequest[];
  total: number;
};

const statusStyles: Record<ReturnStatus, string> = {
  requested: "border-amber-600/30 bg-amber-500/10 text-amber-700",
  approved: "border-blue-600/30 bg-blue-500/10 text-blue-700",
  declined: "border-border bg-muted text-muted-foreground",
  completed: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700",
};

// The actions available from each status (mirrors the server's transitions).
const nextActions: Record<ReturnStatus, Array<{ label: string; status: ReturnStatus }>> = {
  requested: [
    { label: "Approve", status: "approved" },
    { label: "Decline", status: "declined" },
  ],
  approved: [
    { label: "Mark completed", status: "completed" },
    { label: "Decline", status: "declined" },
  ],
  declined: [],
  completed: [],
};

export default function AdminReturnsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("requested");
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
    listAdminReturns(
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
        if (!cancelled)
          setError(getErrorMessage(err, "Unable to load return requests."));
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const isLoading = !error && loaded?.key !== queryKey;
  const returns = loaded?.key === queryKey ? loaded.items : [];
  const total = loaded?.key === queryKey ? loaded.total : 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleAction(
    request: AdminReturnRequest,
    status: ReturnStatus,
  ) {
    let note: string | undefined;
    if (status === "approved") {
      note =
        window.prompt(
          "Optional note to the customer (e.g. return instructions):",
          request.admin_note ?? "",
        ) ?? undefined;
    } else if (status === "declined") {
      const reason = window.prompt(
        "Why is this return declined? (shown to the customer)",
        request.admin_note ?? "",
      );
      if (reason === null) return;
      note = reason;
    }
    setBusyId(request.id);
    try {
      await updateAdminReturn(request.id, {
        status,
        ...(note !== undefined && note.trim() ? { admin_note: note.trim() } : {}),
      });
      toast(`Return for order #${request.order_id} ${status}.`);
      setReloadTick((t) => t + 1);
    } catch (err) {
      toast(getErrorMessage(err, "Unable to update the return."), "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div>
        <h1 className="font-serif text-4xl">Returns</h1>
        <p className="mt-2 text-muted-foreground">
          Review customer return requests. Refunds for completed returns are
          settled manually in Paystack.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["requested", "Requested"],
            ["approved", "Approved"],
            ["completed", "Completed"],
            ["declined", "Declined"],
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
          <p className="text-muted-foreground">Loading return requests...</p>
        ) : returns.length === 0 ? (
          <p className="text-muted-foreground">
            {statusFilter === "requested"
              ? "No return requests waiting for review."
              : "No return requests found."}
          </p>
        ) : (
          returns.map((request) => (
            <article
              key={request.id}
              className="rounded-sm border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/orders/${request.order_id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      Order #{request.order_id}
                    </Link>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[request.status]}`}
                    >
                      {request.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(request.order_total_cents / 100)}
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                    {request.reason}
                  </p>
                  {request.admin_note ? (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      Note: {request.admin_note}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {request.user_email} ·{" "}
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {nextActions[request.status].map((action) => (
                    <Button
                      key={action.status}
                      variant="secondary"
                      onClick={() => void handleAction(request, action.status)}
                      disabled={busyId === request.id}
                    >
                      {action.label}
                    </Button>
                  ))}
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
