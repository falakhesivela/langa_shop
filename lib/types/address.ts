export type UserAddress = {
  id: number;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  address1: string;
  address2: string | null;
  suburb: string | null;
  city: string;
  province: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type UserAddressInput = {
  label?: string | null;
  full_name?: string | null;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  suburb?: string | null;
  city: string;
  province?: string | null;
  postal_code: string;
  country?: string;
  is_default?: boolean;
};
