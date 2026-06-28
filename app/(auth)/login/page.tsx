import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="font-serif text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access your account and order history.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
