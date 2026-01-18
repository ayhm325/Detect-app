// ai/inference/pyModel.js
// Adapter that calls the local Python model server at /predict
import fetch from "node-fetch";

const PY_URL = process.env.PY_MODEL_URL || "http://127.0.0.1:8000/predict";

export async function runPyModel(prepared, options = {}) {
  const b64 = Buffer.isBuffer(prepared.buffer)
    ? prepared.buffer.toString("base64")
    : Buffer.from(prepared.buffer).toString("base64");
  const with_heatmap = !!options.with_heatmap;

  const res = await fetch(PY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: b64, with_heatmap }),
  });

  if (!res.ok) throw new Error(`Python model server returned ${res.status}`);
  return await res.json();
}
