"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteProduct, listAdminProducts, listCategories } from "@/lib/api/admin";
import type { AdminProduct } from "@/lib/types/admin";
import type { Category } from "@/lib/types/product";
import { formatPrice } from "@/lib/products";
import { getErrorMessage } from "@/lib/api/errors";
import { resolveMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";

type StatusFilter = "all" | "active" | "hidden";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  async function loadProducts() {
    setIsLoading(true);
    try {
      const [productList, categoryList] = await Promise.all([
        listAdminProducts(),
        listCategories(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load products."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter === "active" && !product.is_active) return false;
      if (statusFilter === "hidden" && product.is_active) return false;
      if (!q) return true;
      const categoryName = product.category_id
        ? categoryNameById.get(product.category_id) ?? ""
        : "";
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter, categoryNameById]);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this product?")) return;
    setError(null);
    setNotice(null);
    try {
      const { deactivated } = await deleteProduct(id);
      if (deactivated) {
        setNotice(
          "This product has existing orders, so it was archived (hidden from the storefront) instead of deleted.",
        );
      }
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete product."));
    }
  }

  function primaryImage(product: AdminProduct): string {
    const primary =
      product.images.find((image) => image.is_primary) ?? product.images[0];
    return resolveMediaUrl(primary?.url);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage storefront products and images.
          </p>
        </div>
        <Button href="/admin/products/new">Add product</Button>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}
      {notice ? (
        <Alert variant="info" className="mt-6">
          {notice}
        </Alert>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, slug, or category…"
          className="sm:max-w-sm"
          aria-label="Search products"
        />
        <div className="flex gap-2">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["hidden", "Hidden"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                statusFilter === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted-foreground">
                  {products.length === 0
                    ? "No products yet."
                    : "No products match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                        <Image
                          src={primaryImage(product)}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        {product.is_active ? (
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{product.name}</span>
                        )}
                        <div className="text-muted-foreground">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">
                    {product.category_id
                      ? categoryNameById.get(product.category_id) ?? "—"
                      : "—"}
                  </td>
                  <td className="px-3 py-4">
                    <div>{formatPrice(product.price_cents / 100)}</div>
                    {product.sale_price_cents != null &&
                    product.sale_price_cents < product.price_cents ? (
                      <div className="text-sm text-muted-foreground">
                        Sale {formatPrice(product.sale_price_cents / 100)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-4">{product.stock}</td>
                  <td className="px-3 py-4">
                    {product.is_active ? "Active" : "Hidden"}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id)}
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
