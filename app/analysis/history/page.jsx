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
    <div style={{ padding: 24 }}>
      <h1>Analysis History</h1>

      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: '#b91c1c' }}>Error: {error}</div>}

      {!isLoading && records.length === 0 && <div>No analysis records found.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 12, marginTop: 12 }}>
        {records.map((r) => (
          <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 96, height: 96, flex: '0 0 96px' }}>
                {r.imageUrl ? (
                  <Image
                    src={r.imageUrl}
                    alt="thumb"
                    width={96}
                    height={96}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                  />
                ) : (
                  <div style={{ background: '#f3f4f6', width: '100%', height: '100%', borderRadius: 6 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{r.prediction}</strong>
                  <span style={{ color: '#6b7280' }}>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <div>Confidence: <strong>{Math.round((r.confidence || 0) * 100)}%</strong></div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button onClick={() => setSelected(r)} style={{ padding: '6px 10px', borderRadius: 6 }}>View</button>
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
