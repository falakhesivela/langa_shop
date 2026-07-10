"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  createAdminShipment,
  getAdminOrder,
  updateAdminOrderStatus,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

// Mirrors the backend's allowed status transitions.
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const addressFieldLabels: Record<string, string> = {
  full_name: "Name",
  name: "Name",
  phone: "Phone",
  email: "Email",
  line1: "Address",
  line2: "Address 2",
  address: "Address",
  street: "Street",
  city: "City",
  state: "Province",
  province: "Province",
  postal_code: "Postal code",
  zip: "Postal code",
  country: "Country",
};

function humanizeKey(key: string): string {
  return (
    addressFieldLabels[key] ??
    key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatAddressValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShipping, setIsShipping] = useState(false);

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

  async function handleCreateShipment() {
    if (!order) return;
    setIsShipping(true);
    setError(null);
    try {
      const updated = await createAdminShipment(order.id);
      setOrder(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create shipment."));
    } finally {
      setIsShipping(false);
    }
  }

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
        <div className="space-y-6">
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
                    Size {item.size}
                    {item.color ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="inline-flex items-center gap-1.5 align-middle">
                          <ColorSwatch color={item.color} size="sm" />
                          {item.color}
                        </span>
                      </>
                    ) : null}{" "}
                    · Qty {item.quantity}
                  </p>
                </div>
                <p>{formatPrice((item.unit_price_cents * item.quantity) / 100)}</p>
              </li>
            ))}
          </ul>
          </section>

          <section className="rounded-sm border border-border p-6">
            <h2 className="font-serif text-2xl">Shipping address</h2>
            {order.shipping_address &&
            Object.keys(order.shipping_address).length > 0 ? (
              <dl className="mt-4 space-y-3 text-sm">
                {Object.entries(order.shipping_address).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{humanizeKey(key)}</dt>
                    <dd className="text-right">{formatAddressValue(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No shipping address was captured for this order.
              </p>
            )}
          </section>
        </div>

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
            {allowedTransitions[order.status].length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                This order is {order.status} and can no longer change status.
              </p>
            ) : (
              <>
                <select
                  id="order-status"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as OrderStatus)
                  }
                  className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                >
                  {[order.status, ...allowedTransitions[order.status]].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === order.status ? " (current)" : ""}
                      </option>
                    ),
                  )}
                </select>
                <Button
                  className="mt-4 w-full"
                  onClick={() => void handleSaveStatus()}
                  disabled={isSaving || selectedStatus === order.status}
                >
                  {isSaving ? "Saving..." : "Save status"}
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm uppercase tracking-wide text-muted-foreground">
              Shipping
            </h3>
            {order.shipping_service_name ? (
              <p className="mt-2 text-sm">{order.shipping_service_name}</p>
            ) : null}

            {order.tracking_reference ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Tracking</dt>
                  <dd className="text-right break-all">
                    {order.tracking_url ? (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4"
                      >
                        {order.tracking_reference}
                      </a>
                    ) : (
                      order.tracking_reference
                    )}
                  </dd>
                </div>
                {order.shipment_status ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Shipment</dt>
                    <dd className="capitalize">
                      {order.shipment_status.replace(/[-_]/g, " ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : order.shipping_service_code ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  No shipment created yet.
                </p>
                <Button
                  className="mt-3 w-full"
                  variant="secondary"
                  onClick={() => void handleCreateShipment()}
                  disabled={isShipping}
                >
                  {isShipping ? "Creating shipment..." : "Create Bob Go shipment"}
                </Button>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No shipping method was selected for this order.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
