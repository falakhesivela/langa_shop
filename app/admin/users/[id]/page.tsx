"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getAdminCustomer,
  updateAdminUser,
  type AdminCustomerDetail,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { useAuth } from "@/lib/auth/context";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { useToast } from "@/components/ui/Toast";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isValidId = Number.isFinite(userId);

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    let cancelled = false;
    getAdminCustomer(userId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load customer."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleToggle(field: "is_admin" | "is_active") {
    if (!detail) return;
    setIsSaving(true);
    try {
      const updated = await updateAdminUser(detail.user.id, {
        [field]: !detail.user[field],
      });
      setDetail({ ...detail, user: updated });
      toast(
        field === "is_admin"
          ? `${updated.email} is ${updated.is_admin ? "now an admin" : "no longer an admin"}.`
          : `${updated.email} is ${updated.is_active ? "active" : "disabled"}.`,
      );
    } catch (err) {
      toast(getErrorMessage(err, "Unable to update customer."), "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading && isValidId) {
    return <p className="text-muted-foreground">Loading customer...</p>;
  }

  if (!detail) {
    return (
      <div>
        <Alert>
          {!isValidId ? "Invalid customer id." : (error ?? "Customer not found.")}
        </Alert>
        <div className="mt-6">
          <Button href="/admin/users">Back to customers</Button>
        </div>
      </div>
    );
  }

  const { user, orders } = detail;
  const isSelf = user.id === currentUser?.id;

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to customers
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl">{user.full_name ?? user.email}</h1>
        {!user.is_active ? (
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Disabled
          </span>
        ) : null}
        {user.is_admin ? (
          <span className="rounded-full border border-blue-600/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-muted-foreground">
        {user.email} · joined {new Date(user.created_at).toLocaleDateString()}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="mt-2 font-serif text-3xl">{detail.order_count}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total spent</p>
          <p className="mt-2 font-serif text-3xl">
            {formatPrice(detail.total_spent_cents / 100)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Paid orders only</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Account</p>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={user.is_admin}
                disabled={isSelf || isSaving}
                onChange={() => void handleToggle("is_admin")}
              />
              Admin access
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={user.is_active}
                disabled={isSelf || isSaving}
                onChange={() => void handleToggle("is_active")}
              />
              Active
            </label>
            {isSelf ? (
              <p className="text-xs text-muted-foreground">
                You can&apos;t change your own account here.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-sm border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-serif text-2xl">Order history</h2>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">
            This customer hasn&apos;t placed any orders yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium">#{order.id}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                      {order.discount_code ? ` · code ${order.discount_code}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm">
                      {formatPrice(order.total_cents / 100)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
