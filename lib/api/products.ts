import { apiRequest } from "@/lib/api/client";
import type {
  ListProductsParams,
  ShopProduct,
  ShopProductList,
} from "@/lib/types/product";

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
  if (params.min_price !== undefined) {
    searchParams.set("min_price", String(params.min_price));
  }
  if (params.max_price !== undefined) {
    searchParams.set("max_price", String(params.max_price));
  }
  if (params.size) searchParams.set("size", params.size);
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listProductsPage(
  params: ListProductsParams = {},
): Promise<ShopProductList> {
  const result = await apiRequest<ShopProductList | ShopProduct[]>(
    `/products/${buildQuery(params)}`,
  );
  // Tolerate the pre-envelope array shape during rollout.
  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      limit: params.limit ?? null,
      offset: params.offset ?? 0,
    };
  }
  return result;
}

/** Convenience for callers that only need the items. */
export async function listProducts(
  params: ListProductsParams = {},
): Promise<ShopProduct[]> {
  return (await listProductsPage(params)).items;
}

export async function getProductBySlug(slug: string): Promise<ShopProduct> {
  return apiRequest<ShopProduct>(`/products/slug/${slug}`);
}

export async function getProduct(id: number): Promise<ShopProduct> {
  return apiRequest<ShopProduct>(`/products/${id}`);
}
