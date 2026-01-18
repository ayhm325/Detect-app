// ai/inference/mockModel.js
// Pure mock model — Image -> Result
// Async, simulates inference delay and returns a value that must conform to the contract.

import crypto from "crypto";

const POSSIBLE_PREDICTIONS = ["Pneumonia", "Normal", "COVID-19"];

function randomPrediction() {
  const index = Math.floor(Math.random() * POSSIBLE_PREDICTIONS.length);
  return POSSIBLE_PREDICTIONS[index];
}

function randomConfidence() {
  return Number((Math.random() * (0.95 - 0.75) + 0.75).toFixed(2));
}

function _uuid() {
  if (crypto && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function runMockModel(imageBuffer) {
  const startTime = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 600));

  const prediction = randomPrediction();
  const confidence = randomConfidence();

  const endTime = Date.now();

  return {
    analysis_id: _uuid(),
    prediction,
    confidence,
    explanation: "Mock analysis based on simulated pattern recognition.",
    // small transparent 1x1 PNG data URL to avoid missing static asset during development
    heatmap_url:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
    model_version: "mock-v1",
    inference_time_ms: endTime - startTime,
    created_at: new Date().toISOString(),
  };
}
