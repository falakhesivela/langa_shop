import { apiRequestWithAuth } from "@/lib/api/client";
import type {
  CheckoutResponse,
  Order,
  OrderVerifyResponse,
} from "@/lib/types/order";

export async function checkout(): Promise<CheckoutResponse> {
  return apiRequestWithAuth<CheckoutResponse>("/orders/checkout", {
    method: "POST",
    body: {},
  });
}

export async function verifyPayment(
  reference: string,
): Promise<OrderVerifyResponse> {
  return apiRequestWithAuth<OrderVerifyResponse>(
    `/orders/verify/${encodeURIComponent(reference)}`,
  );
}

export async function listOrders(): Promise<Order[]> {
  return apiRequestWithAuth<Order[]>("/orders/");
}

export async function getOrder(orderId: number): Promise<Order> {
  return apiRequestWithAuth<Order>(`/orders/${orderId}`);
}
