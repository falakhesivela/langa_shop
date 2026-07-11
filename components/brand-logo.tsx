import Image from "next/image"
import { APP_NAME } from "@/lib/config"

/**
 * NewFit logo — the charcoal "primary" mark (the site is light-theme only).
 *
 * `variant="wordmark"` is the full stacked logo; `variant="monogram"` is the
 * compact square N mark (better for tight spaces like the mobile header).
 */
const VARIANTS = {
  wordmark: {
    src: "/logo-primary.svg",
    width: 200,
    height: 110,
  },
  monogram: {
    src: "/monogram-primary.svg",
    width: 120,
    height: 120,
  },
} as const

export function BrandLogo({
  className,
  variant = "wordmark",
}: {
  className?: string
  variant?: keyof typeof VARIANTS
}) {
  const { src, width, height } = VARIANTS[variant]
  const size = className ?? "h-12 w-auto"
  return (
    <Image
      src={src}
      alt={APP_NAME}
      width={width}
      height={height}
      className={size}
    />
  )
}
