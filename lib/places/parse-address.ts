export type ParsedPlaceAddress = {
  address1: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
};

type AddressComponentLike = {
  types: string[];
  longText?: string | null;
  shortText?: string | null;
};

function getComponent(
  components: AddressComponentLike[],
  type: string,
  useShort = false,
): string {
  const match = components.find((c) => c.types.includes(type));
  if (!match) return "";
  const text = useShort ? match.shortText : match.longText;
  return text ?? "";
}

/**
 * Map Places API (New) addressComponents into our ShippingAddress fields.
 * Tuned for South African addresses (ZA).
 */
export function parsePlaceAddressComponents(
  components: AddressComponentLike[],
  fallbackStreet = "",
): ParsedPlaceAddress {
  const streetNumber = getComponent(components, "street_number");
  const route = getComponent(components, "route");
  const streetAddress = getComponent(components, "street_address");
  const address1 =
    streetAddress ||
    [streetNumber, route].filter(Boolean).join(" ").trim() ||
    fallbackStreet;

  const suburb =
    getComponent(components, "sublocality_level_1") ||
    getComponent(components, "sublocality") ||
    getComponent(components, "neighborhood") ||
    getComponent(components, "sublocality_level_2");

  const city =
    getComponent(components, "locality") ||
    getComponent(components, "postal_town") ||
    getComponent(components, "administrative_area_level_2");

  const province = getComponent(components, "administrative_area_level_1");
  const postal_code = getComponent(components, "postal_code");

  return { address1, suburb, city, province, postal_code };
}
