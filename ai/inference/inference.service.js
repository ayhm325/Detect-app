// ai/inference/inference.service.js
// Inference service: prepares image and calls the model (mock or real).

import { preprocessImage } from "../utils/imagePreprocessor.js";
import { runMockModel } from "./mockModel.js";

export async function runInference(file) {
  const preparedImage = preprocessImage(file);
  const analysisResult = await runMockModel(preparedImage.buffer);
  return analysisResult;
}
