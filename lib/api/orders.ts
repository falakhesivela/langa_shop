import { apiRequest, apiRequestWithAuth } from "@/lib/api/client";
import type {
  CheckoutResponse,
  GuestCartItemInput,
  Order,
  OrderVerifyResponse,
} from "@/lib/types/order";
import type { ShippingAddress } from "@/lib/types/shipping";

export type CheckoutInput = {
  shipping_address?: ShippingAddress;
  shipping_rate_id?: string;
};

export type GuestCheckoutInput = CheckoutInput & {
  email: string;
  full_name?: string;
  items: GuestCartItemInput[];
};

export async function checkout(
  input: CheckoutInput = {},
): Promise<CheckoutResponse> {
  return apiRequestWithAuth<CheckoutResponse>("/orders/checkout", {
    method: "POST",
    body: input,
  });
}

export async function guestCheckout(
  input: GuestCheckoutInput,
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>("/orders/guest/checkout", {
    method: "POST",
    body: input,
  });
}

export async function verifyPayment(
  reference: string,
): Promise<OrderVerifyResponse> {
  return apiRequestWithAuth<OrderVerifyResponse>(
    `/orders/verify/${encodeURIComponent(reference)}`,
  );
}

export async function guestVerifyPayment(
  reference: string,
  email: string,
): Promise<OrderVerifyResponse> {
  return apiRequest<OrderVerifyResponse>(
    `/orders/guest/verify/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`,
  );
}

export async function listOrders(): Promise<Order[]> {
  return apiRequestWithAuth<Order[]>("/orders/");
}

export async function getOrder(orderId: number): Promise<Order> {
  return apiRequestWithAuth<Order>(`/orders/${orderId}`);
}
