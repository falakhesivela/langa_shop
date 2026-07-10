import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <p className="mt-3 text-muted-foreground">
        Manage your catalog, categories, orders, and product images.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-sm border border-border p-6 transition-colors hover:bg-muted"
        >
          <h2 className="font-serif text-2xl">Products</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, and publish products.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-sm border border-border p-6 transition-colors hover:bg-muted"
        >
          <h2 className="font-serif text-2xl">Categories</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize the storefront catalog.
          </p>
        </Link>
        <Link
          href="/admin/promotions"
          className="rounded-sm border border-border p-6 transition-colors hover:bg-muted"
        >
          <h2 className="font-serif text-2xl">Promotions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Announcement bars, campaigns, and sale messaging.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-sm border border-border p-6 transition-colors hover:bg-muted"
        >
          <h2 className="font-serif text-2xl">Orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review payments and update fulfillment status.
          </p>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-sm border border-border p-6 transition-colors hover:bg-muted"
        >
          <h2 className="font-serif text-2xl">Users</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage accounts and admin access.
          </p>
        </Link>
      </div>

      <div className="mt-8">
        <Button href="/admin/products/new">Add product</Button>
      </div>
    </div>
  );
}
