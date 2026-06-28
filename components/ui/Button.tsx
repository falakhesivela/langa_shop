import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  href?: string;
};

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-accent disabled:opacity-50",
  secondary:
    "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "text-foreground/80 hover:bg-muted hover:text-foreground",
};

const baseStyles =
  "inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-medium uppercase tracking-widest transition-colors disabled:cursor-not-allowed";

export function Button({
  className,
  variant = "primary",
  isLoading = false,
  disabled,
  href,
  children,
  ...props
}: ButtonProps) {
  const styles = cn(baseStyles, variantStyles[variant], className);

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} disabled={disabled || isLoading} {...props}>
      {isLoading ? "Please wait..." : children}
    </button>
  );
}
