"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth/context";
import { changePassword, updateProfile } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";

function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.full_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await updateProfile(name.trim());
      await refreshUser();
      toast("Profile updated.");
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Name
          </p>
          <p className="mt-1 text-sm">{user?.full_name ?? "Not set"}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setName(user?.full_name ?? "");
            setIsEditing(true);
          }}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 py-4">
      {error ? <Alert>{error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="full-name">Name</Label>
        <Input
          id="full-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving}>
          Save
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordSection() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(current, next);
      toast("Password changed. Other devices have been signed out.");
      setIsOpen(false);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to change your password."));
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Password
          </p>
          <p className="mt-1 text-sm">••••••••</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-sm font-medium underline-offset-4 hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 py-4">
      {error ? <Alert>{error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSaving}>
          Change password
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AccountContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-serif text-4xl md:text-5xl">Account</h1>
      <p className="mt-3 text-muted-foreground">
        Manage your profile and view account details.
      </p>

      <div className="mt-10 divide-y divide-border border-t border-border">
        <ProfileSection />
        <div className="grid gap-1 py-4">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Email
          </p>
          <p className="mt-1 text-sm">{user.email}</p>
        </div>
        <ChangePasswordSection />
        <div className="grid gap-1 py-4">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Member since
          </p>
          <p className="mt-1 text-sm">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {user.is_admin ? (
        <Link
          href="/admin"
          className="mt-6 inline-flex text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline"
        >
          Open admin dashboard
        </Link>
      ) : null}

      <Link
        href="/account/orders"
        className="mt-6 block text-sm font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        View order history
      </Link>

      <button
        onClick={() => void logout()}
        className="mt-8 text-sm font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Sign out
      </button>
    </main>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
