// services/analysisResult.service.js
// Service to save and fetch analysis results using Prisma client.

async function _getPrisma() {
  const mod = await import('../lib/prismaClient.js');
  return mod.default;
}

async function saveAnalysisResult({ userId, imageUrl, analysisData }) {
  const prisma = await _getPrisma();

  const created = await prisma.analysisResult.create({
    data: {
      userId,
      imageUrl,
      prediction: analysisData.prediction,
      confidence: analysisData.confidence,
      explanation: analysisData.explanation,
      heatmapUrl: analysisData.heatmap_url ?? analysisData.heatmapUrl ?? null,
      modelVersion: analysisData.model_version ?? analysisData.modelVersion ?? 'unknown',
      inferenceTimeMs: analysisData.inference_time_ms ?? analysisData.inferenceTimeMs ?? 0
    }
  });

  return created;
}

async function getAnalysisHistory(userId) {
  const prisma = await _getPrisma();

  const results = await prisma.analysisResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return results;
}

async function deleteAnalysisResult(userId, id) {
  const prisma = await _getPrisma();

  // Use deleteMany to safely ensure the record belongs to the user
  const result = await prisma.analysisResult.deleteMany({
    where: { id, userId }
  });

  return result; // contains { count }
}

export { saveAnalysisResult, getAnalysisHistory };

export { deleteAnalysisResult };

// also export as ESM default for dynamic import compatibility
export default {
  saveAnalysisResult,
  getAnalysisHistory
};
