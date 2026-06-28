import { cn } from "@/lib/utils/cn";

type AlertProps = {
  children: React.ReactNode;
  variant?: "error" | "info";
  className?: string;
};

const variantStyles = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-border bg-muted text-muted-foreground",
};

export function Alert({
  children,
  variant = "error",
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-sm border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
