import type { ShopProduct } from "@/lib/types/product";

export type ApiWishlistItem = {
  id: number;
  product_id: number;
  product: ShopProduct | null;
};
