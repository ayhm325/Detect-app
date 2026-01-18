/*
  This contract defines the fixed response structure for AI analysis results.
  All inference models (mock or real) must comply with this contract.

  Canonical shape (do NOT change):

  {
    "analysis_id": "string",
    "prediction": "string",
    "confidence": "number",
    "explanation": "string",
    "heatmap_url": "string | null",
    "model_version": "string",
    "inference_time_ms": "number",
    "created_at": "datetime"
  }

  This file provides a small validator utility to check compliance.
*/

const FIELDS = Object.freeze([
  "analysis_id",
  "prediction",
  "confidence",
  "explanation",
  "heatmap_url",
  "model_version",
  "inference_time_ms",
  "created_at",
]);

function _isString(v) {
  return typeof v === "string";
}
function _isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function _isNull(v) {
  return v === null;
}
function _isDateLike(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return true;
  if (typeof v === "string") return !isNaN(Date.parse(v));
  return false;
}

function validate(obj) {
  const errors = [];
  if (!obj || typeof obj !== "object") {
    errors.push("response:not_object");
    return { valid: false, errors };
  }

  // required presence
  for (const f of FIELDS) {
    if (!(f in obj)) errors.push(`missing.${f}`);
  }

  // type checks
  if ("analysis_id" in obj && !_isString(obj.analysis_id))
    errors.push("analysis_id:string");
  if ("prediction" in obj && !_isString(obj.prediction))
    errors.push("prediction:string");

  if ("confidence" in obj) {
    if (!_isNumber(obj.confidence)) errors.push("confidence:number");
    else if (!(obj.confidence >= 0 && obj.confidence <= 1))
      errors.push("confidence:0-1");
  }

  if ("explanation" in obj && !_isString(obj.explanation))
    errors.push("explanation:string");

  if ("heatmap_url" in obj) {
    const v = obj.heatmap_url;
    if (!(_isNull(v) || _isString(v))) errors.push("heatmap_url:string|null");
  }

  if ("model_version" in obj && !_isString(obj.model_version))
    errors.push("model_version:string");

  if ("inference_time_ms" in obj && !_isNumber(obj.inference_time_ms))
    errors.push("inference_time_ms:number");

  if ("created_at" in obj && !_isDateLike(obj.created_at))
    errors.push("created_at:datetime");

  return { valid: errors.length === 0, errors };
}

module.exports = { FIELDS, validate };
