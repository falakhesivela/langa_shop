import { apiRequest } from "@/lib/api/client";
import type { ListProductsParams, ShopProduct } from "@/lib/types/product";

function buildQuery(params: ListProductsParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.is_active !== undefined) {
    searchParams.set("is_active", String(params.is_active));
  }
  if (params.on_sale !== undefined) {
    searchParams.set("on_sale", String(params.on_sale));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ShopProduct[]> {
  return apiRequest<ShopProduct[]>(`/products/${buildQuery(params)}`);
}

export async function getProductBySlug(slug: string): Promise<ShopProduct> {
  return apiRequest<ShopProduct>(`/products/slug/${slug}`);
}
