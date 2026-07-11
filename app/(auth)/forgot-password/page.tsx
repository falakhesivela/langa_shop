import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-serif text-3xl">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
