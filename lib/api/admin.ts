import { apiRequestWithAuth } from "@/lib/api/client";
import type { Category, Promotion } from "@/lib/types/product";
import type {
  AdminProduct,
  AdminStats,
  CategoryInput,
  DiscountCode,
  DiscountCodeInput,
  PresignUploadResponse,
  ProductCreateInput,
  ProductUpdateInput,
  PromotionInput,
} from "@/lib/types/admin";
import type { AdminOrder, AdminOrderList, OrderStatus } from "@/lib/types/order";
import type { User } from "@/lib/types/auth";

export async function getAdminStats(): Promise<AdminStats> {
  return apiRequestWithAuth<AdminStats>("/admin/stats");
}

export async function listAdminProducts(
  isActive?: boolean,
): Promise<AdminProduct[]> {
  const query =
    isActive === undefined ? "" : `?is_active=${isActive ? "true" : "false"}`;
  return apiRequestWithAuth<AdminProduct[]>(`/admin/products${query}`);
}

export async function getAdminProduct(id: number): Promise<AdminProduct> {
  return apiRequestWithAuth<AdminProduct>(`/admin/products/${id}`);
}

export async function createProduct(
  input: ProductCreateInput,
): Promise<AdminProduct> {
  return apiRequestWithAuth<AdminProduct>("/products/", {
    method: "POST",
    body: input,
  });
}

export async function updateProduct(
  id: number,
  input: ProductUpdateInput,
): Promise<AdminProduct> {
  return apiRequestWithAuth<AdminProduct>(`/products/${id}`, {
    method: "PUT",
    body: input,
  });
}

export async function deleteProduct(
  id: number,
): Promise<{ deactivated: boolean }> {
  return apiRequestWithAuth<{ deactivated: boolean }>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function listCategories(): Promise<Category[]> {
  return apiRequestWithAuth<Category[]>("/categories/");
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return apiRequestWithAuth<Category>("/categories/", {
    method: "POST",
    body: input,
  });
}

export async function updateCategory(
  id: number,
  input: Partial<CategoryInput>,
): Promise<Category> {
  return apiRequestWithAuth<Category>(`/categories/${id}`, {
    method: "PUT",
    body: input,
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return apiRequestWithAuth<void>(`/categories/${id}`, {
    method: "DELETE",
  });
}

export async function listPromotions(): Promise<Promotion[]> {
  return apiRequestWithAuth<Promotion[]>("/promotions/");
}

export async function createPromotion(
  input: PromotionInput,
): Promise<Promotion> {
  return apiRequestWithAuth<Promotion>("/promotions/", {
    method: "POST",
    body: input,
  });
}

export async function updatePromotion(
  id: number,
  input: Partial<PromotionInput>,
): Promise<Promotion> {
  return apiRequestWithAuth<Promotion>(`/promotions/${id}`, {
    method: "PUT",
    body: input,
  });
}

export async function deletePromotion(id: number): Promise<void> {
  return apiRequestWithAuth<void>(`/promotions/${id}`, {
    method: "DELETE",
  });
}

export async function listDiscounts(): Promise<DiscountCode[]> {
  return apiRequestWithAuth<DiscountCode[]>("/admin/discounts");
}

export async function createDiscount(
  input: DiscountCodeInput,
): Promise<DiscountCode> {
  return apiRequestWithAuth<DiscountCode>("/admin/discounts", {
    method: "POST",
    body: input,
  });
}

export async function updateDiscount(
  id: number,
  input: Partial<DiscountCodeInput>,
): Promise<DiscountCode> {
  return apiRequestWithAuth<DiscountCode>(`/admin/discounts/${id}`, {
    method: "PUT",
    body: input,
  });
}

export async function deleteDiscount(id: number): Promise<void> {
  return apiRequestWithAuth<void>(`/admin/discounts/${id}`, {
    method: "DELETE",
  });
}

export async function presignUpload(
  filename: string,
  contentType: string,
): Promise<PresignUploadResponse> {
  return apiRequestWithAuth<PresignUploadResponse>("/uploads/presign", {
    method: "POST",
    body: { filename, content_type: contentType },
  });
}

export async function uploadFileToR2(file: File): Promise<string> {
  const contentType =
    file.type ||
    (file.name.toLowerCase().endsWith(".png")
      ? "image/png"
      : file.name.toLowerCase().endsWith(".webp")
        ? "image/webp"
        : file.name.toLowerCase().endsWith(".gif")
          ? "image/gif"
          : "image/jpeg");
  const presigned = await presignUpload(file.name, contentType);
  const response = await fetch(presigned.upload_url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail
        ? `Failed to upload image to storage (${response.status}): ${detail}`
        : `Failed to upload image to storage (${response.status}).`,
    );
  }

  return presigned.public_url;
}

export type AdminOrderQuery = {
  status?: OrderStatus;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
};

export async function listAdminOrders(
  query: AdminOrderQuery = {},
): Promise<AdminOrderList> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.q) params.set("q", query.q);
  if (query.dateFrom) params.set("date_from", query.dateFrom);
  if (query.dateTo) params.set("date_to", query.dateTo);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return apiRequestWithAuth<AdminOrderList>(`/admin/orders${suffix}`);
}

export async function resendOrderConfirmation(
  orderId: number,
): Promise<{ sent: boolean }> {
  return apiRequestWithAuth<{ sent: boolean }>(
    `/admin/orders/${orderId}/resend-confirmation`,
    { method: "POST" },
  );
}

export async function getAdminOrder(orderId: number): Promise<AdminOrder> {
  return apiRequestWithAuth<AdminOrder>(`/admin/orders/${orderId}`);
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: OrderStatus,
): Promise<AdminOrder> {
  return apiRequestWithAuth<AdminOrder>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function createAdminShipment(orderId: number): Promise<AdminOrder> {
  return apiRequestWithAuth<AdminOrder>(`/admin/orders/${orderId}/shipment`, {
    method: "POST",
  });
}

export async function listAdminUsers(): Promise<User[]> {
  return apiRequestWithAuth<User[]>("/admin/users");
}

export type AdminCustomerDetail = {
  user: User;
  order_count: number;
  total_spent_cents: number;
  orders: AdminOrder[];
};

export async function getAdminCustomer(
  userId: number,
): Promise<AdminCustomerDetail> {
  return apiRequestWithAuth<AdminCustomerDetail>(`/admin/users/${userId}`);
}

export async function updateAdminUser(
  userId: number,
  input: { is_admin?: boolean; is_active?: boolean },
): Promise<User> {
  return apiRequestWithAuth<User>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: input,
  });
}
