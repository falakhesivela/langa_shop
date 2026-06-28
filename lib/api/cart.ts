import { apiRequestWithAuth } from "@/lib/api/client";
import type { AddCartItemInput, ApiCartItem } from "@/lib/types/cart";

export async function listCartItems(): Promise<ApiCartItem[]> {
  return apiRequestWithAuth<ApiCartItem[]>("/cart/");
}

export async function addCartItem(input: AddCartItemInput): Promise<ApiCartItem> {
  return apiRequestWithAuth<ApiCartItem>("/cart/items", {
    method: "POST",
    body: input,
  });
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  return apiRequestWithAuth<void>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}
