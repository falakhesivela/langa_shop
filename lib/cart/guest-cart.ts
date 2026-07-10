import type { CartItem } from "@/components/cart-context";

// A guest's bag lives entirely in the browser until they check out or log in.
const GUEST_CART_KEY = "newfit_guest_cart";
const GUEST_EMAIL_KEY = "newfit_guest_checkout_email";

export function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    // Older guest carts may lack stock; treat missing as unlimited until refreshed.
    return parsed.map((item) => ({
      ...item,
      stock: typeof item.stock === "number" ? Math.max(0, item.stock) : Number.MAX_SAFE_INTEGER,
    }));
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(GUEST_CART_KEY);
}

// Email is stashed before redirecting to Paystack so the callback page can
// verify a guest order (which is gated on the checkout email server-side).
export function setGuestCheckoutEmail(email: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(GUEST_EMAIL_KEY, email);
}

export function getGuestCheckoutEmail(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(GUEST_EMAIL_KEY);
}

export function clearGuestCheckoutEmail(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(GUEST_EMAIL_KEY);
}
