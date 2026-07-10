import { apiRequest, apiRequestWithAuth } from "@/lib/api/client";
import type { ShippingAddress, ShippingRate } from "@/lib/types/shipping";

export async function getShippingConfig(): Promise<{ enabled: boolean }> {
  return apiRequest<{ enabled: boolean }>("/shipping/config");
}

export async function getShippingRates(
  destination: ShippingAddress,
): Promise<ShippingRate[]> {
  return apiRequestWithAuth<ShippingRate[]>("/shipping/rates", {
    method: "POST",
    body: { destination },
  });
}

export type GuestRateItem = { product_id: number; quantity: number };

export async function getGuestShippingRates(
  destination: ShippingAddress,
  items: GuestRateItem[],
): Promise<ShippingRate[]> {
  return apiRequest<ShippingRate[]>("/shipping/guest/rates", {
    method: "POST",
    body: { destination, items },
  });
}
