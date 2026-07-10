import type { Product } from "@/lib/products";

// The wishlist lives in the browser so it works for guests and members alike
// without a backend/schema change.
export const WISHLIST_KEY = "newfit_wishlist";

export function readWishlist(): Product[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      stock:
        typeof item.stock === "number" ? Math.max(0, item.stock) : Number.MAX_SAFE_INTEGER,
    }));
  } catch {
    return [];
  }
}

export function writeWishlist(items: Product[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

export function clearWishlist(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(WISHLIST_KEY);
}
