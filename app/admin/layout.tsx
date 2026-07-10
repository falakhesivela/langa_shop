import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminShell } from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </AdminGuard>
  );
}
