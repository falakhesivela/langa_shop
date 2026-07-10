"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/lib/auth/context";
import {
  getGuestShippingRates,
  getShippingConfig,
  getShippingRates,
} from "@/lib/api/shipping";
import { checkout, guestCheckout } from "@/lib/api/orders";
import { validateDiscount, type DiscountValidation } from "@/lib/api/discounts";
import { setGuestCheckoutEmail } from "@/lib/cart/guest-cart";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import { ColorSwatch } from "@/components/color-swatch";
import type { ShippingAddress, ShippingRate } from "@/lib/types/shipping";
import { AddressAutocompleteInput } from "@/components/checkout/address-autocomplete-input";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { isPlacesEnabled } from "@/lib/places/load-places";
import type { ParsedPlaceAddress } from "@/lib/places/parse-address";

const emptyAddress = {
  full_name: "",
  phone: "",
  address1: "",
  address2: "",
  suburb: "",
  city: "",
  province: "",
  postal_code: "",
};

export default function CheckoutPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading: cartLoading } = useCart();

  const [form, setForm] = useState(emptyAddress);
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountValidation | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  useEffect(() => {
    void getShippingConfig()
      .then((c) => setShippingEnabled(c.enabled))
      .catch(() => setShippingEnabled(false));
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const selectedRate = rates.find((r) => r.id === selectedCode) ?? null;
  const shippingRand = selectedRate ? selectedRate.price_cents / 100 : 0;

  // Recompute the discount for the current subtotal so it stays right even if
  // the cart changed after the code was applied. The server re-validates at pay.
  const discountRand = appliedDiscount
    ? appliedDiscount.discount_type === "percent"
      ? Math.min(subtotal, (subtotal * appliedDiscount.value) / 100)
      : Math.min(subtotal, appliedDiscount.value / 100)
    : 0;
  const totalRand = Math.max(0, subtotal - discountRand) + shippingRand;

  async function handleApplyDiscount() {
    const code = discountInput.trim();
    if (!code) return;
    setDiscountError(null);
    setIsApplyingDiscount(true);
    try {
      const result = await validateDiscount(code, Math.round(subtotal * 100));
      setAppliedDiscount(result);
      setDiscountInput("");
    } catch (err) {
      setDiscountError(getErrorMessage(err, "Unable to apply this code."));
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountError(null);
  }

  function updateField(key: keyof typeof emptyAddress, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Any address change invalidates previously fetched rates.
    setRates([]);
    setSelectedCode(null);
  }

  function applyPlaceAddress(place: ParsedPlaceAddress) {
    setForm((prev) => ({
      ...prev,
      address1: place.address1 || prev.address1,
      suburb: place.suburb || prev.suburb,
      city: place.city || prev.city,
      province: place.province || prev.province,
      postal_code: place.postal_code || prev.postal_code,
    }));
    setRates([]);
    setSelectedCode(null);
  }

  function buildAddress(): ShippingAddress {
    return {
      full_name: form.full_name || null,
      phone: form.phone || null,
      address1: form.address1,
      address2: form.address2 || null,
      suburb: form.suburb || null,
      city: form.city,
      province: form.province || null,
      postal_code: form.postal_code,
      country: "ZA",
    };
  }

  const addressComplete =
    form.address1.trim() && form.city.trim() && form.postal_code.trim();

  // South African postal codes are four digits.
  const postalValid = /^\d{4}$/.test(form.postal_code.trim());
  // Guests have no account profile, so we require full contact + delivery
  // details up front (matches the server-side validation).
  const guestDetailsComplete = Boolean(
    form.full_name.trim() &&
      form.phone.trim() &&
      addressComplete &&
      postalValid,
  );

  async function handleGetRates(event: FormEvent) {
    event.preventDefault();
    setRatesError(null);
    setRatesLoading(true);
    try {
      const result = isAuthenticated
        ? await getShippingRates(buildAddress())
        : await getGuestShippingRates(
            buildAddress(),
            items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
          );
      setRates(result);
      setSelectedCode(result[0]?.id ?? null);
      if (result.length === 0) {
        setRatesError("No shipping options available for this address.");
      }
    } catch (err) {
      setRatesError(getErrorMessage(err, "Unable to fetch shipping rates."));
    } finally {
      setRatesLoading(false);
    }
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());

  async function handlePay() {
    setPayError(null);
    if (shippingEnabled && !selectedCode) {
      setPayError("Please get and select a shipping option first.");
      return;
    }
    if (!isAuthenticated) {
      if (!emailValid) {
        setPayError("Please enter a valid email so we can send your order confirmation.");
        return;
      }
      if (!form.full_name.trim() || !form.phone.trim()) {
        setPayError("Please enter your full name and phone number for delivery.");
        return;
      }
      if (!addressComplete || !postalValid) {
        setPayError("Please enter a complete delivery address with a 4-digit postal code.");
        return;
      }
    }
    setIsPaying(true);
    try {
      const result = isAuthenticated
        ? await checkout({
            shipping_address: buildAddress(),
            shipping_rate_id: selectedCode ?? undefined,
            discount_code: appliedDiscount?.code,
          })
        : await guestCheckout({
            email: guestEmail.trim(),
            full_name: form.full_name || undefined,
            shipping_address: buildAddress(),
            shipping_rate_id: selectedCode ?? undefined,
            discount_code: appliedDiscount?.code,
            items: items.map((i) => ({
              product_id: i.productId,
              size: i.size,
              color: i.color || undefined,
              quantity: i.qty,
            })),
          });
      // Remember the guest email so the callback page can verify the order.
      if (!isAuthenticated) setGuestCheckoutEmail(guestEmail.trim());
      window.location.href = result.authorization_url;
    } catch (err) {
      setPayError(getErrorMessage(err, "Unable to start checkout."));
      setIsPaying(false);
    }
  }

  if (authLoading || cartLoading) {
    return <p className="py-16 text-center text-muted-foreground">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <Button href="/products" className="mt-6">
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-serif text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Shipping address + rates */}
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="space-y-4 rounded-sm border border-border p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-2xl">Contact</h2>
                <p className="text-sm text-muted-foreground">
                  Have an account?{" "}
                  <Link
                    href="/login?next=/checkout"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  We&apos;ll send your order confirmation here. No account needed.
                </p>
              </div>
            </div>
          ) : null}

          <form
            onSubmit={handleGetRates}
            className="space-y-5 rounded-sm border border-border p-6"
          >
            <h2 className="font-serif text-2xl">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} required={!isAuthenticated} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required={!isAuthenticated} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal code</Label>
                <Input id="postal_code" value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address1">Street address</Label>
                <AddressAutocompleteInput
                  id="address1"
                  value={form.address1}
                  onChange={(value) => updateField("address1", value)}
                  onPlaceSelect={applyPlaceAddress}
                  required
                />
                {isPlacesEnabled() ? (
                  <p className="text-sm text-muted-foreground">
                    Start typing and pick a suggestion to fill suburb, city, province, and postal code.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                <Input id="address2" value={form.address2} onChange={(e) => updateField("address2", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suburb">Suburb</Label>
                <Input id="suburb" value={form.suburb} onChange={(e) => updateField("suburb", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="province">Province</Label>
                <Input id="province" value={form.province} onChange={(e) => updateField("province", e.target.value)} />
              </div>
            </div>

            {shippingEnabled ? (
              <Button type="submit" variant="secondary" isLoading={ratesLoading} disabled={!addressComplete}>
                Get shipping options
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Shipping rates are not enabled — you can place your order and we&apos;ll arrange delivery.
              </p>
            )}
          </form>

          {ratesError ? <Alert>{ratesError}</Alert> : null}

          {rates.length > 0 ? (
            <div className="space-y-3 rounded-sm border border-border p-6">
              <h2 className="font-serif text-2xl">Shipping options</h2>
              {rates.map((rate) => (
                <label
                  key={rate.id}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-sm border p-4 transition-colors ${
                    selectedCode === rate.id ? "border-foreground" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="rate"
                      className="mt-1"
                      checked={selectedCode === rate.id}
                      onChange={() => setSelectedCode(rate.id)}
                    />
                    <div>
                      <p className="font-medium">{rate.service_name}</p>
                      {rate.description ? (
                        <p className="text-sm text-muted-foreground">{rate.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(rate.price_cents / 100)}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>

        {/* Order summary */}
        <aside className="h-fit space-y-4 rounded-sm border border-border p-6">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="space-y-3 text-sm">
            {items.map((item) => (
              <li key={`${item.slug}-${item.size}-${item.color}`} className="flex justify-between gap-4">
                <span>
                  {item.name}{" "}
                  <span className="text-muted-foreground">
                    × {item.qty}
                    {item.color ? (
                      <>
                        {" "}
                        ·{" "}
                        <span className="inline-flex items-center gap-1 align-middle">
                          <ColorSwatch color={item.color} size="sm" />
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-border pt-4">
            {appliedDiscount ? (
              <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm">
                <span>
                  Code <span className="font-mono font-medium">{appliedDiscount.code}</span>{" "}
                  applied
                </span>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={discountInput}
                  onChange={(e) => {
                    setDiscountInput(e.target.value.toUpperCase());
                    setDiscountError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleApplyDiscount();
                    }
                  }}
                  placeholder="Discount code"
                  aria-label="Discount code"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleApplyDiscount()}
                  disabled={isApplyingDiscount || !discountInput.trim()}
                >
                  {isApplyingDiscount ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {discountError ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {discountError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedDiscount ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Discount ({appliedDiscount.code})
                </span>
                <span>−{formatPrice(discountRand)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{selectedRate ? formatPrice(shippingRand) : "—"}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(totalRand)}</span>
            </div>
          </div>

          {payError ? <Alert>{payError}</Alert> : null}

          <Button
            className="w-full"
            onClick={() => void handlePay()}
            isLoading={isPaying}
            disabled={
              (shippingEnabled && !selectedCode) ||
              (!isAuthenticated && (!emailValid || !guestDetailsComplete))
            }
          >
            Pay {formatPrice(totalRand)}
          </Button>
        </aside>
      </div>
    </div>
  );
}
