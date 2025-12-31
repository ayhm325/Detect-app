"use client";
import React from 'react';
import Image from 'next/image';
import AnalysisResultCard from './AnalysisResultCard';
// minimal i18n stub
const t = (s) => s;

export default function AnalysisDetailsModal({ record, onClose, saved = false, saveError = null }) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={t('Analysis details')}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg p-4 md:p-6 card-glass" dir="auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">{t('Analysis Details')}</h2>
          <button onClick={onClose} aria-label={t('Close details')} className="text-gray-600 hover:text-gray-800 tooltip">
            ✕
            <span className="tooltip-text">{t('Close')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="text-sm text-gray-600 mb-2">{t('Original Image')}</div>
            {record.imageUrl || record.image_url ? (
              <a href={record.imageUrl ?? record.image_url} target="_blank" rel="noreferrer noopener" aria-label={t('Open original image')}>
                <Image
                  src={record.imageUrl ?? record.image_url}
                  alt={t('Original image')}
                  width={400}
                  height={240}
                  className="rounded-lg soft-shadow"
                  unoptimized
                />
              </a>
            ) : (
              <div className="h-40 bg-gray-100 rounded-lg" />
            )}

            <div className="mt-3 text-sm">
              {saved ? (
                <div className="text-green-700">{t('Saved to history')}</div>
              ) : (
                <div className="text-amber-700">{t('Not saved to history')}{saveError ? ` — ${saveError}` : ''}</div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <AnalysisResultCard result={record} saved={saved} saveError={saveError} />
          </div>
        </div>
      </div>
    </div>
  );
}
