type ColorSwatchProps = {
  color: string;
  selected?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
};

export function ColorSwatch({
  color,
  selected = false,
  size = "md",
  onClick,
  label,
  disabled = false,
}: ColorSwatchProps) {
  const dimension = size === "sm" ? "size-4" : "size-8";
  const className = `${dimension} rounded-full border transition-[box-shadow,transform] ${
    selected
      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
      : "border-border hover:scale-105"
  } ${disabled ? "cursor-not-allowed opacity-40 hover:scale-100" : ""}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label ?? `Select color ${color}`}
        aria-pressed={selected}
        className={className}
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-block ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
