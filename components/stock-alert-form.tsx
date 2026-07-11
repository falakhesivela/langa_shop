"use client"

import { FormEvent, useState } from "react"
import { createStockAlert } from "@/lib/api/stock-alerts"
import { getErrorMessage } from "@/lib/api/errors"
import { useAuth } from "@/lib/auth/context"

/** "Notify me when it's back" capture shown when a product/variant is sold out. */
export function StockAlertForm({
  productId,
  size,
  color,
}: {
  productId: number
  size?: string
  color?: string
}) {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle")
  const [error, setError] = useState<string | null>(null)

  const effectiveEmail = (email || user?.email || "").trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!effectiveEmail) return
    setStatus("busy")
    setError(null)
    try {
      await createStockAlert(productId, effectiveEmail, size, color)
      setStatus("done")
    } catch (err) {
      setStatus("idle")
      setError(getErrorMessage(err, "Unable to set up the alert."))
    }
  }

  if (status === "done") {
    return (
      <p className="mt-4 rounded-sm border border-border bg-muted/40 px-4 py-3 text-sm">
        Done — we&apos;ll email {effectiveEmail} the moment it&apos;s back.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-sm border border-border p-4"
    >
      <p className="text-sm font-medium">
        Want it{size ? ` in ${size}` : ""}? Get notified when it&apos;s back.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          required={!user?.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={user?.email ?? "Email address"}
          aria-label="Email for back-in-stock alert"
          className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
        />
        <button
          type="submit"
          disabled={status === "busy"}
          className="shrink-0 rounded-sm bg-primary px-5 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {status === "busy" ? "..." : "Notify me"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
    </form>
  )
}
