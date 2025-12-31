"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import AnalysisDetailsModal from "../../../components/analysis/AnalysisDetailsModal";

// Minimal translation stub — replace with real i18n
const t = (s) => s;

// Modern confidence bar with gradient + glow
function ConfidenceBar({ confidence = 0 }) {
  const pct = Math.round((Number(confidence) || 0) * 100);
  const gradient =
    pct >= 75
      ? "from-emerald-400 via-green-400 to-emerald-500"
      : pct >= 50
      ? "from-amber-300 via-yellow-300 to-amber-400"
      : "from-rose-400 via-red-400 to-rose-500";

  return (
    <div>
      <div className="w-full bg-white/30 dark:bg-black/20 rounded-full h-4 overflow-hidden shadow-inner border border-white/10">
        <div
          className={`h-4 rounded-full bg-linear-to-r ${gradient} transition-all duration-700 ease-out shadow-[0_4px_18px_rgba(99,102,241,0.12)]`}
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
        <span className="font-medium text-slate-900">{pct}%</span>
        <span className="text-slate-500" title={t("AI confidence score")}>
          {t("Confidence")}
        </span>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const xhrRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadLoaded, setUploadLoaded] = useState(null);
  const [uploadTotal, setUploadTotal] = useState(null);
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(false);

  // Image selection
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (xhrRef.current) xhrRef.current.abort();
    setSelectedImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    if (xhrRef.current) xhrRef.current.abort();
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) xhrRef.current.abort();
    xhrRef.current = null;
    setIsLoading(false);
    setUploadProgress(null);
    setUploadLoaded(null);
    setUploadTotal(null);
    setUploadStartTime(null);
    setError(t("Upload canceled"));
  };

  // cancel on navigation/unload
  useEffect(() => {
    const abortUpload = () => {
      if (xhrRef.current) xhrRef.current.abort();
      xhrRef.current = null;
    };
    window.addEventListener("beforeunload", abortUpload);
    window.addEventListener("pagehide", abortUpload);

    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      const res = origPush.apply(this, args);
      window.dispatchEvent(new Event("navigation"));
      return res;
    };
    history.replaceState = function (...args) {
      const res = origReplace.apply(this, args);
      window.dispatchEvent(new Event("navigation"));
      return res;
    };
    window.addEventListener("popstate", abortUpload);
    window.addEventListener("navigation", abortUpload);

    return () => {
      window.removeEventListener("beforeunload", abortUpload);
      window.removeEventListener("pagehide", abortUpload);
      window.removeEventListener("popstate", abortUpload);
      window.removeEventListener("navigation", abortUpload);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  // Animate results entrance
  useEffect(() => {
    if (analysisResult) {
      const id = setTimeout(() => setResultsVisible(true), 40);
      return () => clearTimeout(id);
    }
    setResultsVisible(false);
  }, [analysisResult]);

  // Upload & analyze
  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setUploadProgress(0);
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", "/api/analysis/analyze");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const now = Date.now();
          if (!uploadStartTime) setUploadStartTime(now);
          setUploadLoaded(e.loaded);
          setUploadTotal(e.total);
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setIsLoading(false);
        setUploadProgress(null);
        setUploadLoaded(null);
        setUploadTotal(null);
        setUploadStartTime(null);
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) {
            setAnalysisResult(data.data ?? null);
            setSavedToHistory(Boolean(data.saved));
          } else {
            setError(data.error || data.message || `HTTP ${xhr.status}`);
          }
        } catch (e) {
          setError(String(e));
        }
      };

      xhr.onerror = () => {
        setIsLoading(false);
        setUploadProgress(null);
        setUploadLoaded(null);
        setUploadTotal(null);
        setUploadStartTime(null);
        setError(t("Network error during upload"));
      };

      xhr.send(formData);
    } catch (err) {
      setError(err.message || String(err));
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const formatMB = (bytes) => (bytes ? (bytes / 1024 / 1024).toFixed(2) : "0.00");
  const formatEta = () => {
    if (!uploadLoaded || !uploadTotal || !uploadStartTime) return null;
    const now = Date.now();
    const elapsedMs = Math.max(1, now - uploadStartTime);
    const speedBps = uploadLoaded / (elapsedMs / 1000);
    if (!speedBps || speedBps <= 0) return null;
    const remaining = Math.max(0, uploadTotal - uploadLoaded);
    const etaSec = remaining / speedBps;
    const minutes = Math.floor(etaSec / 60);
    const seconds = Math.floor(etaSec % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[85vh] py-14 bg-linear-to-br from-indigo-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-black">
      <div className="max-w-7xl mx-auto p-8 backdrop-blur-sm bg-white/75 dark:bg-slate-900/65 rounded-3xl shadow-2xl border border-white/30">
        <header className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-pink-500 to-rose-500">
              {t("AI Medical Image Analysis")}
            </h1>
            <p className="mt-2 text-base text-slate-600">{t("Upload an image to get AI-powered diagnostic insights")}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-white/50 to-white/30 shadow-sm border border-white/20">
              <span className="text-sm text-slate-700">{t("Quick AI")}</span>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/tiff"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
          >
            📁 {t("Choose Image")}
          </button>

          {previewUrl && (
            <button
              onClick={handleRemoveImage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-lg text-lg"
            >
              ✖ {t("Remove")}
            </button>
          )}
        </div>

        {/* Layout: two columns on large screens so preview and results sit side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview + Heatmap side by side */}
          <div>
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-lg bg-linear-to-br from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 transition-transform duration-300 hover:scale-[1.01]">
              <div className="p-4">
                {previewUrl ? (
                  <div className="relative w-full hover:scale-105 transition-transform duration-300" style={{ paddingBottom: "75%" }}>
                    <Image src={previewUrl} alt={t("Selected image preview")} fill className="object-cover absolute inset-0 rounded-xl" unoptimized />
                  </div>
                ) : (
                  <div className="w-full h-60 flex items-center justify-center bg-gray-50 text-slate-400">
                    {t("No image selected")}
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="text-base text-slate-700 truncate">{selectedImage ? `${selectedImage.name}` : t("No file")}</div>
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/60 rounded-md text-sm shadow-sm hover:bg-white/80">
                    {t("Replace")}
                  </button>
                  <button onClick={handleRemoveImage} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-md text-sm">
                    {t("Remove")}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isLoading}
              className={`mt-5 w-full py-4 rounded-3xl text-white text-xl font-bold transition-transform shadow-xl ${
                isLoading
                  ? "bg-linear-to-r from-slate-400 to-slate-500 cursor-not-allowed"
                  : "bg-linear-to-r from-sky-500 via-emerald-400 to-emerald-600 hover:scale-105"
              }`}
            >
              {isLoading ? "Analyzing…" : "Analyze Image"}
            </button>

            {uploadProgress !== null && (
              <div className="mt-4">
                <div className="relative w-full h-10 bg-white/30 rounded-2xl overflow-hidden border border-white/20">
                  <div
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-emerald-400 via-amber-300 to-rose-400 transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white drop-shadow-sm">
                    {uploadProgress}% • {formatMB(uploadLoaded)} MB / {formatMB(uploadTotal)} MB {formatEta() && `• ETA: ${formatEta()}`}
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <button onClick={handleCancelUpload} className="text-xs text-rose-600 underline">
                    {t("Cancel upload")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className={`space-y-4 transition-all duration-700 ease-out transform ${resultsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {analysisResult && (analysisResult.heatmap_url || analysisResult.heatmapUrl) && (
              <div className="mb-2">
                <h3 className="text-md font-semibold mb-2">{t("Heatmap")}</h3>
                <div className="rounded-3xl overflow-hidden border border-white/10 shadow-sm bg-white/50 p-4">
                  <button type="button" onClick={() => setShowModal(true)} style={{ border: 'none', padding: 0, background: 'transparent' }} className="block w-full">
                    <div className="relative" style={{ paddingBottom: '75%' }}>
                      <Image
                        src={analysisResult.heatmap_url ?? analysisResult.heatmapUrl}
                        alt={t("Heatmap")}
                        fill
                        className="object-cover rounded-xl absolute inset-0"
                        unoptimized
                      />
                    </div>
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-red-600 font-medium">{error}</p>}

            {analysisResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl shadow-xl hover:scale-102 hover:shadow-2xl transition-transform duration-300 ${String(analysisResult.prediction).toLowerCase().includes("normal") ? "bg-linear-to-br from-emerald-50 to-white border border-emerald-200" : "bg-linear-to-br from-rose-50 to-white border border-rose-200"}`}>
                  <h2 className="text-2xl font-semibold mb-3">{t("Diagnosis")}</h2>
                  <p className="text-slate-900 text-lg font-semibold">{analysisResult.prediction}</p>
                  <p className="text-sm text-slate-500 mt-3">{t("Model:")} {analysisResult.model_version ?? "unknown"} • {t("Inference Time:")} {analysisResult.inference_time_ms ?? 0} ms</p>
                  {savedToHistory && <p className="text-emerald-700 mt-3">{t("Saved to history")}</p>}
                </div>

                <div className="p-6 rounded-3xl shadow-xl bg-linear-to-br from-sky-50 to-white hover:scale-102 transition-transform duration-300">
                  <h2 className="text-2xl font-semibold mb-3">{t("Confidence")}</h2>
                  <ConfidenceBar confidence={analysisResult.confidence} />
                  {analysisResult.explanation && (
                    <p className="mt-4 text-slate-700 text-sm"><strong>{t("Explanation")}:</strong> {analysisResult.explanation}</p>
                  )}
                </div>
              </div>
            )}

            {analysisResult && !(analysisResult.heatmap_url || analysisResult.heatmapUrl) && (
              <div className="mt-2">
                <h1 className="text-md font-semibold mb-2">{t("Heatmap")}</h1>
                <div className="w-full h-72 rounded-3xl border border-dashed border-white/10 flex items-center justify-center bg-white/30">
                  <span className="text-slate-400 text-lg">{t("No heatmap available")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <AnalysisDetailsModal record={analysisResult} saved={savedToHistory} saveError={analysisResult?.saveError} onClose={() => setShowModal(false)} />
        )}
      </div>
    </div>
  );
}
