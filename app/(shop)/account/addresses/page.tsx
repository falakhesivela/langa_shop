"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/api/errors";
import type { UserAddress, UserAddressInput } from "@/lib/types/address";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

const emptyForm = {
  label: "",
  full_name: "",
  phone: "",
  address1: "",
  address2: "",
  suburb: "",
  city: "",
  province: "",
  postal_code: "",
};

type FormState = typeof emptyForm;

function toForm(address: UserAddress): FormState {
  return {
    label: address.label ?? "",
    full_name: address.full_name ?? "",
    phone: address.phone ?? "",
    address1: address.address1,
    address2: address.address2 ?? "",
    suburb: address.suburb ?? "",
    city: address.city,
    province: address.province ?? "",
    postal_code: address.postal_code,
  };
}

function toInput(form: FormState): UserAddressInput {
  return {
    label: form.label.trim() || null,
    full_name: form.full_name.trim() || null,
    phone: form.phone.trim() || null,
    address1: form.address1.trim(),
    address2: form.address2.trim() || null,
    suburb: form.suburb.trim() || null,
    city: form.city.trim(),
    province: form.province.trim() || null,
    postal_code: form.postal_code.trim(),
    country: "ZA",
  };
}

function formatAddressLines(address: UserAddress): string[] {
  return [
    [address.address1, address.address2].filter(Boolean).join(", "),
    [address.suburb, address.city].filter(Boolean).join(", "),
    [address.province, address.postal_code].filter(Boolean).join(" "),
  ].filter((line) => line.length > 0);
}

function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: FormState;
  submitLabel: string;
  onSubmit: (input: UserAddressInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const postalValid = /^\d{4}$/.test(form.postal_code.trim());
  const complete =
    form.address1.trim() && form.city.trim() && postalValid;

  function field(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSubmit(toInput(form));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save this address."));
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addr-label">Label (optional)</Label>
          <Input
            id="addr-label"
            value={form.label}
            onChange={(e) => field("label", e.target.value)}
            placeholder="e.g. Home, Work"
            maxLength={40}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-full-name">Full name</Label>
          <Input
            id="addr-full-name"
            value={form.full_name}
            onChange={(e) => field("full_name", e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-phone">Phone</Label>
          <Input
            id="addr-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => field("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-address1">Street address</Label>
          <Input
            id="addr-address1"
            value={form.address1}
            onChange={(e) => field("address1", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addr-address2">Apartment, suite, etc. (optional)</Label>
          <Input
            id="addr-address2"
            value={form.address2}
            onChange={(e) => field("address2", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-suburb">Suburb</Label>
          <Input
            id="addr-suburb"
            value={form.suburb}
            onChange={(e) => field("suburb", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-city">City</Label>
          <Input
            id="addr-city"
            value={form.city}
            onChange={(e) => field("city", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-province">Province</Label>
          <Input
            id="addr-province"
            value={form.province}
            onChange={(e) => field("province", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-postal">Postal code</Label>
          <Input
            id="addr-postal"
            inputMode="numeric"
            maxLength={4}
            placeholder="e.g. 8001"
            value={form.postal_code}
            onChange={(e) => field("postal_code", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving} disabled={!complete}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AccountAddressesContent() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAddresses()
      .then((data) => {
        if (!cancelled) setAddresses(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getErrorMessage(err, "Unable to load your addresses."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setAddresses(await listAddresses());
  }

  async function handleCreate(input: UserAddressInput) {
    await createAddress(input);
    await refresh();
    setIsAdding(false);
    toast("Address saved.");
  }

  async function handleUpdate(id: number, input: UserAddressInput) {
    await updateAddress(id, input);
    await refresh();
    setEditingId(null);
    toast("Address updated.");
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this address?")) return;
    setBusyId(id);
    try {
      await deleteAddress(id);
      await refresh();
      toast("Address deleted.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete this address."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: number) {
    setBusyId(id);
    try {
      await setDefaultAddress(id);
      await refresh();
      toast("Default address updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update the default address."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 lg:px-8 lg:py-16">
      <Link
        href="/account"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to account
      </Link>

      <h1 className="mt-6 font-serif text-4xl md:text-5xl">Addresses</h1>
      <p className="mt-3 text-muted-foreground">
        Save delivery addresses to speed through checkout. Your default is
        filled in automatically.
      </p>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-10 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading addresses...</p>
        ) : (
          <>
            {addresses.length === 0 && !isAdding ? (
              <p className="text-muted-foreground">
                You have no saved addresses yet.
              </p>
            ) : null}

            {addresses.map((address) =>
              editingId === address.id ? (
                <div
                  key={address.id}
                  className="rounded-sm border border-border p-5"
                >
                  <AddressForm
                    initial={toForm(address)}
                    submitLabel="Save changes"
                    onSubmit={(input) => handleUpdate(address.id, input)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <article
                  key={address.id}
                  className="rounded-sm border border-border p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-sm">
                      <p className="font-medium">
                        {address.label || address.full_name || "Address"}
                        {address.is_default ? (
                          <span className="ml-2 rounded-sm border border-border bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                            Default
                          </span>
                        ) : null}
                      </p>
                      {address.label && address.full_name ? (
                        <p className="mt-1 text-muted-foreground">
                          {address.full_name}
                        </p>
                      ) : null}
                      {formatAddressLines(address).map((line) => (
                        <p key={line} className="mt-1 text-muted-foreground">
                          {line}
                        </p>
                      ))}
                      {address.phone ? (
                        <p className="mt-1 text-muted-foreground">
                          {address.phone}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {!address.is_default ? (
                        <button
                          type="button"
                          onClick={() => void handleSetDefault(address.id)}
                          disabled={busyId === address.id}
                          className="font-medium underline-offset-4 hover:underline disabled:opacity-50"
                        >
                          Make default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setEditingId(address.id)}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(address.id)}
                        disabled={busyId === address.id}
                        className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}

            {isAdding ? (
              <div className="rounded-sm border border-border p-5">
                <AddressForm
                  initial={emptyForm}
                  submitLabel="Save address"
                  onSubmit={handleCreate}
                  onCancel={() => setIsAdding(false)}
                />
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setIsAdding(true)}>
                Add address
              </Button>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function AccountAddressesPage() {
  return (
    <AuthGuard>
      <AccountAddressesContent />
    </AuthGuard>
  );
}
