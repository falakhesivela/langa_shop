import type { ShopProduct } from "@/lib/types/product";

export type ApiCartItem = {
  id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
  product: ShopProduct | null;
};

export type AddCartItemInput = {
  product_id: number;
  size: string;
  color?: string;
  quantity: number;
};
