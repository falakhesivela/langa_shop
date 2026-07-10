import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "@/lib/config";

let placesPromise: Promise<google.maps.PlacesLibrary> | null = null;
let optionsSet = false;

export function isPlacesEnabled(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

export function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (!optionsSet) {
    setOptions({
      key: GOOGLE_MAPS_API_KEY,
      v: "weekly",
      libraries: ["places"],
      // Bias results toward South Africa.
      region: "ZA",
      language: "en",
    });
    optionsSet = true;
  }

  if (!placesPromise) {
    placesPromise = importLibrary("places");
  }

  return placesPromise;
}
