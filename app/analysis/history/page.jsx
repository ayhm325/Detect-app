"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AnalysisDetailsModal from '../../../components/analysis/AnalysisDetailsModal';
import AnalysisResultCard from '../../../components/analysis/AnalysisResultCard';

export default function AnalysisHistoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analysis/history', { method: 'GET', credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setRecords(body.data || []);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>

      {isLoading && <div className="mt-3 text-sm text-(--ui-muted-2)">Loading...</div>}
      {error && <div className="mt-3 text-sm text-(--ui-danger)">Error: {error}</div>}

      {!isLoading && records.length === 0 && (
        <div className="mt-3 text-sm text-(--ui-muted-2)">No analysis records found.</div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div key={r.id} className="card-glass rounded-lg border border-(--ui-border) p-3">
            <div className="flex gap-3">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-(--ui-border) bg-(--ui-surface)">
                {r.imageUrl ? (
                  <Image
                    src={r.imageUrl}
                    alt="thumb"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-(--ui-surface-2)" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <strong className="truncate text-foreground">{r.prediction}</strong>
                  <span className="shrink-0 text-xs text-(--ui-muted-2)">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-sm text-(--ui-muted-2)">
                  Confidence: <strong className="text-foreground">{Math.round((r.confidence || 0) * 100)}%</strong>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setSelected(r)}
                    className="btn-gradient rounded-md px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && <AnalysisDetailsModal record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
