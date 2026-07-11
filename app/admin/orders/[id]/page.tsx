"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  createAdminShipment,
  getAdminOrder,
  resendOrderConfirmation,
  updateAdminOrderStatus,
} from "@/lib/api/admin";
import { APP_NAME } from "@/lib/config";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { useToast } from "@/components/ui/Toast";

// Mirrors the backend's allowed status transitions.
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  refunded: [],
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
  const { toast } = useToast();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
      toast("Shipment created.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create shipment."));
    } finally {
      setIsShipping(false);
    }
  }

  async function handleResendConfirmation() {
    if (!order) return;
    setIsResending(true);
    try {
      const { sent } = await resendOrderConfirmation(order.id);
      if (sent) {
        toast(`Confirmation email sent to ${order.user_email}.`);
      } else {
        toast("The email could not be sent. Check the server logs.", "error");
      }
    } catch (err) {
      toast(getErrorMessage(err, "Unable to resend confirmation."), "error");
    } finally {
      setIsResending(false);
    }
  }

  async function handleSaveStatus() {
    if (!order) return;

    setIsSaving(true);
    try {
      const updated = await updateAdminOrderStatus(order.id, selectedStatus);
      setOrder(updated);
      setError(null);
      toast(`Order marked as ${updated.status}.`);
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
      <div className="print:hidden">
      <Link
        href="/admin/orders"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            Print packing slip
          </Button>
          {order.status !== "pending" &&
          order.status !== "cancelled" &&
          order.status !== "refunded" ? (
            <Button
              variant="secondary"
              onClick={() => void handleResendConfirmation()}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend confirmation"}
            </Button>
          ) : null}
        </div>
      </div>
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
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                {formatPrice(
                  (order.total_cents -
                    order.shipping_cents +
                    (order.discount_cents ?? 0)) /
                    100,
                )}
              </dd>
            </div>
            {order.discount_cents > 0 ? (
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
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{formatPrice(order.total_cents / 100)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{order.currency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <OrderStatusBadge status={order.status} />
              </dd>
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

      {/* Packing slip — only visible when printing */}
      <section className="hidden print:block">
        <div className="flex items-start justify-between border-b border-black pb-4">
          <div>
            <p className="font-serif text-2xl tracking-[0.2em]">
              {APP_NAME.toUpperCase()}
            </p>
            <p className="mt-1 text-sm">Packing slip</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">Order #{order.id}</p>
            <p>{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium uppercase tracking-wide">Ship to</p>
            {order.shipping_address &&
            Object.keys(order.shipping_address).length > 0 ? (
              <div className="mt-2 space-y-1">
                {Object.entries(order.shipping_address).map(([key, value]) => (
                  <p key={key}>
                    <span className="text-neutral-600">{humanizeKey(key)}: </span>
                    {formatAddressValue(value)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-2">No address on file</p>
            )}
            <p className="mt-2">{order.user_email}</p>
          </div>
          <div>
            <p className="font-medium uppercase tracking-wide">Delivery</p>
            <p className="mt-2">{order.shipping_service_name ?? "—"}</p>
            {order.tracking_reference ? (
              <p>Tracking: {order.tracking_reference}</p>
            ) : null}
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Size</th>
              <th className="py-2 font-medium">Color</th>
              <th className="py-2 text-right font-medium">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-300">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2">{item.size}</td>
                <td className="py-2">{item.color ?? "—"}</td>
                <td className="py-2 text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-8 text-sm">Thank you for shopping with {APP_NAME}.</p>
      </section>
    </div>
  );
}
