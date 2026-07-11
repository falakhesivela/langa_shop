"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { listOrders } from "@/lib/api/orders";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import type { Order } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";

function statusLabel(status: Order["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function AccountOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setOrders(await listOrders());
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load orders."));
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-16">
      <Link
        href="/account"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to account
      </Link>

      <h1 className="mt-6 font-serif text-4xl md:text-5xl">Orders</h1>
      <p className="mt-3 text-muted-foreground">
        View your order history and payment status.
      </p>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-10 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">You have not placed any orders yet.</p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-sm border border-border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      Order #{order.id}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.total_cents / 100)}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {statusLabel(order.status)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border border-t border-border text-sm">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between gap-4 py-3"
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.product_name} · {item.size}
                      {item.color ? (
                        <ColorSwatch color={item.color} size="sm" />
                      ) : null}{" "}
                      × {item.quantity}
                    </span>
                    <span>
                      {formatPrice((item.unit_price_cents * item.quantity) / 100)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                {order.tracking_reference ? (
                  <span className="text-muted-foreground">
                    {order.shipping_service_name ?? "Shipment"}
                    {order.shipment_status
                      ? ` · ${order.shipment_status.replace(/[-_]/g, " ")}`
                      : ""}
                    {" · "}
                    {order.tracking_url ? (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Track {order.tracking_reference}
                      </a>
                    ) : (
                      <span className="font-medium text-foreground">
                        {order.tracking_reference}
                      </span>
                    )}
                  </span>
                ) : (
                  <span />
                )}
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  View details
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

export default function AccountOrdersPage() {
  return (
    <AuthGuard>
      <AccountOrdersContent />
    </AuthGuard>
  );
}
