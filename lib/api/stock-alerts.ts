import { apiRequest } from "@/lib/api/client";

export async function createStockAlert(
  productId: number,
  email: string,
  size?: string,
  color?: string,
): Promise<void> {
  await apiRequest(`/products/${productId}/stock-alerts`, {
    method: "POST",
    body: { email, size: size || null, color: color || null },
  });
}
