"use client"

import { useEffect, useState } from "react"

type Remaining = { days: number; hours: number; minutes: number; seconds: number }

function getRemaining(endsAt: string): Remaining | null {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) return null
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

const pad = (n: number) => String(n).padStart(2, "0")

export function PromoCountdown({
  endsAt,
  variant = "boxes",
}: {
  endsAt: string
  /** "boxes" renders large tiles for banners, "chip" a compact inline pill. */
  variant?: "boxes" | "chip"
}) {
  // Start empty and only tick after mount so the server and first client
  // render agree — the clock delta would otherwise cause hydration mismatches.
  const [remaining, setRemaining] = useState<Remaining | null>(null)

  useEffect(() => {
    setRemaining(getRemaining(endsAt))
    const id = window.setInterval(() => {
      setRemaining(getRemaining(endsAt))
    }, 1_000)
    return () => window.clearInterval(id)
  }, [endsAt])

  if (!remaining) return null

  if (variant === "chip") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white backdrop-blur">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
        </span>
        Ends in {remaining.days > 0 ? `${remaining.days}d ` : ""}
        {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
      </span>
    )
  }

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ]

  return (
    <div className="flex gap-3" role="timer" aria-label="Offer ends in">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex w-16 flex-col items-center rounded-sm border border-background/20 bg-background/10 py-2.5 backdrop-blur-sm sm:w-18"
        >
          <span className="font-serif text-2xl tabular-nums sm:text-3xl">
            {pad(unit.value)}
          </span>
          <span className="text-[10px] uppercase tracking-widest opacity-70">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
