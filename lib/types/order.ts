export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  // Payment succeeded but stock sold out first; the charge was refunded.
  | "refunded";

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  size: string;
  color: string | null;
};

export type Order = {
  id: number;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  paystack_reference: string | null;
  shipping_address: Record<string, unknown> | null;
  discount_code: string | null;
  discount_cents: number;
  shipping_cents: number;
  shipping_service_code: string | null;
  shipping_service_name: string | null;
  shipping_provider: string | null;
  tracking_reference: string | null;
  tracking_url: string | null;
  shipment_status: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type AdminOrder = Order & {
  user_id: number;
  user_email: string;
};

export type AdminOrderList = {
  items: AdminOrder[];
  total: number;
};

export type GuestCartItemInput = {
  product_id: number;
  size: string;
  color?: string;
  quantity: number;
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

export type ReturnStatus = "requested" | "approved" | "declined" | "completed";

export type ReturnRequest = {
  id: number;
  order_id: number;
  status: ReturnStatus;
  reason: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminReturnRequest = ReturnRequest & {
  user_email: string;
  order_total_cents: number;
  currency: string;
};

export type AdminReturnList = {
  items: AdminReturnRequest[];
  total: number;
};
