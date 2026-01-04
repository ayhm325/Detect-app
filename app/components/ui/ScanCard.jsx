"use client";

import { useTranslations } from "next-intl";

// ScanCard: example medical card with status badge and animated accent.
const statusStyleMap = {
  ready: { bg: 'bg-secondary-100', text: 'text-secondary-900' },
  pending: { bg: 'bg-bright-100', text: 'text-darkc-900' },
  error: { bg: 'bg-primary-100', text: 'text-primary-900' }
};

export default function ScanCard({ title, status = 'ready', description }) {
  const t = useTranslations("ui");
  const s = statusStyleMap[status] || statusStyleMap.ready;
  const labelKey = status === 'pending' ? 'status.pending' : status === 'error' ? 'status.error' : 'status.ready';
  return (
    <article className="rounded-xl border border-holo bg-glass backdrop-blur-glass p-5 shadow-holo holo-sheen">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-text">{title}</h4>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}>{t(labelKey)}</span>
      </div>
      {description && <p className="mt-2 text-sm text-text/80">{description}</p>}
      <div className="mt-4 h-1 w-24 rounded-full hologram-bg animate-gradient" />
    </article>
  );
}
