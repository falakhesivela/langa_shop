import { apiRequest } from "@/lib/api/client";
import type { Category } from "@/lib/types/product";

export async function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories/");
}
