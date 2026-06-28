"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-stone-200 bg-white">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-stone-900"
                    : "text-stone-500 hover:text-stone-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-sm text-stone-500">Loading...</span>
          ) : user ? (
            <>
              <Link
                href="/account"
                className="text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                {user.full_name ?? user.email}
              </Link>
              <Button variant="ghost" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost">
                Sign in
              </Button>
              <Button href="/register">Register</Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
