import Link from "next/link"
import { listActivePromotions } from "@/lib/api/promotions"

export async function AnnouncementBar() {
  let promotion = null
  try {
    const promotions = await listActivePromotions("announcement")
    promotion = promotions[0] ?? null
  } catch {
    promotion = null
  }

  if (!promotion) return null

  const href = promotion.cta_href || "/products"
  const content = (
    <>
      <span className="font-medium">{promotion.title}</span>
      {promotion.subtitle ? (
        <span className="opacity-80"> — {promotion.subtitle}</span>
      ) : null}
      {promotion.cta_label ? (
        <span className="ml-2 underline underline-offset-4">
          {promotion.cta_label}
        </span>
      ) : null}
    </>
  )

  return (
    <div className="bg-foreground px-4 py-2.5 text-center text-sm text-background">
      {promotion.cta_href || promotion.cta_label ? (
        <Link href={href} className="transition-opacity hover:opacity-80">
          {content}
        </Link>
      ) : (
        <p>{content}</p>
      )}
    </div>
  )
}
