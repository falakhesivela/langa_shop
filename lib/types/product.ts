export type ShopProduct = {
  id: number;
  slug: string;
  name: string;
  price_cents: number;
  currency: string;
  category: string | null;
  color: string | null;
  badge: string | null;
  description: string | null;
  details: string[];
  materials: string | null;
  sizes: string[];
  image: string | null;
  stock: number;
  is_active: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type ProductSort = "featured" | "price_asc" | "price_desc";

export type ListProductsParams = {
  category?: string;
  search?: string;
  sort?: ProductSort;
  is_active?: boolean;
};
