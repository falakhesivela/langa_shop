import { apiRequest } from "@/lib/api/client";
import type { Promotion, PromotionPlacement } from "@/lib/types/product";

export async function listActivePromotions(
  placement?: PromotionPlacement,
): Promise<Promotion[]> {
  const query = placement ? `?placement=${placement}` : "";
  return apiRequest<Promotion[]>(`/promotions/active${query}`);
}
