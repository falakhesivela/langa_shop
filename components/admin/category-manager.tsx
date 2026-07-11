"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  uploadFileToR2,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { resolveMediaUrl } from "@/lib/media";
import { slugify } from "@/lib/types/admin";
import type { Category } from "@/lib/types/product";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  sort_order: "0",
};

export function CategoryManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadCategories() {
    const data = await listCategories();
    setCategories(data);
  }

  useEffect(() => {
    let cancelled = false;
    listCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image_url: category.image_url ?? "",
      sort_order: String(category.sort_order ?? 0),
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleImageSelect(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadFileToR2(file);
      setForm((current) => ({ ...current, image_url: url }));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to upload image."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      if (editingId != null) {
        await updateCategory(editingId, payload);
        toast("Category updated.");
      } else {
        await createCategory(payload);
        toast("Category created.");
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingId != null
            ? "Unable to update category."
            : "Unable to create category.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    if (
      !window.confirm(
        `Delete "${category.name}"? Its products stay but lose the category.`,
      )
    )
      return;
    setError(null);
    try {
      await deleteCategory(category.id);
      toast("Category deleted.");
      if (editingId === category.id) resetForm();
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete category."));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-sm border border-border p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">
            {editingId != null ? "Edit category" : "Add category"}
          </h2>
          {editingId != null ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                  slug:
                    editingId == null
                      ? slugify(e.target.value)
                      : current.slug,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="category-description">Description</Label>
            <textarea
              id="category-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              maxLength={500}
              placeholder="Optional — shown on the storefront category tile"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-sort">Sort order</Label>
            <Input
              id="category-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in menus and on the home page.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-image">Image</Label>
            <div className="flex items-center gap-3">
              {form.image_url ? (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  <Image
                    src={resolveMediaUrl(form.image_url)}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                id="category-image"
                type="file"
                accept="image/*"
                onChange={(e) => void handleImageSelect(e.target.files?.[0])}
                className="text-sm file:mr-3 file:rounded-sm file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm"
              />
              {form.image_url ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {isUploading ? (
              <p className="text-xs text-muted-foreground">Uploading…</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Optional — used for the home page category tile.
              </p>
            )}
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} disabled={isUploading}>
          {editingId != null ? "Update category" : "Create category"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl">Existing categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                    {category.image_url ? (
                      <Image
                        src={resolveMediaUrl(category.image_url)}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {category.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {category.slug} · sort {category.sort_order}
                      </span>
                    </p>
                    {category.description ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => startEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleDelete(category)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
