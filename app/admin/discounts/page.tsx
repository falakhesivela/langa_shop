import { DiscountManager } from "@/components/admin/discount-manager";

export default function AdminDiscountsPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Discount codes</h1>
      <p className="mt-2 text-muted-foreground">
        Create promo codes shoppers can apply at checkout. Discounts come off
        the merchandise subtotal, never shipping.
      </p>
      <div className="mt-8">
        <DiscountManager />
      </div>
    </div>
  );
}
