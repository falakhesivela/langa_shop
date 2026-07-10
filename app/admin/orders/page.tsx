"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listAdminOrders } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { OrderStatusBadge } from "@/components/admin/status-badge";

const PAGE_SIZE = 25;

const statusFilters: Array<{ label: string; value?: OrderStatus }> = [
  { label: "All" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

type OrdersQuery = {
  status?: OrderStatus;
  q: string;
  dateFrom: string;
  dateTo: string;
  page: number;
};

type LoadedOrders = {
  key: string;
  items: AdminOrder[];
  total: number;
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [loaded, setLoaded] = useState<LoadedOrders | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(handle);
  }, [search]);

  const queryKey = JSON.stringify({
    status: statusFilter,
    q: debouncedSearch.trim(),
    dateFrom,
    dateTo,
    page,
  } satisfies OrdersQuery);

  useEffect(() => {
    const query = JSON.parse(queryKey) as OrdersQuery;
    let cancelled = false;
    listAdminOrders({
      status: query.status,
      q: query.q || undefined,
      dateFrom: query.dateFrom ? `${query.dateFrom}T00:00:00` : undefined,
      dateTo: query.dateTo ? `${query.dateTo}T23:59:59` : undefined,
      limit: PAGE_SIZE,
      offset: query.page * PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        setLoaded({ key: queryKey, items: data.items, total: data.total });
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Unable to load orders."));
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const isLoading = !error && loaded?.key !== queryKey;
  const orders = loaded?.items ?? [];
  const total = loaded?.total ?? 0;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, (page + 1) * PAGE_SIZE);

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
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(0);
              }}
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-sm">
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by order #, email, or reference…"
            aria-label="Search orders"
          />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label
              htmlFor="orders-date-from"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              From
            </label>
            <Input
              id="orders-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="orders-date-to"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              To
            </label>
            <Input
              id="orders-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="mt-1"
            />
          </div>
          {dateFrom || dateTo ? (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(0);
              }}
              className="h-11 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-6 overflow-x-auto">
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
                  No orders match your filters.
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
                  <td className="px-3 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {total === 0
            ? "No orders"
            : `Showing ${rangeStart}–${rangeEnd} of ${total} order${total === 1 ? "" : "s"}`}
        </p>
        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
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
    </div>
  );
}
