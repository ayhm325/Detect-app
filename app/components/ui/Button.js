export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };
  const variants = {
    primary: "btn-gradient text-white focus:ring-[var(--color-primary-500)]",
    secondary:
      "bg-[var(--color-secondary-500)] text-[var(--ui-foreground)] hover:bg-[var(--color-secondary-900)] focus:ring-[var(--color-secondary-500)]",
    ghost:
      "bg-transparent text-[var(--ui-foreground)] hover:bg-[var(--ui-surface-2)]",
    outline:
      "border border-[var(--ui-border)] bg-transparent text-[var(--ui-foreground)] hover:bg-[var(--ui-surface-2)]",
  };

  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.primary;
  const extra = className ? ` ${className}` : "";

  return (
    <button
      className={`${base} ${sizeClass} ${variantClass}${extra}`}
      {...props}
    >
      {children}
    </button>
  );
}
