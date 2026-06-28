export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  size: string;
};

export type Order = {
  id: number;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  paystack_reference: string | null;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type AdminOrder = Order & {
  user_id: number;
  user_email: string;
};

export type CheckoutResponse = {
  order_id: number;
  authorization_url: string;
  reference: string;
};

export type OrderVerifyResponse = {
  order: Order;
  payment_status: string;
};
