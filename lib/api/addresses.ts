import { apiRequestWithAuth } from "@/lib/api/client";
import type { UserAddress, UserAddressInput } from "@/lib/types/address";

export async function listAddresses(): Promise<UserAddress[]> {
  return apiRequestWithAuth<UserAddress[]>("/account/addresses/");
}

export async function createAddress(
  input: UserAddressInput,
): Promise<UserAddress> {
  return apiRequestWithAuth<UserAddress>("/account/addresses/", {
    method: "POST",
    body: input,
  });
}

export async function updateAddress(
  id: number,
  input: Partial<UserAddressInput>,
): Promise<UserAddress> {
  return apiRequestWithAuth<UserAddress>(`/account/addresses/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteAddress(id: number): Promise<void> {
  return apiRequestWithAuth<void>(`/account/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function setDefaultAddress(id: number): Promise<UserAddress> {
  return apiRequestWithAuth<UserAddress>(`/account/addresses/${id}/default`, {
    method: "POST",
  });
}
