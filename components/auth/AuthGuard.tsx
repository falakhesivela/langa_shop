"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Alert } from "@/components/ui/Alert";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

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
