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
