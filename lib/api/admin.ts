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
import type {
  AdminOrder,
  AdminOrderList,
  AdminReturnList,
  AdminReturnRequest,
  OrderStatus,
  ReturnStatus,
} from "@/lib/types/order";
import type { AdminReview, AdminReviewList } from "@/lib/types/review";
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

export async function listAdminReviews(
  status?: "pending" | "approved",
  limit = 25,
  offset = 0,
): Promise<AdminReviewList> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return apiRequestWithAuth<AdminReviewList>(`/admin/reviews?${params}`);
}

export async function approveAdminReview(reviewId: number): Promise<AdminReview> {
  return apiRequestWithAuth<AdminReview>(`/admin/reviews/${reviewId}/approve`, {
    method: "POST",
  });
}

export async function deleteAdminReview(reviewId: number): Promise<void> {
  return apiRequestWithAuth<void>(`/admin/reviews/${reviewId}`, {
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

/** Fetches an authenticated admin file (e.g. CSV export) and triggers a
 * browser download. */
export async function downloadAdminFile(
  path: string,
  filename: string,
): Promise<void> {
  const { getAccessToken } = await import("@/lib/auth/storage");
  const { API_BASE_URL } = await import("@/lib/config");
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Export failed (${response.status}).`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function listAdminReturns(
  status?: ReturnStatus,
  limit = 25,
  offset = 0,
): Promise<AdminReturnList> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return apiRequestWithAuth<AdminReturnList>(`/admin/returns?${params}`);
}

export async function updateAdminReturn(
  returnId: number,
  input: { status: ReturnStatus; admin_note?: string },
): Promise<AdminReturnRequest> {
  return apiRequestWithAuth<AdminReturnRequest>(`/admin/returns/${returnId}`, {
    method: "PATCH",
    body: input,
  });
}

export type NewsletterSubscriber = {
  id: number;
  email: string;
  created_at: string;
};

export async function listNewsletterSubscribers(): Promise<
  NewsletterSubscriber[]
> {
  return apiRequestWithAuth<NewsletterSubscriber[]>("/admin/newsletter");
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
