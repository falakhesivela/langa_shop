"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth/context";

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

      <dl className="mt-10 divide-y divide-border border-t border-border">
        <div className="grid gap-1 py-4 sm:grid-cols-3">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Name</dt>
          <dd className="text-sm sm:col-span-2">{user.full_name ?? "Not set"}</dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-3">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Email</dt>
          <dd className="text-sm sm:col-span-2">{user.email}</dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-3">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Role</dt>
          <dd className="text-sm sm:col-span-2">
            {user.is_admin ? "Admin" : "Customer"}
          </dd>
        </div>
        <div className="grid gap-1 py-4 sm:grid-cols-3">
          <dt className="text-sm uppercase tracking-wide text-muted-foreground">Member since</dt>
          <dd className="text-sm sm:col-span-2">
            {new Date(user.created_at).toLocaleDateString()}
          </dd>
        </div>
      </dl>

      {user.is_admin ? (
        <a
          href="/admin"
          className="mt-6 inline-flex text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline"
        >
          Open admin dashboard
        </a>
      ) : null}

      <a
        href="/account/orders"
        className="mt-6 block text-sm font-medium uppercase tracking-wide text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        View order history
      </a>

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
