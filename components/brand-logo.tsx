import Image from "next/image"
import { APP_NAME } from "@/lib/config"

/**
 * House of Noluhle logo. Uses a native <picture> so the browser swaps to the
 * cream "reverse" mark on dark backgrounds and falls back to the charcoal
 * "primary" mark otherwise — tracking `prefers-color-scheme`, which is how this
 * theme's dark mode is driven (see globals.css).
 *
 * `variant="wordmark"` is the full stacked logo; `variant="monogram"` is the
 * compact square N mark (better for tight spaces like the mobile header).
 */
const VARIANTS = {
  wordmark: {
    light: "/logo-primary.svg",
    dark: "/logo-reverse.svg",
    width: 200,
    height: 110,
  },
  monogram: {
    light: "/monogram-primary.svg",
    dark: "/monogram-reverse.svg",
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
  const { light, dark, width, height } = VARIANTS[variant]
  const size = className ?? "h-12 w-auto"
  return (
    <picture>
      <source srcSet={dark} media="(prefers-color-scheme: dark)" />
      <Image
        src={light}
        alt={APP_NAME}
        width={width}
        height={height}
        className={size}
      />
    </picture>
  )
}
