import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-md px-5 py-12">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-medium tracking-[0.2em]"
          >
            {APP_NAME.toUpperCase()}
          </Link>
        </div>

        <div className="rounded-sm border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
