import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="font-serif text-3xl">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick something at least 8 characters long.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading...</p>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </>
  );
}
