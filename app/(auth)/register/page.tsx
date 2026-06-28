import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-serif text-3xl">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join {APP_NAME} to save your details and track orders.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </>
  );
}
