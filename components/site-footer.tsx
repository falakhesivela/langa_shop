import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { NewsletterForm } from "@/components/newsletter-form"
import { APP_NAME } from "@/lib/config"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/products" },
      { label: "On Sale", href: "/products?on_sale=true" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Sign In", href: "/login" },
      { label: "Register", href: "/register" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary text-secondary-foreground sm:mt-24">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <BrandLogo className="h-20 w-auto sm:h-28 lg:h-32" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Trendy women&apos;s fashion for every mood — cute, bold, and always new.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:contents">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground">{col.title}</h3>
                <ul className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm transition-colors hover:text-accent">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-14">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-accent">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-accent">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
