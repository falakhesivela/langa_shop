import type { OrderStatus } from "@/lib/types/order";

export type ProductImageInput = {
  url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  currency: string;
  stock: number;
  variant_stock?: Record<string, number>;
  is_active: boolean;
  category_id: number | null;
  colors: string[];
  badge: string | null;
  materials: string | null;
  details: string[];
  sizes: string[];
  weight_grams: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  created_at: string;
  updated_at: string;
  images: Array<{
    id: number;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }>;
};

export type ProductCreateInput = {
  name: string;
  slug: string;
  description?: string | null;
  price_cents: number;
  sale_price_cents?: number | null;
  currency?: string;
  stock: number;
  variant_stock?: Record<string, number>;
  is_active?: boolean;
  category_id?: number | null;
  colors?: string[];
  badge?: string | null;
  materials?: string | null;
  details?: string[];
  sizes?: string[];
  weight_grams?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  images?: ProductImageInput[];
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
};

export type PromotionInput = {
  name: string;
  slug: string;
  placement: "announcement" | "hero" | "sale_collection";
  title: string;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export type PresignUploadResponse = {
  upload_url: string;
  public_url: string;
  key: string;
};

export type DiscountCode = {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  value: number;
  min_subtotal_cents: number;
  max_uses: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  times_used: number;
  created_at: string;
  updated_at: string;
};

export type DiscountCodeInput = {
  code: string;
  description?: string | null;
  discount_type: "percent" | "fixed";
  value: number;
  min_subtotal_cents?: number;
  max_uses?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
};

export type AdminStats = {
  revenue: {
    today_cents: number;
    last_7_days_cents: number;
    last_30_days_cents: number;
    all_time_cents: number;
    currency: string;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    paid: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  customers: {
    total: number;
    new_last_30_days: number;
  };
  catalog: {
    active_products: number;
    hidden_products: number;
    out_of_stock: number;
    low_stock: number;
  };
  low_stock_products: Array<{
    id: number;
    name: string;
    slug: string;
    stock: number;
    is_active: boolean;
    image_url: string | null;
  }>;
  recent_orders: Array<{
    id: number;
    user_email: string;
    total_cents: number;
    status: OrderStatus;
    item_count: number;
    created_at: string;
  }>;
  top_products: Array<{
    product_id: number | null;
    name: string;
    units_sold: number;
    revenue_cents: number;
  }>;
};

export function adminProductToForm(product: AdminProduct) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: (product.price_cents / 100).toString(),
    sale_price:
      product.sale_price_cents != null
        ? (product.sale_price_cents / 100).toString()
        : "",
    currency: product.currency,
    stock: product.stock.toString(),
    is_active: product.is_active,
    category_id: product.category_id?.toString() ?? "",
    colors: product.colors ?? [],
    badge: product.badge ?? "",
    materials: product.materials ?? "",
    details: product.details.join("\n"),
    sizes: product.sizes.join(", "),
    images: product.images.map((image) => ({
      url: image.url,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
      is_primary: image.is_primary,
    })),
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
