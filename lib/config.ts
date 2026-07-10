export const APP_NAME = "NewFit";

export const DEFAULT_CURRENCY = "ZAR";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Client-side Google Maps / Places key. Leave empty to disable address autocomplete. */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
