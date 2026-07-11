export type ShopProductImage = {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ShopProduct = {
  id: number;
  slug: string;
  name: string;
  price_cents: number;
  sale_price_cents: number | null;
  effective_price_cents: number;
  is_on_sale: boolean;
  currency: string;
  category: string | null;
  colors: string[];
  badge: string | null;
  description: string | null;
  details: string[];
  materials: string | null;
  sizes: string[];
  image: string | null;
  images?: ShopProductImage[];
  stock: number;
  variant_stock?: Record<string, number>;
  is_active: boolean;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type ProductSort = "featured" | "price_asc" | "price_desc";

export type ListProductsParams = {
  category?: string;
  search?: string;
  sort?: ProductSort;
  is_active?: boolean;
  on_sale?: boolean;
  /** Effective (charged) price bounds, in cents. */
  min_price?: number;
  max_price?: number;
  size?: string;
  limit?: number;
  offset?: number;
};

export type ShopProductList = {
  items: ShopProduct[];
  total: number;
  limit: number | null;
  offset: number;
};

export type PromotionPlacement = "announcement" | "hero" | "sale_collection";

export type Promotion = {
  id: number;
  name: string;
  slug: string;
  placement: PromotionPlacement;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
