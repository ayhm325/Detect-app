import React from "react";

export default function DashboardCard({ icon, title, value, color }) {
  return (
    <div className={`card-glass rounded-2xl p-6 flex flex-col items-center border ${color || 'border-[var(--ui-border)]'}`}>
      <div className="mb-3 text-4xl">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-[var(--ui-muted)]">{title}</div>
    </div>
  );
}
