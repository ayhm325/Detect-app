// ai/inference/inference.service.js
// Inference service: prepares image and calls the model (mock or real).

import { preprocessImage } from "../utils/imagePreprocessor.js";
import { runMockModel } from "./mockModel.js";
import crypto from 'crypto';

function _uuid() {
  if (crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function runInference(file) {
  const prepared = preprocessImage(file);

  const PY_URL = process.env.PY_MODEL_URL || 'http://127.0.0.1:8000/predict';

  // prepare base64 payload
  const b64 = Buffer.isBuffer(prepared.buffer) ? prepared.buffer.toString('base64') : Buffer.from(prepared.buffer).toString('base64');

  const start = Date.now();
  try {
    // decide whether to request heatmap from Python service
    // controlled via env var REQUEST_HEATMAP (default false)
    // decide whether to request heatmap from Python service
    // prefer file-provided flag (file.with_heatmap) then env var REQUEST_HEATMAP
    const requestHeatmap = (file.with_heatmap === true) || (process.env.REQUEST_HEATMAP === '1');
    const res = await fetch(PY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: b64, with_heatmap: requestHeatmap })
    });

    if (!res.ok) {
      throw new Error(`Model server responded ${res.status}`);
    }

    const json = await res.json();
    const end = Date.now();

    // Expecting { prediction: "Normal"|"Pneumonia", probabilities: { Normal: 0.1, Pneumonia: 0.9 } }
    const pred = json.prediction || (json.data && json.data.prediction) || 'Unknown';
    const probs = json.probabilities || (json.data && json.data.probabilities) || null;
    let confidence = 0;
    if (probs && typeof probs === 'object') {
      // take probability of predicted class when available
      confidence = typeof probs[pred] === 'number' ? probs[pred] : Math.max(...Object.values(probs).filter(v => typeof v === 'number')) || 0;
    }

    const conf = Number(confidence) || 0;
    // threshold (can be configured via env var MODEL_CONFIDENCE_THRESHOLD)
    const threshold = Number(process.env.MODEL_CONFIDENCE_THRESHOLD) || 0.85;
    const needs_review = conf < threshold;

    return {
      analysis_id: _uuid(),
      prediction: pred,
      confidence: conf,
      needs_review,
      // convenience label for UI: if below threshold mark Needs Review
      display_label: needs_review ? 'Needs Radiologist Review' : pred,
      explanation: json.explanation ?? null,
      heatmap_url: json.heatmap_url ?? json.heatmapUrl ?? null,
      model_version: json.model_version ?? json.modelVersion ?? 'pytorch-densenet169',
      inference_time_ms: end - start,
      created_at: new Date().toISOString()
    };
  } catch (e) {
    // fallback to mock model on any error
    try {
      const mock = await runMockModel(prepared.buffer);
      return mock;
    } catch (err) {
      // if even mock fails, propagate original error
      throw e;
    }
  }
}
