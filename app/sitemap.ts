import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, categories] = await Promise.all([
      listProducts(),
      listCategories(),
    ]);
    productEntries = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    categoryEntries = categories.map((category) => ({
      url: `${SITE_URL}/products?category=${encodeURIComponent(category.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // API unreachable at build/revalidate time — ship the static entries.
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
