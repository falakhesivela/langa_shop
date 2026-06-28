import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">New product</h1>
      <p className="mt-2 text-muted-foreground">
        Upload images to Cloudflare R2 and publish to the shop.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
