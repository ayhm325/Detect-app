// controllers/analysis.controller.js

const { runInference } = require("../ai/inference/inference.service");
const {
  saveAnalysisResult,
  getAnalysisHistory,
} = require("../services/analysisResult.service");

async function analyzeImage(req, res) {
  try {
    const file = req.file;
    const userId = req.user && req.user.id;

    if (!userId) throw new Error("Unauthorized: missing user");

    const analysisResult = await runInference(file);

    // temporary image URL placeholder — adapt to your storage
    const imageUrl = `/uploads/${file.originalname}`;

    const savedResult = await saveAnalysisResult({
      userId,
      imageUrl,
      analysisData: analysisResult,
    });

    return res.status(200).json({
      success: true,
      data: savedResult,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAnalysisHistoryController(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) throw new Error("Unauthorized: missing user");

    const results = await getAnalysisHistory(userId);

    return res.json({ success: true, data: results });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  analyzeImage,
  getAnalysisHistory: getAnalysisHistoryController,
};
