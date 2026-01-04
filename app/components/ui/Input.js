export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-md border border-(--ui-border) bg-(--color-background) px-3 text-sm text-(--color-text) placeholder:text-(--ui-muted-foreground) placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-(--ui-ring) ${className}`}
      {...props}
    />
  );
}
