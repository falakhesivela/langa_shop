export type User = {
  id: number;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  full_name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
