"use client"

import { FormEvent, useState } from "react"
import { subscribeToNewsletter } from "@/lib/api/newsletter"
import { getErrorMessage } from "@/lib/api/errors"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">(
    "idle",
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("busy")
    setError(null)
    try {
      await subscribeToNewsletter(email.trim())
      setStatus("done")
    } catch (err) {
      setStatus("error")
      setError(getErrorMessage(err, "Unable to subscribe right now."))
    }
  }

  if (status === "done") {
    return (
      <p className="mt-6 text-sm">
        You&apos;re on the list — watch your inbox for new drops.
      </p>
    )
  }

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <label
        htmlFor="newsletter"
        className="text-sm uppercase tracking-wide text-muted-foreground"
      >
        Join the list — 10% off your first order
      </label>
      <div className="mt-3 flex items-center border-b border-foreground/30 pb-2">
        <input
          id="newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={status === "busy"}
          className="shrink-0 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline disabled:opacity-50"
        >
          {status === "busy" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
    </form>
  )
}
