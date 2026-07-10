import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { APP_NAME } from "@/lib/config"

const columns = [
  {
    title: "Shop",
    links: ["Outerwear", "Knitwear", "Shirts", "Trousers", "Dresses", "Accessories"],
  },
  {
    title: "Service",
    links: ["Contact", "Shipping & Returns", "Size Guide", "Care", "FAQ"],
  },
  {
    title: "About",
    links: ["Our Story", "Size Guide", "Shipping", "Contact", "FAQ"],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary text-secondary-foreground sm:mt-24">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <BrandLogo className="h-20 w-auto sm:h-28 lg:h-32" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Trendy women's fashion for every mood — cute, bold, and always new.
            </p>
            <form className="mt-6">
              <label htmlFor="newsletter" className="text-sm uppercase tracking-wide text-muted-foreground">
                Join the list — 10% off your first order
              </label>
              <div className="mt-3 flex items-center border-b border-foreground/30 pb-2">
                <input
                  id="newsletter"
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="shrink-0 text-sm font-medium uppercase tracking-wide text-accent underline-offset-4 hover:underline"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:contents">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground">{col.title}</h3>
                <ul className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="/products" className="text-sm transition-colors hover:text-accent">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-14 sm:flex-row sm:items-center sm:gap-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/products" className="hover:text-foreground">Privacy</Link>
            <Link href="/products" className="hover:text-foreground">Terms</Link>
            <Link href="/products" className="hover:text-foreground">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
