// routes/analysis.routes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  analyzeImage,
  getAnalysisHistory,
} = require("../controllers/analysis.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", upload.single("image"), analyzeImage);
router.get("/history", getAnalysisHistory);

module.exports = router;
