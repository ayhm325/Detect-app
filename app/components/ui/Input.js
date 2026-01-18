export default function Input({ className = "", ...props }) {
  const classes = [
    "h-10 w-full rounded-md border border-[var(--ui-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--ui-muted-foreground)] placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[var(--ui-ring)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}
