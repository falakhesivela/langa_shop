"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAdminProduct } from "@/lib/api/admin";
import type { AdminProduct } from "@/lib/types/admin";
import { ProductForm } from "@/components/admin/product-form";
import { getErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/components/ui/Alert";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setProduct(await getAdminProduct(Number(params.id)));
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load product."));
      }
    }

    void load();
  }, [params.id]);

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!product) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Edit product</h1>
      <p className="mt-2 text-muted-foreground">{product.name}</p>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
