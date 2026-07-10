import { apiRequestWithAuth } from "@/lib/api/client";
import type { ApiWishlistItem } from "@/lib/types/wishlist";

export async function listWishlistItems(): Promise<ApiWishlistItem[]> {
  return apiRequestWithAuth<ApiWishlistItem[]>("/wishlist/");
}

export async function addWishlistItem(
  productId: number,
): Promise<ApiWishlistItem> {
  return apiRequestWithAuth<ApiWishlistItem>("/wishlist/items", {
    method: "POST",
    body: { product_id: productId },
  });
}

export async function removeWishlistItem(productId: number): Promise<void> {
  return apiRequestWithAuth<void>(`/wishlist/items/${productId}`, {
    method: "DELETE",
  });
}
