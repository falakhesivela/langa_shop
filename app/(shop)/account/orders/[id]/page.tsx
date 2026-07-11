"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  cancelOrder,
  createReturnRequest,
  getOrder,
  getReturnRequest,
} from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import { ReorderButton } from "@/components/account/reorder-button";
import type { Order, ReturnRequest } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

const TIMELINE: Array<{ status: Order["status"]; label: string }> = [
  { status: "pending", label: "Placed" },
  { status: "paid", label: "Paid" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

function StatusTimeline({ status }: { status: Order["status"] }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        This order was cancelled.
      </p>
    );
  }
  if (status === "refunded") {
    return (
      <p className="rounded-sm border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        This order sold out before your payment was confirmed, and the full
        amount was refunded to you.
      </p>
    );
  }
  const currentIndex = TIMELINE.findIndex((step) => step.status === status);
  return (
    <ol className="flex items-center">
      {TIMELINE.map((step, index) => {
        const reached = index <= currentIndex;
        return (
          <li key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex size-7 items-center justify-center rounded-full border text-xs ${
                  reached
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground"
                }`}
              >
                {reached ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              <span
                className={`text-xs ${reached ? "" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
            {index < TIMELINE.length - 1 ? (
              <div
                className={`mx-2 mb-5 h-px flex-1 ${
                  index < currentIndex ? "bg-foreground" : "bg-border"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

const returnStatusCopy: Record<ReturnRequest["status"], string> = {
  requested: "Return requested — we're reviewing it and will email you.",
  approved:
    "Return approved — check your email for the return instructions.",
  declined: "This return request was declined.",
  completed: "Return completed.",
};

function ReturnSection({
  order,
  returnRequest,
  onCreated,
}: {
  order: Order;
  returnRequest: ReturnRequest | null;
  onCreated: (request: ReturnRequest) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (order.status !== "delivered" && !returnRequest) return null;

  if (returnRequest) {
    return (
      <section className="mt-6 rounded-sm border border-border p-5 text-sm">
        <p className="font-medium">{returnStatusCopy[returnRequest.status]}</p>
        <p className="mt-2 text-muted-foreground">
          Your reason: {returnRequest.reason}
        </p>
        {returnRequest.admin_note ? (
          <p className="mt-2 text-muted-foreground">
            Our note: {returnRequest.admin_note}
          </p>
        ) : null}
      </section>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      onCreated(await createReturnRequest(order.id, reason.trim()));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit the return request."));
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-sm border border-border p-5">
      {isOpen ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error ? <Alert>{error}</Alert> : null}
          <div className="space-y-2">
            <Label htmlFor="return-reason">
              What would you like to return, and why?
            </Label>
            <textarea
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              minLength={10}
              required
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              placeholder="e.g. The linen shirt (M) is too big — I'd like to return it for a refund."
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} disabled={reason.trim().length < 10}>
              Submit request
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Something not right? You can return unworn items within 30 days of
            delivery.
          </p>
          <Button variant="secondary" onClick={() => setIsOpen(true)}>
            Request a return
          </Button>
        </div>
      )}
    </section>
  );
}

const addressLabels: Record<string, string> = {
  full_name: "Name",
  phone: "Phone",
  address1: "Address",
  address2: "Address 2",
  suburb: "Suburb",
  city: "City",
  province: "Province",
  postal_code: "Postal code",
  country: "Country",
};

function AccountOrderDetailContent() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const orderId = Number(params.id);
  const isValidId = Number.isFinite(orderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(orderId)) return;
    let cancelled = false;
    getOrder(orderId)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        if (data.status === "delivered") {
          // A return can only exist for a delivered order.
          getReturnRequest(orderId)
            .then((request) => {
              if (!cancelled) setReturnRequest(request);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load order."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function handleCancelOrder() {
    if (
      !window.confirm(
        "Cancel this order? This can't be undone — you can always place a new order later.",
      )
    ) {
      return;
    }
    setCancelError(null);
    setIsCancelling(true);
    try {
      setOrder(await cancelOrder(orderId));
      toast("Order cancelled.");
    } catch (err) {
      setCancelError(getErrorMessage(err, "Unable to cancel this order."));
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading && isValidId) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <p className="text-muted-foreground">Loading order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
        <Alert>{!isValidId ? "Invalid order." : (error ?? "Order not found.")}</Alert>
        <div className="mt-6">
          <Button href="/account/orders">Back to orders</Button>
        </div>
      </main>
    );
  }

  const subtotalCents =
    order.total_cents - order.shipping_cents + (order.discount_cents ?? 0);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
      <Link
        href="/account/orders"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Order #{order.id}</h1>
          <p className="mt-2 text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <ReorderButton items={order.items} />
      </div>

      <div className="mt-8">
        <StatusTimeline status={order.status} />
      </div>

      {order.status === "pending" ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border p-4 text-sm">
          <span className="text-muted-foreground">
            This order is still awaiting payment — you can cancel it if
            you&apos;ve changed your mind.
          </span>
          <Button
            variant="secondary"
            onClick={() => void handleCancelOrder()}
            isLoading={isCancelling}
          >
            Cancel order
          </Button>
        </div>
      ) : null}
      {cancelError ? <Alert className="mt-4">{cancelError}</Alert> : null}

      <ReturnSection
        order={order}
        returnRequest={returnRequest}
        onCreated={setReturnRequest}
      />

      {order.tracking_reference ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-4 text-sm">
          <span className="text-muted-foreground">
            {order.shipping_service_name ?? "Shipment"}
            {order.shipment_status
              ? ` · ${order.shipment_status.replace(/[-_]/g, " ")}`
              : ""}
          </span>
          {order.tracking_url ? (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Track {order.tracking_reference}
            </a>
          ) : (
            <span className="font-medium">{order.tracking_reference}</span>
          )}
        </div>
      ) : null}

      <section className="mt-8 rounded-sm border border-border">
        <h2 className="border-b border-border px-5 py-4 font-serif text-2xl">
          Items
        </h2>
        <ul className="divide-y divide-border px-5 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-4">
              <span className="inline-flex items-center gap-2">
                {item.product_name} · {item.size}
                {item.color ? <ColorSwatch color={item.color} size="sm" /> : null}{" "}
                × {item.quantity}
              </span>
              <span>
                {formatPrice((item.unit_price_cents * item.quantity) / 100)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotalCents / 100)}</dd>
          </div>
          {(order.discount_cents ?? 0) > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">
                Discount{order.discount_code ? ` (${order.discount_code})` : ""}
              </dt>
              <dd>−{formatPrice(order.discount_cents / 100)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{formatPrice(order.shipping_cents / 100)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-border pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total_cents / 100)}</dd>
          </div>
        </dl>
      </section>

      {order.shipping_address &&
      Object.keys(order.shipping_address).length > 0 ? (
        <section className="mt-6 rounded-sm border border-border">
          <h2 className="border-b border-border px-5 py-4 font-serif text-2xl">
            Delivery address
          </h2>
          <dl className="space-y-2 px-5 py-4 text-sm">
            {Object.entries(order.shipping_address)
              .filter(([, value]) => value !== null && value !== "")
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {addressLabels[key] ??
                      key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </dt>
                  <dd className="text-right">{String(value)}</dd>
                </div>
              ))}
          </dl>
        </section>
      ) : null}
    </main>
  );
}

export default function AccountOrderDetailPage() {
  return (
    <AuthGuard>
      <AccountOrderDetailContent />
    </AuthGuard>
  );
}
