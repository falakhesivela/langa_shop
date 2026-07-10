import { apiRequest } from "@/lib/api/client";

export type DiscountValidation = {
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  value: number;
  discount_cents: number;
};

export async function validateDiscount(
  code: string,
  subtotalCents: number,
): Promise<DiscountValidation> {
  return apiRequest<DiscountValidation>("/discounts/validate", {
    method: "POST",
    body: { code, subtotal_cents: subtotalCents },
  });
}
