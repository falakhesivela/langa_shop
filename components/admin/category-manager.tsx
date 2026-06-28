"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { slugify } from "@/lib/types/admin";
import type { Category } from "@/lib/types/product";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCategories() {
    const data = await listCategories();
    setCategories(data);
  }

  useEffect(() => {
    void loadCategories().catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createCategory({ name, slug });
      setName("");
      setSlug("");
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to create category."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(category: Category) {
    setError(null);
    try {
      await updateCategory(category.id, {
        name: category.name,
        slug: category.slug,
      });
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update category."));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this category?")) return;
    setError(null);
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete category."));
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4 rounded-sm border border-border p-5">
        <h2 className="font-serif text-2xl">Add category</h2>
        {error ? <Alert>{error}</Alert> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          Create category
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="font-serif text-2xl">Existing categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="grid gap-3 rounded-sm border border-border p-4 md:grid-cols-[1fr_1fr_auto_auto]"
              >
                <Input
                  value={category.name}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((item) =>
                        item.id === category.id
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <Input
                  value={category.slug}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((item) =>
                        item.id === category.id
                          ? { ...item, slug: e.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleUpdate(category)}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void handleDelete(category.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
