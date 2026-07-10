import { API_BASE_URL } from "@/lib/config";

const R2_PUBLIC_BASE = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? ""
).replace(/\/$/, "");

function isR2DevHostname(hostname: string): boolean {
  return hostname.endsWith(".r2.dev");
}

/**
 * Resolve product/media image URLs for display.
 *
 * - Custom-domain URLs are returned as-is (CDN).
 * - Legacy *.r2.dev URLs are rewritten to the configured custom domain when
 *   NEXT_PUBLIC_R2_PUBLIC_BASE_URL is set to one (production).
 * - Otherwise *.r2.dev is proxied through the API (local/WSL when r2.dev DNS fails).
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("/") || url.startsWith("blob:")) return url;

  try {
    const parsed = new URL(url);
    if (!isR2DevHostname(parsed.hostname)) return url;

    const key = parsed.pathname.replace(/^\/+/, "");
    if (!key) return url;

    if (R2_PUBLIC_BASE) {
      try {
        if (!isR2DevHostname(new URL(R2_PUBLIC_BASE).hostname)) {
          return `${R2_PUBLIC_BASE}/${key}`;
        }
      } catch {
        // Fall through to API proxy.
      }
    }

    return `${API_BASE_URL}/media/${key}`;
  } catch {
    return url;
  }
}
