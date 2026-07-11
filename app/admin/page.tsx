"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { getAdminStats } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { resolveMediaUrl } from "@/lib/media";
import type { AdminStats } from "@/lib/types/admin";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 font-serif text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-sm border border-border bg-card p-5 transition-colors hover:bg-muted"
      >
        {content}
      </Link>
    );
  }
  return <div className="rounded-sm border border-border bg-card p-5">{content}</div>;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-sm border border-border bg-card p-5">
      <div className="h-4 w-24 rounded-sm bg-muted" />
      <div className="mt-4 h-8 w-32 rounded-sm bg-muted" />
      <div className="mt-2 h-4 w-20 rounded-sm bg-muted" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => setError(getErrorMessage(err, "Unable to load dashboard.")));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            What&apos;s happening in your store right now.
          </p>
        </div>
        <Button href="/admin/products/new">Add product</Button>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats ? (
          <>
            <StatCard
              label="Revenue today"
              value={formatPrice(
                stats.revenue.today_cents / 100,
                stats.revenue.currency,
              )}
              hint={`${formatPrice(stats.revenue.last_7_days_cents / 100, stats.revenue.currency)} last 7 days`}
              icon={TrendingUp}
            />
            <StatCard
              label="Revenue (30 days)"
              value={formatPrice(
                stats.revenue.last_30_days_cents / 100,
                stats.revenue.currency,
              )}
              hint={`${formatPrice(stats.revenue.all_time_cents / 100, stats.revenue.currency)} all time`}
              icon={TrendingUp}
            />
            <StatCard
              label="Orders to fulfil"
              value={String(stats.orders.paid)}
              hint={`${stats.orders.pending} awaiting payment · ${stats.orders.shipped} shipped`}
              icon={ShoppingBag}
              href="/admin/orders"
            />
            <StatCard
              label="Customers"
              value={String(stats.customers.total)}
              hint={`+${stats.customers.new_last_30_days} in the last 30 days`}
              icon={Users}
              href="/admin/users"
            />
          </>
        ) : !error ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : null}
      </div>

      {stats &&
      (stats.catalog.out_of_stock > 0 ||
        stats.catalog.low_stock > 0 ||
        stats.orders.paid > 0) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.orders.paid > 0 ? (
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-sm border border-blue-600/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-700 transition-opacity hover:opacity-80"
            >
              <ShoppingBag className="size-3.5" aria-hidden />
              {stats.orders.paid} paid order{stats.orders.paid === 1 ? "" : "s"} ready
              to ship
            </Link>
          ) : null}
          {stats.catalog.out_of_stock > 0 ? (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-sm border border-red-600/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-700 transition-opacity hover:opacity-80"
            >
              <AlertTriangle className="size-3.5" aria-hidden />
              {stats.catalog.out_of_stock} product
              {stats.catalog.out_of_stock === 1 ? "" : "s"} out of stock
            </Link>
          ) : null}
          {stats.catalog.low_stock > 0 ? (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-sm border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-700 transition-opacity hover:opacity-80"
            >
              <AlertTriangle className="size-3.5" aria-hidden />
              {stats.catalog.low_stock} product
              {stats.catalog.low_stock === 1 ? "" : "s"} low on stock
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 className="font-serif text-2xl">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View all
            </Link>
          </div>
          {stats ? (
            stats.recent_orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">
                No orders yet. They&apos;ll show up here as soon as customers start
                buying.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recent_orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          #{order.id}{" "}
                          <span className="font-normal text-muted-foreground">
                            · {order.user_email}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.item_count} item{order.item_count === 1 ? "" : "s"} ·{" "}
                          {new Date(order.created_at).toLocaleDateString()}
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
            )
          ) : (
            <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-sm border border-border bg-card">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <h2 className="font-serif text-2xl">Low stock</h2>
              <Link
                href="/admin/products"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                All products
              </Link>
            </div>
            {stats ? (
              stats.low_stock_products.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                  All products are well stocked.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.low_stock_products.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-sm bg-muted">
                          <Image
                            src={resolveMediaUrl(product.image_url ?? undefined)}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm">
                          {product.name}
                        </p>
                        <span
                          className={`shrink-0 text-sm ${
                            product.stock === 0
                              ? "text-red-600"
                              : "text-amber-700"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} left`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
            )}
          </section>

          <section className="rounded-sm border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-serif text-2xl">Top products</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                By revenue, last 30 days
              </p>
            </div>
            {stats ? (
              stats.top_products.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                  No paid orders in the last 30 days yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.top_products.map((product, index) => (
                    <li
                      key={`${product.product_id ?? "deleted"}-${product.name}`}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="w-5 shrink-0 text-sm text-muted-foreground">
                        {index + 1}.
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm">{product.name}</p>
                      <div className="shrink-0 text-right">
                        <p className="text-sm">
                          {formatPrice(product.revenue_cents / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.units_sold} sold
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
            )}
          </section>

          <section className="rounded-sm border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Catalog</h2>
              <Package className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Active products</dt>
                <dd className="mt-1 font-serif text-2xl">
                  {stats ? stats.catalog.active_products : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Hidden</dt>
                <dd className="mt-1 font-serif text-2xl">
                  {stats ? stats.catalog.hidden_products : "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
