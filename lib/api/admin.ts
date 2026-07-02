import { apiRequestWithAuth } from "@/lib/api/client";
import type { Category } from "@/lib/types/product";
import type {
  AdminProduct,
  CategoryInput,
  PresignUploadResponse,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/types/admin";
import type { AdminOrder, OrderStatus } from "@/lib/types/order";
import type { User } from "@/lib/types/auth";

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
  const presigned = await presignUpload(file.name, file.type);
  const response = await fetch(presigned.upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to storage.");
  }

  return presigned.public_url;
}

export async function listAdminOrders(
  status?: OrderStatus,
): Promise<AdminOrder[]> {
  const query = status ? `?status=${status}` : "";
  return apiRequestWithAuth<AdminOrder[]>(`/admin/orders${query}`);
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

export async function listAdminUsers(): Promise<User[]> {
  return apiRequestWithAuth<User[]>("/admin/users");
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
