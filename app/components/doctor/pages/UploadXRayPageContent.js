"use client";
import React, { useMemo, useState } from "react";
import FileUpload from "../../ui/FileUpload";
import { useLocale, useTranslations } from "next-intl";
import UnifiedCard from "../../ui/UnifiedCard";

export default function UploadXRayPageContent() {
  const t = useTranslations("uploadXray");
  const locale = useLocale();
  const ui = useTranslations("ui");

  const placeholder = ui("placeholder");

  const recentUploads = useMemo(() => {
    const items = t.raw("demoRecentUploads");
    if (!Array.isArray(items)) return [];
    return items.map((item, index) => ({
      id: item?.id ?? index + 1,
      patientName: item?.patientName || placeholder,
      type: item?.type || "xray",
      date: item?.date || placeholder,
      status: item?.status || "reviewing",
      notes: item?.notes || placeholder,
    }));
  }, [t, placeholder]);

  const [files, setFiles] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [imageType, setImageType] = useState("xray");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // رفع الملفات عبر FileUpload الموحد
  const handleFileUpload = (selectedFiles) => {
    setFiles(Array.isArray(selectedFiles) ? [...files, ...selectedFiles] : [...files, selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!patientName || files.length === 0) {
      alert(t("toast.selectPatient"));
      return;
    }
    setUploading(true);
    setProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 30;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setFiles([]);
          setProgress(0);
        }, 800);
      } else {
        setProgress(currentProgress);
      }
    }, 400);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {/* Patient Name */}
        <div>
          <label className="block text-sm font-medium text-(--ui-muted-foreground) mb-2">
            {t("patientNameLabel")}
          </label>
          <input
            placeholder={t("patientNamePlaceholder")}
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full px-4 py-2 border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-ring)"
          />
        </div>
        {/* Image Type */}
        <div>
          <label className="block text-sm font-medium text-(--ui-muted-foreground) mb-2">
            {t("imageTypeLabel")}
          </label>
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            className="w-full px-4 py-2 border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-ring)"
          >
            <option value="xray">{t("types.xray")}</option>
            <option value="ct">{t("types.ct")}</option>
            <option value="mri">{t("types.mri")}</option>
            <option value="ultrasound">{t("types.ultrasound")}</option>
          </select>
        </div>
        {/* File Upload */}
        <FileUpload
          onUpload={handleFileUpload}
          accept="image/*,.dcm"
          multiple
          label={t("selectFiles")}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition border-(--ui-border) bg-(--ui-surface-2)"
        >
          <div className="space-y-2">
            <div className="text-3xl">📁</div>
            <p className="text-(--ui-muted-foreground) font-medium">{t("dragDrop")} {t("orText")} {t("selectFiles")}</p>
            <p className="text-sm text-(--ui-muted-foreground)">{t("fileTypes")}</p>
          </div>
        </FileUpload>
        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-(--ui-muted-foreground)">
              {t("selectedFilesLabel")}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-(--ui-surface-2) p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">📄</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-(--ui-foreground) truncate">{file.name}</p>
                      <p className="text-xs text-(--ui-muted-foreground)">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-(--ui-danger) hover:opacity-80 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-(--ui-muted-foreground) mb-2">
            {t("notesLabel")}
          </label>
          <textarea
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--ui-ring)"
          />
        </div>
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !patientName || files.length === 0}
          className="w-full btn-gradient font-medium py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? `${t("uploading")} ${Math.round(progress)}%` : t("upload")}
        </button>
        {/* Progress Bar */}
        {uploading && (
          <div className="w-full bg-(--ui-surface-2) h-2 rounded-full overflow-hidden">
            <div
              className="bg-(--ui-info) h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {/* Recent Uploads */}
      <UnifiedCard className="bg-(--ui-surface) rounded-xl shadow-(--shadow-soft) p-8 border border-(--ui-border)" glass>
        <h2 className="text-xl font-bold text-(--ui-foreground) mb-4">
          {t("recentUploadsTitle")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-(--ui-border)">
              <tr>
                <th className="text-right py-2 px-4 font-semibold text-(--ui-muted-foreground)">{t("patientNameLabel")}</th>
                <th className="text-right py-2 px-4 font-semibold text-(--ui-muted-foreground)">{t("imageTypeLabel")}</th>
                <th className="text-right py-2 px-4 font-semibold text-(--ui-muted-foreground)">{t("dateLabel")}</th>
                <th className="text-right py-2 px-4 font-semibold text-(--ui-muted-foreground)">{t("statusLabel")}</th>
                <th className="text-right py-2 px-4 font-semibold text-(--ui-muted-foreground)">{t("notesLabel")}</th>
              </tr>
            </thead>
            <tbody>
              {recentUploads.map((upload) => (
                <tr
                  key={upload.id}
                  className="border-b border-(--ui-border) hover:bg-(--ui-surface-2)"
                >
                  <td className="py-3 px-4 text-(--ui-foreground)">{upload.patientName}</td>
                  <td className="py-3 px-4 text-(--ui-muted-foreground)">{t(`types.${upload.type}`)}</td>
                  <td className="py-3 px-4 text-(--ui-muted-foreground)">{upload.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${upload.status === "completed" ? "bg-(--ui-success-bg) text-(--ui-success-foreground)" : "bg-(--ui-warning-bg) text-(--ui-warning-foreground)"}`}
                    >
                      {upload.status === "completed" ? t("statuses.completed") : t("statuses.reviewing")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-(--ui-muted-foreground) text-xs">{upload.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UnifiedCard>
    </div>
  );
}
