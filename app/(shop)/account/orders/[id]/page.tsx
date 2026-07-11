"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getOrder } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import { ReorderButton } from "@/components/account/reorder-button";
import type { Order } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

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
  const orderId = Number(params.id);
  const isValidId = Number.isFinite(orderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(orderId)) return;
    let cancelled = false;
    getOrder(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
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
