import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/lib/types/order";

const statusStyles: Record<OrderStatus, string> = {
  pending: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  paid: "border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "border-violet-600/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  delivered:
    "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "border-border bg-muted text-muted-foreground",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status] ?? statusStyles.cancelled,
        className,
      )}
    >
      {status}
    </span>
  );
}
