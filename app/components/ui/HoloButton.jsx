// HoloButton: button with holographic gradient, focus ring, hover/active states.
export default function HoloButton({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-transform duration-150';
  const motion = 'hover:scale-102 active:scale-98';
  const primary = 'btn-gradient text-white shadow-md';
  const ghost = 'bg-transparent text-(--ui-foreground) hover:bg-(--ui-surface-2)/60';
  const outline = 'bg-transparent border border-(--ui-border) text-(--ui-foreground) hover:bg-(--ui-surface-2)/60';

  const variantClass = variant === 'primary' ? primary : variant === 'ghost' ? ghost : outline;
  return (
    <button {...props} className={`${base} ${motion} ${variantClass} ${className}`}>
      {children}
    </button>
  );
}
