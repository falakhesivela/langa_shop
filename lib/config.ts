export const APP_NAME = "NewFit";

export const DEFAULT_CURRENCY = "ZAR";

/** Customer-facing support address shown on the contact and policy pages. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@newfit.co.za";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Canonical public URL of the storefront — used for metadata, OG tags,
 * JSON-LD, and the sitemap. Override with NEXT_PUBLIC_SITE_URL per environment. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://langa-shop.vercel.app";

/** Client-side Google Maps / Places key. Leave empty to disable address autocomplete. */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/** OAuth client ID used by the admin Google Drive image picker.
 * Leave either Drive value empty to hide the Drive option. */
export const GOOGLE_DRIVE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID ?? "";

/** API key for the Google Picker API. Distinct from the Maps key because each
 * key is restricted to its own API. */
export const GOOGLE_DRIVE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY ?? "";
