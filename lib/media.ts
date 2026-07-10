import { API_BASE_URL } from "@/lib/config";

/**
 * Resolve product/media image URLs for display.
 *
 * Custom-domain R2 URLs are returned as-is (CDN).
 * *.r2.dev URLs are rewritten through the API media proxy — needed when
 * *.r2.dev does not resolve on the local network (common on WSL), and for
 * legacy rows still stored with the r2.dev public URL.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("/") || url.startsWith("blob:")) return url;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".r2.dev")) return url;

    const key = parsed.pathname.replace(/^\/+/, "");
    if (!key) return url;
    return `${API_BASE_URL}/media/${key}`;
  } catch {
    return url;
  }
}
