import { API_BASE_URL } from "@/lib/config";
import { ApiError } from "@/lib/api/errors";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/storage";
import type { TokenPair } from "@/lib/types/auth";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  if (typeof window === "undefined") {
    return fetch(url, init);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function buildHeaders(
  token: string | null | undefined,
  headers: Record<string, string>,
  body: unknown,
): Headers {
  const nextHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "object" && item && "msg" in item) {
            return String(item.msg);
          }

          return String(item);
        })
        .join(", ");
    }
  } catch {
    // Fall back to status text below.
  }

  return response.statusText || "Request failed";
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    token,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: RequestOptions = {},
): Promise<T> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}${path}`,
    {
      method,
      headers: buildHeaders(token, headers, body),
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    },
    timeoutMs,
  );

  if (!response.ok) {
    throw new ApiError(response.status, await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await apiRequest<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
    setTokens(tokens.access_token, tokens.refresh_token);
    return tokens.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

export async function restoreSession(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (getAccessToken()) {
    return true;
  }

  const refreshedToken = await refreshAccessToken();
  return Boolean(refreshedToken);
}

export async function apiRequestWithAuth<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    return await apiRequest<T>(path, { ...options, token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw error;
    }

    return apiRequest<T>(path, { ...options, token: refreshedToken });
  }
}
