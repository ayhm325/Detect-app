export function Table({ children, className = "" }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full rounded-lg bg-[var(--color-background)] border border-[var(--ui-border)]">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="bg-[var(--ui-surface)]">{children}</thead>;
}

export function TRow({ children, className = "" }) {
  return <tr className={`border-t border-[var(--ui-border)] ${className}`}>{children}</tr>;
}

export function TH({ children, className = "" }) {
  return <th className={`py-3 px-4 text-[var(--color-text)] text-start font-bold ${className}`}>{children}</th>;
}

export function TD({ children, className = "" }) {
  return <td className={`py-2 px-4 text-start ${className}`}>{children}</td>;
}
