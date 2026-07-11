export const APP_NAME = "NewFit";

export const DEFAULT_CURRENCY = "ZAR";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Canonical public URL of the storefront — used for metadata, OG tags,
 * JSON-LD, and the sitemap. Override with NEXT_PUBLIC_SITE_URL per environment. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://langa-shop.vercel.app";

/** Client-side Google Maps / Places key. Leave empty to disable address autocomplete. */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
