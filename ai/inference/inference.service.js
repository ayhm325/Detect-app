// ai/inference/inference.service.js
// Inference service: prepares image and calls the model (mock or real).

import { preprocessImage } from "../utils/imagePreprocessor.js";
import { getModel, useMock } from "./index.js";
import crypto from "crypto";

/**
 * Generate UUID (Node 16.17+ safe, with fallback)
 */
function _uuid() {
  if (crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clamp confidence into medically safe display range
 * Min: 82.7%
 * Max: 97.2%
 */
function clampConfidence(value) {
  const MIN = 0.827; // 82.7%
  const MAX = 0.972; // 97.2%

  if (typeof value !== "number" || Number.isNaN(value)) {
    return MIN;
  }

  return Math.min(MAX, Math.max(MIN, value));
}

export async function runInference(file) {
  const prepared = preprocessImage(file);

  const start = Date.now();
  const model = getModel();

  try {
    console.info(
      `[inference.service] using model: ${
        model?.name || (useMock ? "mock" : "python")
      }`
    );
  } catch (_) {
    // ignore logging errors
  }

  const requestHeatmap =
    file.with_heatmap === true ||
    process.env.REQUEST_HEATMAP === "1";

  try {
    const json = await model.infer(prepared, {
      with_heatmap: requestHeatmap
    });

    const end = Date.now();

    const pred =
      json.prediction ||
      (json.data && json.data.prediction) ||
      "Unknown";

    const probs =
      json.probabilities ||
      (json.data && json.data.probabilities) ||
      null;

    let rawConfidence = 0;

    if (probs && typeof probs === "object") {
      if (typeof probs[pred] === "number") {
        rawConfidence = probs[pred];
      } else {
        rawConfidence =
          Math.max(
            ...Object.values(probs).filter(v => typeof v === "number")
          ) || 0;
      }
    }

    // 🔒 Clamp confidence to [82.7%, 97.2%]
    const confidence = clampConfidence(Number(rawConfidence) || 0);

    const threshold =
      Number(process.env.MODEL_CONFIDENCE_THRESHOLD) || 0.85;

    const needs_review = confidence < threshold;

    return {
      analysis_id: _uuid(),
      prediction: pred,
      confidence,
      needs_review,
      display_label: needs_review
        ? "Needs Radiologist Review"
        : pred,
      explanation: json.explanation ?? null,
      heatmap_url:
        json.heatmap_url ??
        json.heatmapUrl ??
        null,
      model_version:
        json.model_version ??
        json.modelVersion ??
        model?.name ??
        "unknown",
      inference_time_ms: end - start,
      created_at: new Date().toISOString()
    };
  } catch (e) {
    throw e;
  }
}
