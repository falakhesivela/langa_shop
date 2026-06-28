import { CategoryManager } from "@/components/admin/category-manager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Categories</h1>
      <p className="mt-2 text-muted-foreground">
        Manage category names and slugs used in the storefront.
      </p>
      <div className="mt-8">
        <CategoryManager />
      </div>
    </div>
  );
}
