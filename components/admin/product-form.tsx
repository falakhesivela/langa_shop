"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  listCategories,
  updateProduct,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import type { AdminProduct, ProductImageInput } from "@/lib/types/admin";
import { slugify } from "@/lib/types/admin";
import { DEFAULT_CURRENCY } from "@/lib/config";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ColorPicker } from "@/components/admin/color-picker";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import type { Category } from "@/lib/types/product";
import { buildVariantCombos } from "@/lib/stock";
import { ColorSwatch } from "@/components/color-swatch";

type ProductFormProps = {
  product?: AdminProduct;
};

const badgeOptions = ["", "New", "Bestseller", "Limited"];

function parseSizes(value: string): string[] {
  return value
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = Boolean(product);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? (product.price_cents / 100).toString() : "",
  );
  const [salePrice, setSalePrice] = useState(
    product?.sale_price_cents != null
      ? (product.sale_price_cents / 100).toString()
      : "",
  );
  const [stock, setStock] = useState(product?.stock.toString() ?? "0");
  const [variantStock, setVariantStock] = useState<Record<string, string>>(
    () => {
      const existing = product?.variant_stock ?? {};
      const mapped: Record<string, string> = {};
      for (const [key, qty] of Object.entries(existing)) {
        mapped[key] = String(qty);
      }
      return mapped;
    },
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [categoryId, setCategoryId] = useState(
    product?.category_id?.toString() ?? "",
  );
  const [colors, setColors] = useState<string[]>(product?.colors ?? []);
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [materials, setMaterials] = useState(product?.materials ?? "");
  const [details, setDetails] = useState(product?.details.join("\n") ?? "");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "One Size");
  const [weightGrams, setWeightGrams] = useState(
    product?.weight_grams?.toString() ?? "",
  );
  const [lengthCm, setLengthCm] = useState(product?.length_cm?.toString() ?? "");
  const [widthCm, setWidthCm] = useState(product?.width_cm?.toString() ?? "");
  const [heightCm, setHeightCm] = useState(product?.height_cm?.toString() ?? "");
  const [images, setImages] = useState<ProductImageInput[]>(
    product?.images.map((image) => ({
      url: image.url,
      alt_text: image.alt_text,
      sort_order: image.sort_order,
      is_primary: image.is_primary,
    })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeList = useMemo(() => parseSizes(sizes), [sizes]);
  const combos = useMemo(
    () => buildVariantCombos(sizeList, colors),
    [sizeList, colors],
  );
  const useVariantMatrix =
    sizeList.length > 1 || colors.length > 1 || combos.length > 1;

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setSlug(slugify(name));
    }
  }, [name, isEditing]);

  // Seed missing combo keys when sizes/colors change so the matrix stays complete.
  useEffect(() => {
    if (!useVariantMatrix) return;
    setVariantStock((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const combo of combos) {
        if (next[combo.key] === undefined) {
          next[combo.key] = "0";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [combos, useVariantMatrix]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const parsedSizes = parseSizes(sizes);
    let nextStock = Number(stock);
    let nextVariantStock: Record<string, number> = {};

    if (useVariantMatrix) {
      for (const combo of buildVariantCombos(parsedSizes, colors)) {
        nextVariantStock[combo.key] = Math.max(
          0,
          Math.floor(Number(variantStock[combo.key] ?? 0)),
        );
      }
      nextStock = Object.values(nextVariantStock).reduce((a, b) => a + b, 0);
    }

    const payload = {
      name,
      slug,
      description: description || null,
      price_cents: Math.round(Number(price) * 100),
      sale_price_cents: salePrice
        ? Math.round(Number(salePrice) * 100)
        : null,
      currency: product?.currency ?? DEFAULT_CURRENCY,
      stock: nextStock,
      variant_stock: nextVariantStock,
      is_active: isActive,
      category_id: categoryId ? Number(categoryId) : null,
      colors,
      badge: badge || null,
      materials: materials || null,
      details: details
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      sizes: parsedSizes,
      weight_grams: weightGrams ? Number(weightGrams) : null,
      length_cm: lengthCm ? Number(lengthCm) : null,
      width_cm: widthCm ? Number(widthCm) : null,
      height_cm: heightCm ? Number(heightCm) : null,
      images,
    };

    try {
      if (isEditing && product) {
        await updateProduct(product.id, payload);
        toast("Product updated.");
      } else {
        await createProduct(payload);
        toast("Product created.");
      }
      router.push("/admin/products");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save product."));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? <Alert>{error}</Alert> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (ZAR)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale-price">Sale price (ZAR)</Label>
          <Input
            id="sale-price"
            type="number"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Optional"
          />
          <p className="text-xs text-muted-foreground">
            Leave blank for no sale. Must be lower than the regular price.
          </p>
        </div>
        {!useVariantMatrix ? (
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge">Badge</Label>
          <select
            id="badge"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
          >
            {badgeOptions.map((option) => (
              <option key={option || "none"} value={option}>
                {option || "None"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <ColorPicker colors={colors} onChange={setColors} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="materials">Materials</Label>
          <Input
            id="materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sizes">Sizes (comma-separated)</Label>
          <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </div>
        {useVariantMatrix ? (
          <div className="space-y-3 md:col-span-2">
            <div>
              <Label>Variant stock</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Set quantity for each size
                {colors.length > 0 ? " and color" : ""} combination. Total:{" "}
                {combos.reduce(
                  (sum, combo) =>
                    sum + Math.max(0, Math.floor(Number(variantStock[combo.key] ?? 0))),
                  0,
                )}
              </p>
            </div>
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Size</th>
                    {colors.length > 0 ? (
                      <th className="px-3 py-2 font-medium">Color</th>
                    ) : null}
                    <th className="px-3 py-2 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {combos.map((combo) => (
                    <tr key={combo.key} className="border-b border-border/70">
                      <td className="px-3 py-2">{combo.size}</td>
                      {colors.length > 0 ? (
                        <td className="px-3 py-2">
                          {combo.color ? (
                            <span className="inline-flex items-center gap-2">
                              <ColorSwatch color={combo.color} size="sm" />
                              <span className="font-mono text-xs">{combo.color}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      ) : null}
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          className="h-9 w-24"
                          value={variantStock[combo.key] ?? "0"}
                          onChange={(e) =>
                            setVariantStock((prev) => ({
                              ...prev,
                              [combo.key]: e.target.value,
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="details">Details (one per line)</Label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-sm border border-border p-5">
        <div>
          <h3 className="font-serif text-lg">Shipping</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Used to calculate live Bob Go rates at checkout. Optional — a default
            parcel size is used when left blank.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="weight_grams">Weight (g)</Label>
            <Input
              id="weight_grams"
              type="number"
              min="0"
              value={weightGrams}
              onChange={(e) => setWeightGrams(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length_cm">Length (cm)</Label>
            <Input
              id="length_cm"
              type="number"
              min="0"
              value={lengthCm}
              onChange={(e) => setLengthCm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width_cm">Width (cm)</Label>
            <Input
              id="width_cm"
              type="number"
              min="0"
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height_cm">Height (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              min="0"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active on storefront
      </label>

      <ImageUploader images={images} onChange={setImages} altFallback={name} />

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="secondary" href="/admin/products">
          Cancel
        </Button>
      </div>
    </form>
  );
}
