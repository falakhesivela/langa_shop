"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAdminOrders } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";

const statusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrders(filter?: OrderStatus) {
    setIsLoading(true);
    try {
      setOrders(await listAdminOrders(filter));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load orders."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders(statusFilter);
  }, [statusFilter]);

  return (
    <div>
      <div>
        <h1 className="font-serif text-4xl">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Review customer orders and update fulfillment status.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const isActive = filter.value === statusFilter;
          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Total</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border">
                  <td className="px-3 py-4 font-medium">#{order.id}</td>
                  <td className="px-3 py-4">
                    <div>{order.user_email}</div>
                    <div className="text-muted-foreground">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    {formatPrice(order.total_cents / 100)}
                  </td>
                  <td className="px-3 py-4 capitalize">{order.status}</td>
                  <td className="px-3 py-4">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
