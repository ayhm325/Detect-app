"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import HoloButton from "../../../components/ui/HoloButton";
import GlassCard from "../../../components/ui/GlassCard";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";
import { useToast } from "../../../components/ui/Toast";
import StatusBadge from "../../../components/ui/StatusBadge";

export default function Page() {
  const { locale } = useLocale();
  const t = useTranslations("uploadXray");
  const { showToast, ToastContainer } = useToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recent, setRecent] = useState([
    { id: "U1", name: "xray-shoulder.png", size: "1.2MB", status: t("ready") },
    { id: "U2", name: "ct-chest-2025-12.dcm", size: "5.8MB", status: t("pending_review", { defaultValue: "Pending Review" }) },
  ]);
  const inputRef = useRef(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(t("filter_all", { defaultValue: "All" }));
  const MB = "MB";
  const MAX_MB = 20;
  const allowedExt = ["png", "jpg", "jpeg", "dcm"];

  function onSelect(e) {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    const sizeMB = f.size / (1024 * 1024);
    if (!ext || !allowedExt.includes(ext)) {
      const errorMsg = t("errorUnsupportedType", { defaultValue: "Unsupported file type" });
      setError(errorMsg);
      showToast(errorMsg, "error");
      clearSelection();
      return;
    }
    if (sizeMB > MAX_MB) {
      const errorMsg = `${t("errorFileSize", { defaultValue: "File size too large" })} (${sizeMB.toFixed(1)}${MB}). ${t("errorFileSizeMax", { defaultValue: "Max allowed" })} ${MAX_MB}${MB}`;
      setError(errorMsg);
      showToast(errorMsg, "error");
      clearSelection();
      return;
    }
    setFile(f);
    if (ext !== "dcm") {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    showToast(`${t("fileSelected", { defaultValue: "File selected" })} ${f.name}`, "success");
  }

  function clearSelection() {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    const fakeEvent = { target: { files: [f] } };
    onSelect(fakeEvent);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function mockUpload() {
    if (!file) {
      const errorMsg = t("errorNoFile", { defaultValue: "No file selected" });
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    showToast(t("uploading", { defaultValue: "Uploading..." }), "info");
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 1500) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setUploading(false);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + MB;
        setRecent((r) => [
          { id: `U${Date.now()}`, name: file.name, size: sizeMB, status: t("pending_review", { defaultValue: "Pending Review" }) },
          ...r,
        ]);
        const successMsg = t("uploadSuccess", { defaultValue: "Upload successful" });
        setSuccessMsg(successMsg);
        showToast(successMsg, "success");
        clearSelection();
        setNotes("");
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    }, 100);
  }

  return (
    <>
      <ToastContainer />
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{t("pageTitle", { defaultValue: "Upload X-ray" })}</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t("fileTypes", { defaultValue: "Allowed file types" })} {MAX_MB}{MB}</span>
        </header>
        {/* ...existing code... */}
      </section>
    </>
  );
}

  function clearSelection() {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    const fakeEvent = { target: { files: [f] } };
    onSelect(fakeEvent);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function mockUpload() {
    if (!file) {
      const errorMsg = t("errorNoFile", { defaultValue: "No file selected" });
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    showToast(t("uploading", { defaultValue: "Uploading..." }), "info");
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 1500) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setUploading(false);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + MB;
        setRecent((r) => [
          { id: `U${Date.now()}`, name: file.name, size: sizeMB, status: t("pending_review", { defaultValue: "Pending Review" }) },
          ...r,
        ]);
        const successMsg = t("uploadSuccess", { defaultValue: "Upload successful" });
        setSuccessMsg(successMsg);
        showToast(successMsg, "success");
        clearSelection();
        setNotes("");
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    }, 100);
  }

  return (
    <>
      <ToastContainer />
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{t("pageTitle", { defaultValue: "Upload X-ray" })}</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t("fileTypes", { defaultValue: "Allowed file types" })} {MAX_MB}{MB}</span>
        </header>

        <GlassCard title={t("uploadCard_title", { defaultValue: "Upload File" })}> 
          <div className="space-y-4">
            {successMsg && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 px-3 py-2 text-sm text-green-700 dark:text-green-300">{successMsg}</div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("selectFile", { defaultValue: "Select file" })}</label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 px-3 py-3"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.dcm"
                  onChange={onSelect}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              {previewUrl && (
                <div className="mt-3 relative h-64 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <Image src={previewUrl} alt={t("preview", { defaultValue: "Preview" }) } fill className="object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("notesLabel", { defaultValue: "Notes" })}</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder={t("notesPlaceholder", { defaultValue: "Add notes" })}
              />
            </div>

            <div className="flex items-center gap-3">
              <HoloButton onClick={mockUpload} disabled={uploading || !file}>
                {uploading ? t("uploading", { defaultValue: "Uploading..." }) : t("upload", { defaultValue: "Upload" })}
              </HoloButton>
              <HoloButton variant="outline" onClick={clearSelection}>{t("cancel", { defaultValue: "Cancel" })}</HoloButton>
            </div>

            {uploading && (
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("progressLabel", { defaultValue: "Progress" })} {progress}%</div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard title={t("recentFiles_title", { defaultValue: "Recent Files" })}> 
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentFiles_title", { defaultValue: "Recent Files" })}</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={t("searchPlaceholder", { defaultValue: "Search files" })}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 md:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value={t("filter_all", { defaultValue: "All" })}>{t("filter_all", { defaultValue: "All" })}</option>
                <option value={t("filter_ready", { defaultValue: "Ready" })}>{t("filter_ready", { defaultValue: "Ready" })}</option>
                <option value={t("filter_pending", { defaultValue: "Pending" })}>{t("filter_pending", { defaultValue: "Pending" })}</option>
              </select>
            </div>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {recent
              .filter((f) => (statusFilter === t("filter_all", { defaultValue: "All" }) ? true : f.status === statusFilter))
              .filter((f) => (query ? f.name.toLowerCase().includes(query.toLowerCase()) : true))
              .map((f) => (
              <li key={f.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("size", { defaultValue: "Size" })} {f.size}</div>
                </div>
                <StatusBadge status={f.status} t={t} />
              </li>
            ))}
            {recent.length === 0 && <li className="py-3 text-sm text-gray-500 dark:text-gray-400">{t("noFiles", { defaultValue: "No files found" })}</li>}
          </ul>
        </GlassCard>
      </section>
    </>
  );

// ...existing code...
