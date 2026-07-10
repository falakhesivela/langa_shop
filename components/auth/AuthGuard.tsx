"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getLoginHref } from "@/lib/auth/routes";
import { Alert } from "@/components/ui/Alert";

type AuthGuardProps = {
  children: React.ReactNode;
};

function AuthGuardContent({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const query = searchParams.toString();
      const returnTo = query ? `${pathname}?${query}` : pathname;
      router.replace(getLoginHref(returnTo));
    }
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Restoring your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="info" className="mx-auto max-w-md">
        Redirecting to sign in...
      </Alert>
    );
  }

  return children;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted-foreground">
          Restoring your session...
        </div>
      }
    >
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
