"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createPromotion,
  deletePromotion,
  listPromotions,
  updatePromotion,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { slugify } from "@/lib/types/admin";
import type { Promotion, PromotionPlacement } from "@/lib/types/product";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

const PLACEMENTS: { value: PromotionPlacement; label: string; hint: string }[] =
  [
    {
      value: "announcement",
      label: "Announcement bar",
      hint: "Thin bar above the header",
    },
    {
      value: "hero",
      label: "Hero campaign",
      hint: "Overrides landing hero copy (optional image)",
    },
    {
      value: "sale_collection",
      label: "Sale collection",
      hint: "Title/copy for the On sale landing section",
    },
  ];

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const emptyForm = {
  name: "",
  slug: "",
  placement: "announcement" as PromotionPlacement,
  title: "",
  subtitle: "",
  cta_label: "",
  cta_href: "/products",
  image_url: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
  sort_order: "0",
};

export function PromotionManager() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPromotions() {
    const data = await listPromotions();
    setPromotions(data);
  }

  useEffect(() => {
    let cancelled = false;
    listPromotions()
      .then((data) => {
        if (!cancelled) setPromotions(data);
      })
      .catch(() => {
        if (!cancelled) setPromotions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(promotion: Promotion) {
    setEditingId(promotion.id);
    setForm({
      name: promotion.name,
      slug: promotion.slug,
      placement: promotion.placement,
      title: promotion.title,
      subtitle: promotion.subtitle ?? "",
      cta_label: promotion.cta_label ?? "",
      cta_href: promotion.cta_href ?? "",
      image_url: promotion.image_url ?? "",
      starts_at: toDatetimeLocal(promotion.starts_at),
      ends_at: toDatetimeLocal(promotion.ends_at),
      is_active: promotion.is_active,
      sort_order: String(promotion.sort_order),
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      placement: form.placement,
      title: form.title,
      subtitle: form.subtitle || null,
      cta_label: form.cta_label || null,
      cta_href: form.cta_href || null,
      image_url: form.image_url || null,
      starts_at: fromDatetimeLocal(form.starts_at),
      ends_at: fromDatetimeLocal(form.ends_at),
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      if (editingId != null) {
        await updatePromotion(editingId, payload);
        toast("Promotion updated.");
      } else {
        await createPromotion(payload);
        toast("Promotion created.");
      }
      resetForm();
      await loadPromotions();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save promotion."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this promotion?")) return;
    setError(null);
    try {
      await deletePromotion(id);
      toast("Promotion deleted.");
      if (editingId === id) resetForm();
      await loadPromotions();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete promotion."));
    }
  }

  async function toggleActive(promotion: Promotion) {
    setError(null);
    try {
      await updatePromotion(promotion.id, { is_active: !promotion.is_active });
      await loadPromotions();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update promotion."));
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
            {editingId != null ? "Edit promotion" : "Add promotion"}
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
            <Label htmlFor="promo-name">Internal name</Label>
            <Input
              id="promo-name"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                  // Auto-slug while creating; leave the slug alone when editing.
                  slug:
                    editingId == null ? slugify(e.target.value) : current.slug,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-slug">Slug</Label>
            <Input
              id="promo-slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="promo-placement">Placement</Label>
            <select
              id="promo-placement"
              value={form.placement}
              onChange={(e) =>
                setForm({
                  ...form,
                  placement: e.target.value as PromotionPlacement,
                })
              }
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            >
              {PLACEMENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label} — {item.hint}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="promo-title">Title</Label>
            <Input
              id="promo-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="promo-subtitle">Subtitle</Label>
            <textarea
              id="promo-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              rows={2}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-cta-label">CTA label</Label>
            <Input
              id="promo-cta-label"
              value={form.cta_label}
              onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
              placeholder="Shop the sale"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-cta-href">CTA link</Label>
            <Input
              id="promo-cta-href"
              value={form.cta_href}
              onChange={(e) => setForm({ ...form, cta_href: e.target.value })}
              placeholder="/products?on_sale=true"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="promo-image">Image URL</Label>
            <Input
              id="promo-image"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Optional — used for hero campaigns"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-starts">Starts at</Label>
            <Input
              id="promo-starts"
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-ends">Ends at</Label>
            <Input
              id="promo-ends"
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-sort">Sort order</Label>
            <Input
              id="promo-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Active
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : editingId != null
              ? "Update promotion"
              : "Create promotion"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-serif text-2xl">All promotions</h2>
        {promotions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No promotions yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border">
            {promotions.map((promotion) => (
              <li
                key={promotion.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{promotion.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {promotion.name} · {promotion.placement}
                    {promotion.is_active ? " · active" : " · inactive"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void toggleActive(promotion)}
                  >
                    {promotion.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => startEdit(promotion)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleDelete(promotion.id)}
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
