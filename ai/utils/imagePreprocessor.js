// ai/utils/imagePreprocessor.js
// Simple preprocessor used in Phase 4.

export function preprocessImage(file) {
  if (!file) {
    throw new Error("No image provided");
  }

  if (!file.mimetype || typeof file.mimetype !== 'string' || !file.mimetype.startsWith("image/")) {
    throw new Error("Invalid file type");
  }

  return {
    buffer: file.buffer,
    originalName: file.originalname,
    size: file.size
  };
}
