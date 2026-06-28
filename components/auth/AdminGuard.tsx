"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Alert } from "@/components/ui/Alert";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isLoading && user && !user.is_admin) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <Alert variant="info" className="mx-auto max-w-md">
        Redirecting...
      </Alert>
    );
  }

  return children;
}
