"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  ShoppingBag,
  Store,
  Tags,
  Users,
  X,
} from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils/cn";

const navSections = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catalog",
    links: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/users", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Marketing",
    links: [{ href: "/admin/promotions", label: "Promotions", icon: Megaphone }],
  },
];

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
      {navSections.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-xs uppercase tracking-widest text-muted-foreground">
            {section.title}
          </p>
          <ul className="mt-2 space-y-1">
            {section.links.map((link) => {
              const active = isActiveLink(pathname, link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const sidebarFooter = (
    <div className="border-t border-border px-3 py-4">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Store className="size-4 shrink-0" aria-hidden />
        View shop
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm">{user?.full_name ?? "Admin"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          aria-label="Log out"
          title="Log out"
          className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-6 py-5">
          <Link href="/admin" className="font-serif text-lg tracking-[0.2em]">
            {APP_NAME.toUpperCase()}
          </Link>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
        </div>
        <NavLinks pathname={pathname} />
        {sidebarFooter}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-serif text-lg tracking-[0.2em]">
          {APP_NAME.toUpperCase()} <span className="text-sm">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </button>
      </header>

      {/* Mobile slide-over menu */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <Link href="/admin" className="font-serif text-lg tracking-[0.2em]">
                {APP_NAME.toUpperCase()}
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setIsMenuOpen(false)}
            />
            {sidebarFooter}
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 px-5 py-8 lg:ml-60 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
