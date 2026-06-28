import type { ShopProduct } from "@/lib/types/product";
import { DEFAULT_CURRENCY } from "@/lib/config";

export type ProductCategory =
  | "Outerwear"
  | "Knitwear"
  | "Shirts"
  | "Trousers"
  | "Dresses"
  | "Accessories";

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: ProductCategory;
  color: string;
  image: string;
  badge?: "New" | "Bestseller" | "Limited";
  description: string;
  details: string[];
  materials: string;
  sizes: string[];
};

const CATEGORY_NAMES: ProductCategory[] = [
  "Outerwear",
  "Knitwear",
  "Shirts",
  "Trousers",
  "Dresses",
  "Accessories",
];

export const categories = ["All", ...CATEGORY_NAMES] as const;

export function mapShopProduct(product: ShopProduct): Product {
  const category = CATEGORY_NAMES.includes(product.category as ProductCategory)
    ? (product.category as ProductCategory)
    : "Accessories";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price_cents / 100,
    category,
    color: product.color ?? "",
    image: product.image ?? "/placeholder.svg",
    badge: product.badge as Product["badge"],
    description: product.description ?? "",
    details: product.details ?? [],
    materials: product.materials ?? "",
    sizes: product.sizes.length > 0 ? product.sizes : ["One Size"],
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
