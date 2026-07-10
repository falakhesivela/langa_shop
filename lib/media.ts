import { API_BASE_URL } from "@/lib/config";

const R2_PUBLIC_BASE = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? ""
).replace(/\/$/, "");

/**
 * Rewrite Cloudflare R2 public URLs through the API media proxy.
 * Needed when *.r2.dev does not resolve on the local network (common on WSL).
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("/") || url.startsWith("blob:")) return url;

  try {
    const parsed = new URL(url);
    const isConfiguredR2 =
      R2_PUBLIC_BASE.length > 0 && url.startsWith(`${R2_PUBLIC_BASE}/`);
    const isR2Dev = parsed.hostname.endsWith(".r2.dev");

    if (isConfiguredR2 || isR2Dev) {
      const key = parsed.pathname.replace(/^\/+/, "");
      if (!key) return url;
      return `${API_BASE_URL}/media/${key}`;
    }
  } catch {
    return url;
  }

  return url;
}
