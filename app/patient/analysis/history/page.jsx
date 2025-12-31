"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AnalysisDetailsModal from '../../../../components/analysis/AnalysisDetailsModal';
import { useLocale } from 'next-intl';

export default function PatientAnalysisHistoryPage() {
  const locale = useLocale();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/analysis/history', { method: 'GET', headers, credentials: 'same-origin' });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || body.message || `HTTP ${res.status}`);
        setRecords(body.data || []);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">{locale === 'en' ? 'Analysis History' : 'سجل التحاليل'}</h1>
          <p className="text-sm text-gray-500 mt-1">{locale === 'en' ? 'Previous AI analyses on your account' : 'عرض تحاليلك السابقة المحفوظة'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRecords([]); setError(null); setLoading(true); setTimeout(() => { setLoading(false); }, 600); }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
          >
            {/* refresh icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6"/></svg>
            <span className="text-sm text-gray-700">{locale === 'en' ? 'Refresh' : 'تحديث'}</span>
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-white rounded-xl shadow-sm">
                <div className="h-40 bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))
          : records.length === 0
          ? (
            <div className="col-span-full p-8 bg-white rounded-xl shadow-sm text-center">
              <p className="text-lg font-medium">{locale === 'en' ? 'No analyses yet' : 'لا توجد تحاليل بعد'}</p>
                <p className="text-sm text-gray-500 mt-2">{locale === 'en' ? 'Run an analysis from the main page to see results here.' : 'نفّذ تحليلًا من صفحة التحليل لتظهر النتائج هنا.'}</p>
            </div>
          )
          : records.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl shadow hover:shadow-md transition-shadow overflow-hidden">
                <div className="relative h-44 bg-gray-50">
                  <Image
                    src={item.imageUrl || item.image_url || '/icons/xray.svg'}
                    alt={item.prediction || 'analysis image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold truncate">{item.prediction || item.prediction_label || '—'}</h3>
                      <div className="text-xs text-gray-500 mt-1">{(() => {
                        try {
                          const d = new Date(item.createdAt || item.created_at);
                          return new Intl.DateTimeFormat(locale || 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
                        } catch (e) {
                          return item.createdAt || item.created_at || '';
                        }
                      })()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500">{locale === 'en' ? 'Confidence' : 'الثقة'}</div>
                      <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">{(Number(item.confidence || 0) * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 line-clamp-3">{item.notes || item.summary || ''}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          {locale === 'en' ? 'View' : 'عرض'}
                        </button>
                        <button
                          onClick={async () => {
                            const ok = typeof window !== 'undefined' ? window.confirm(locale === 'en' ? 'Delete this analysis?' : 'هل تريد حذف هذا التحليل؟') : true;
                            if (!ok) return;
                            const id = item.id;
                            setDeletingId(id);
                            try {
                              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                              const res = await fetch('/api/analysis/history', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify({ id })
                              });
                              const body = await res.json().catch(() => ({}));
                              if (!res.ok) throw new Error(body.error || body.message || `HTTP ${res.status}`);
                              setRecords((prev) => prev.filter((r) => r.id !== id));
                              if (selected && selected.id === id) setSelected(null);
                            } catch (e) {
                              setError(e.message || String(e));
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          disabled={deletingId === item.id}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-60"
                        >
                          {deletingId === item.id ? (locale === 'en' ? 'Deleting...' : 'جارٍ الحذف') : (locale === 'en' ? 'Delete' : 'حذف')}
                        </button>
                      </div>
                  </div>
                </div>
              </article>
            ))}
      </div>

      {selected && <AnalysisDetailsModal record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
