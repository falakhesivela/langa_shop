export type ShippingAddress = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address1: string;
  address2?: string | null;
  suburb?: string | null;
  city: string;
  province?: string | null;
  postal_code: string;
  country: string;
};

export type ShippingRate = {
  id: string;
  provider_slug: string;
  service_code: string;
  service_name: string;
  price_cents: number;
  description?: string | null;
  min_delivery_date?: string | null;
  max_delivery_date?: string | null;
};
