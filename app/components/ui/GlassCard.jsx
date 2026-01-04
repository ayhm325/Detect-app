// GlassCard: glassmorphism card with optional neon badge.
export default function GlassCard({ title, children, neonBadge }) {
  return (
    <section
      className="relative rounded-xl card-glass p-6"
      role={title ? "region" : undefined}
      aria-label={title || undefined}
    >
      {neonBadge && (
        <span className="absolute -top-3 -left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md btn-gradient">
          {neonBadge}
        </span>
      )}
      {title && <h3 className="text-xl font-bold text-(--ui-foreground) mb-3">{title}</h3>}
      <div className="text-(--ui-muted-foreground)">{children}</div>
    </section>
  );
}
