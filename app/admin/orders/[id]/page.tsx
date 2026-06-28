"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAdminOrder, updateAdminOrderStatus } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const statusOptions: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!Number.isFinite(orderId)) {
        setError("Invalid order id.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAdminOrder(orderId);
        setOrder(data);
        setSelectedStatus(data.status);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load order."));
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [orderId]);

  async function handleSaveStatus() {
    if (!order) return;

    setIsSaving(true);
    try {
      const updated = await updateAdminOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update order status."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading order...</p>;
  }

  if (!order) {
    return (
      <div>
        <Alert>{error ?? "Order not found."}</Alert>
        <div className="mt-6">
          <Button href="/admin/orders">Back to orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to orders
      </Link>

      <h1 className="mt-6 font-serif text-4xl">Order #{order.id}</h1>
      <p className="mt-2 text-muted-foreground">
        {order.user_email} · {new Date(order.created_at).toLocaleString()}
      </p>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-sm border border-border p-6">
          <h2 className="font-serif text-2xl">Items</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-muted-foreground">
                    Size {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p>{formatPrice((item.unit_price_cents * item.quantity) / 100)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-sm border border-border p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd>{formatPrice(order.total_cents / 100)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{order.currency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{order.status}</dd>
            </div>
            {order.paystack_reference ? (
              <div>
                <dt className="text-muted-foreground">Paystack reference</dt>
                <dd className="mt-1 break-all">{order.paystack_reference}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6">
            <label
              htmlFor="order-status"
              className="text-sm uppercase tracking-wide text-muted-foreground"
            >
              Update status
            </label>
            <select
              id="order-status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as OrderStatus)
              }
              className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <Button
              className="mt-4 w-full"
              onClick={() => void handleSaveStatus()}
              disabled={isSaving || selectedStatus === order.status}
            >
              {isSaving ? "Saving..." : "Save status"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
