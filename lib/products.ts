import type { ShopProduct } from "@/lib/types/product";
import { DEFAULT_CURRENCY } from "@/lib/config";
import { resolveMediaUrl } from "@/lib/media";
import { totalVariantStock } from "@/lib/stock";

export type ProductImage = {
  id: number;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  /** Current selling price (sale price when on sale). */
  price: number;
  /** Regular list price shown as strikethrough when on sale. */
  compareAtPrice?: number;
  isOnSale: boolean;
  category: string;
  colors: string[];
  /** Primary image URL (for cards, cart, wishlist). */
  image: string;
  /** All product images, ordered by sortOrder. */
  images: ProductImage[];
  badge?: "New" | "Bestseller" | "Limited" | "Sale";
  description: string;
  details: string[];
  materials: string;
  sizes: string[];
  /** Total units available across all variants (or product-level stock). */
  stock: number;
  /** Per size/color stock keyed as `SIZE|color`. Empty = product-level only. */
  variantStock: Record<string, number>;
};

export function mapShopProduct(product: ShopProduct): Product {
  const effectiveCents =
    product.effective_price_cents ?? product.price_cents;
  const onSale =
    product.is_on_sale ??
    (product.sale_price_cents != null &&
      product.sale_price_cents < product.price_cents);

  const images: ProductImage[] = (product.images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      url: resolveMediaUrl(img.url),
      altText: img.alt_text?.trim() || product.name,
      sortOrder: img.sort_order,
      isPrimary: img.is_primary,
    }));

  const primaryFromList =
    images.find((img) => img.isPrimary)?.url ?? images[0]?.url;
  const image =
    product.image != null && product.image !== ""
      ? resolveMediaUrl(product.image)
      : (primaryFromList ?? "/placeholder.svg");

  // If API only returned the convenience `image` field, keep a single-entry list
  // so the gallery always has something to render.
  const galleryImages =
    images.length > 0
      ? images
      : image && image !== "/placeholder.svg"
        ? [
            {
              id: 0,
              url: image,
              altText: product.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ]
        : [];

  const variantStock = product.variant_stock ?? {};

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: effectiveCents / 100,
    compareAtPrice: onSale ? product.price_cents / 100 : undefined,
    isOnSale: onSale,
    category: product.category?.trim() || "Uncategorized",
    colors: product.colors ?? [],
    image,
    images: galleryImages,
    badge: onSale
      ? "Sale"
      : (product.badge as Product["badge"]),
    description: product.description ?? "",
    details: product.details ?? [],
    materials: product.materials ?? "",
    sizes: product.sizes.length > 0 ? product.sizes : ["One Size"],
    stock: totalVariantStock(variantStock, Math.max(0, product.stock ?? 0)),
    variantStock,
  };
}

export function formatPrice(
  price: number,
  currency: string = DEFAULT_CURRENCY,
) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function toApiSort(
  sort: "featured" | "price-asc" | "price-desc",
): "featured" | "price_asc" | "price_desc" {
  if (sort === "price-asc") return "price_asc";
  if (sort === "price-desc") return "price_desc";
  return "featured";
}
