import { PromotionManager } from "@/components/admin/promotion-manager";

export default function AdminPromotionsPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Promotions</h1>
      <p className="mt-2 text-muted-foreground">
        Configure announcement bars, hero campaigns, and sale collection copy.
        Product sale prices are set on each product.
      </p>
      <div className="mt-8">
        <PromotionManager />
      </div>
    </div>
  );
}
