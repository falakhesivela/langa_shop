"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createDiscount,
  deleteDiscount,
  listDiscounts,
  updateDiscount,
} from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { formatPrice } from "@/lib/products";
import type { DiscountCode, DiscountCodeInput } from "@/lib/types/admin";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

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
  code: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  value: "",
  min_subtotal: "",
  max_uses: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

function describeValue(discount: DiscountCode): string {
  return discount.discount_type === "percent"
    ? `${discount.value}% off`
    : `${formatPrice(discount.value / 100)} off`;
}

export function DiscountManager() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadDiscounts() {
    const data = await listDiscounts();
    setDiscounts(data);
  }

  useEffect(() => {
    let cancelled = false;
    listDiscounts()
      .then((data) => {
        if (!cancelled) setDiscounts(data);
      })
      .catch(() => {
        if (!cancelled) setDiscounts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(discount: DiscountCode) {
    setEditingId(discount.id);
    setForm({
      code: discount.code,
      description: discount.description ?? "",
      discount_type: discount.discount_type,
      value:
        discount.discount_type === "fixed"
          ? (discount.value / 100).toString()
          : discount.value.toString(),
      min_subtotal: discount.min_subtotal_cents
        ? (discount.min_subtotal_cents / 100).toString()
        : "",
      max_uses: discount.max_uses?.toString() ?? "",
      starts_at: toDatetimeLocal(discount.starts_at),
      ends_at: toDatetimeLocal(discount.ends_at),
      is_active: discount.is_active,
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

    const rawValue = Number(form.value);
    const payload: DiscountCodeInput = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      value:
        form.discount_type === "fixed"
          ? Math.round(rawValue * 100)
          : Math.round(rawValue),
      min_subtotal_cents: form.min_subtotal
        ? Math.round(Number(form.min_subtotal) * 100)
        : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      starts_at: fromDatetimeLocal(form.starts_at),
      ends_at: fromDatetimeLocal(form.ends_at),
      is_active: form.is_active,
    };

    try {
      if (editingId != null) {
        await updateDiscount(editingId, payload);
        toast("Discount code updated.");
      } else {
        await createDiscount(payload);
        toast("Discount code created.");
      }
      resetForm();
      await loadDiscounts();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save discount code."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(discount: DiscountCode) {
    if (
      !window.confirm(
        `Delete code ${discount.code}? Shoppers will no longer be able to use it.`,
      )
    )
      return;
    setError(null);
    try {
      await deleteDiscount(discount.id);
      toast("Discount code deleted.");
      if (editingId === discount.id) resetForm();
      await loadDiscounts();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete discount code."));
    }
  }

  async function toggleActive(discount: DiscountCode) {
    setError(null);
    try {
      const updated = await updateDiscount(discount.id, {
        is_active: !discount.is_active,
      });
      toast(
        updated.is_active
          ? `${updated.code} is now active.`
          : `${updated.code} deactivated.`,
      );
      await loadDiscounts();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update discount code."));
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
            {editingId != null ? "Edit discount code" : "Add discount code"}
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
            <Label htmlFor="discount-code">Code</Label>
            <Input
              id="discount-code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="WELCOME10"
              required
            />
            <p className="text-xs text-muted-foreground">
              Letters, numbers, hyphens, underscores. Shoppers enter this at
              checkout.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-description">Description (internal)</Label>
            <Input
              id="discount-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="10% off first order"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-type">Type</Label>
            <select
              id="discount-type"
              value={form.discount_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount_type: e.target.value as "percent" | "fixed",
                })
              }
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            >
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off (ZAR)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {form.discount_type === "percent" ? "Percent (1–100)" : "Amount (ZAR)"}
            </Label>
            <Input
              id="discount-value"
              type="number"
              min={form.discount_type === "percent" ? "1" : "0.01"}
              max={form.discount_type === "percent" ? "100" : undefined}
              step={form.discount_type === "percent" ? "1" : "0.01"}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-min">Minimum spend (ZAR)</Label>
            <Input
              id="discount-min"
              type="number"
              min="0"
              step="0.01"
              value={form.min_subtotal}
              onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })}
              placeholder="No minimum"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-max-uses">Usage limit</Label>
            <Input
              id="discount-max-uses"
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="Unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Counts successful payments only.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-starts">Starts at</Label>
            <Input
              id="discount-starts"
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-ends">Ends at</Label>
            <Input
              id="discount-ends"
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : editingId != null
              ? "Update code"
              : "Create code"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-serif text-2xl">All discount codes</h2>
        {discounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No discount codes yet. Create your first one above — shoppers apply
            it in the order summary at checkout.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-sm border border-border">
            {discounts.map((discount) => (
              <li
                key={discount.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono font-medium">{discount.code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {describeValue(discount)}
                    {discount.min_subtotal_cents > 0
                      ? ` · min spend ${formatPrice(discount.min_subtotal_cents / 100)}`
                      : ""}
                    {" · "}
                    {discount.times_used}
                    {discount.max_uses != null ? `/${discount.max_uses}` : ""} used
                    {discount.is_active ? " · active" : " · inactive"}
                  </p>
                  {discount.description ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {discount.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void toggleActive(discount)}
                  >
                    {discount.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => startEdit(discount)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleDelete(discount)}
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
