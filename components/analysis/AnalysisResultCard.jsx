"use client";
import React from 'react';
import Image from 'next/image';

// minimal i18n stub
const t = (s) => s;

function ConfidenceBar({ value }) {
  const pct = Math.round((Number(value) || 0) * 100);
  let color = 'from-red-500 to-yellow-400';
  if (pct >= 75) color = 'from-green-400 to-green-600';
  else if (pct >= 50) color = 'from-yellow-300 to-yellow-500';
  return (
    <div>
      <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
        <div
          className={`h-3 bg-linear-to-r ${color} transition-all duration-300`}
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="font-medium">{pct}%</div>
        <div className="text-xs text-gray-500">{t('Confidence score')}</div>
      </div>
    </div>
  );
}

export default function AnalysisResultCard({ result, saved = false, saveError = null }) {
  if (!result) return null;

  const confidence = typeof result.confidence === 'number' ? Number(result.confidence) : 0;
  const prediction = result.prediction || result.prediction || '—';
  const model = result.model_version || result.modelVersion || 'unknown';
  const timeMs = result.inference_time_ms ?? result.inferenceTimeMs ?? 0;

  const isNormal = String(prediction).toLowerCase().includes('normal');

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm max-w-full hover:shadow-lg transition-transform hover:-translate-y-0.5" dir="auto" role="group" aria-label={t('Analysis result')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M2 5a2 2 0 012-2h8a2 2 0 012 2v2h2a1 1 0 010 2h-2v2h2a1 1 0 010 2h-2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500">{t('Analysis')}</div>
            <div className="text-base font-semibold">{prediction}</div>
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-gray-100 to-white text-xs shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
            </svg>
            <span className="text-xs text-gray-700">{t('Model')} {model}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{t('Diagnosis')}</h3>
            <span className={`text-sm font-medium ${isNormal ? 'text-green-600' : 'text-amber-700'}`}>{prediction}</span>
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-700"><strong>{t('Model')}:</strong> <code className="text-xs">{model}</code></div>
            <div className="text-sm text-gray-700 mt-1"><strong>{t('Inference Time')}:</strong> {timeMs} ms</div>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <div className="font-medium">{t('Explanation')}</div>
            <div className="mt-1 text-sm text-gray-600">{result.explanation}</div>
          </div>

          <div className="mt-3 text-sm">
            {saved ? (
              <span className="text-green-700">{t('Saved to history')}</span>
            ) : (
              <span className="text-amber-700">{t('Not saved')}{saveError ? ` — ${saveError}` : ''}</span>
            )}
          </div>
        </div>

        <div className="w-full sm:w-48 mt-4 sm:mt-0">
          <div className="mb-2 text-sm text-gray-600">{t('Confidence')}</div>
          <ConfidenceBar value={confidence} />
        </div>
      </div>

      {(result.imageUrl || result.image_url) && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">{t('Original Image')}</div>
          <a href={result.imageUrl ?? result.image_url} target="_blank" rel="noreferrer noopener" aria-label={t('Open original image in new tab')}>
            <Image
              src={result.imageUrl ?? result.image_url}
              alt={t('Original image')}
              width={800}
              height={400}
              className="rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
              unoptimized
            />
          </a>
        </div>
      )}

      {(result.heatmap_url || result.heatmapUrl) && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">{t('Heatmap')}</div>
          <Image
            src={result.heatmap_url ?? result.heatmapUrl}
            alt={t('Heatmap')}
            width={800}
            height={400}
            className="rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
