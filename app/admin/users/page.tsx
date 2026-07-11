"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAdminUsers, updateAdminUser } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/context";
import type { User } from "@/lib/types/auth";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(q) ||
        (user.full_name ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  useEffect(() => {
    let cancelled = false;
    listAdminUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, "Unable to load users."));
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(
    user: User,
    field: "is_admin" | "is_active",
  ) {
    setError(null);
    setSavingId(user.id);
    try {
      const updated = await updateAdminUser(user.id, {
        [field]: !user[field],
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast(
        field === "is_admin"
          ? `${updated.email} is ${updated.is_admin ? "now an admin" : "no longer an admin"}.`
          : `${updated.email} is ${updated.is_active ? "active" : "disabled"}.`,
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update user."));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div>
        <h1 className="font-serif text-4xl">Customers</h1>
        <p className="mt-2 text-muted-foreground">
          Manage customer accounts and admin access.
        </p>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}

      <div className="mt-6">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="sm:max-w-sm"
          aria-label="Search customers"
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 font-medium">Admin</th>
              <th className="px-3 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-muted-foreground">
                  {users.length === 0
                    ? "No customers yet."
                    : "No customers match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isSaving = savingId === user.id;
                return (
                  <tr key={user.id} className="border-b border-border">
                    <td className="px-3 py-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {user.email}
                      </Link>
                      {isSelf ? (
                        <div className="text-muted-foreground">You</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-4">{user.full_name ?? "—"}</td>
                    <td className="px-3 py-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.is_admin}
                          disabled={isSelf || isSaving}
                          onChange={() => void handleToggle(user, "is_admin")}
                        />
                        <span className="text-muted-foreground">
                          {user.is_admin ? "Admin" : "Customer"}
                        </span>
                      </label>
                    </td>
                    <td className="px-3 py-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={user.is_active}
                          disabled={isSelf || isSaving}
                          onChange={() => void handleToggle(user, "is_active")}
                        />
                        <span className="text-muted-foreground">
                          {user.is_active ? "Active" : "Disabled"}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
