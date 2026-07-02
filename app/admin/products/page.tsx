"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteProduct, listAdminProducts } from "@/lib/api/admin";
import type { AdminProduct } from "@/lib/types/admin";
import { formatPrice } from "@/lib/products";
import { getErrorMessage } from "@/lib/api/errors";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProducts() {
    setIsLoading(true);
    try {
      setProducts(await listAdminProducts());
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load products."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

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

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="px-3 py-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-muted-foreground">{product.slug}</div>
                  </td>
                  <td className="px-3 py-4">
                    {formatPrice(product.price_cents / 100)}
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
