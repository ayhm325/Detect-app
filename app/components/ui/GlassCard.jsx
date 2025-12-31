// GlassCard: glassmorphism card with optional neon badge.
export default function GlassCard({ title, children, neonBadge }) {
  return (
    <section className="relative rounded-xl card-glass p-6" role="region" aria-label={title || 'Glass card'}>
      {neonBadge && (
        <span className="absolute -top-3 -left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md" style={{ background: 'linear-gradient(90deg,#06b6d4,#8b5cf6)' }}>
          {neonBadge}
        </span>
      )}
      {title && <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>}
      <div className="text-gray-700">{children}</div>
    </section>
  );
}
