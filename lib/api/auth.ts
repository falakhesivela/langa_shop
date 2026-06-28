import { apiRequest, apiRequestWithAuth } from "@/lib/api/client";
import type {
  LoginInput,
  RegisterInput,
  TokenPair,
  User,
} from "@/lib/types/auth";
import { getRefreshToken } from "@/lib/auth/storage";

export async function registerUser(input: RegisterInput): Promise<User> {
  return apiRequest<User>("/auth/register", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      full_name: input.full_name ?? null,
    },
  });
}

export async function loginUser(input: LoginInput): Promise<TokenPair> {
  const formData = new FormData();
  formData.append("username", input.email);
  formData.append("password", input.password);

  return apiRequest<TokenPair>("/auth/login", {
    method: "POST",
    body: formData,
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  return apiRequest<User>("/auth/me", { token });
}

export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return;
  }

  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
  } catch {
    // Best-effort logout.
  }
}

export async function getCurrentUserWithAuth(): Promise<User> {
  return apiRequestWithAuth<User>("/auth/me");
}
