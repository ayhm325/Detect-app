"use client";
import { useToast } from "@/app/components/ui/Toast";
import { useState, useRef } from "react";
import Image from "next/image";
import HoloButton from "@/app/components/ui/HoloButton";
import GlassCard from "@/app/components/ui/GlassCard";

export default function UploadXRayPage() {
  const { showToast, ToastContainer } = useToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recent, setRecent] = useState([
    { id: "U1", name: "xray-shoulder.png", size: "1.2MB", status: "جاهز" },
    { id: "U2", name: "ct-chest-2025-12.dcm", size: "5.8MB", status: "بانتظار المراجعة" },
  ]);
  const inputRef = useRef(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const MAX_MB = 20; // حد الحجم الأمثل
  const allowedExt = ["png", "jpg", "jpeg", "dcm"];

  function onSelect(e) {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    const sizeMB = f.size / (1024 * 1024);
    if (!ext || !allowedExt.includes(ext)) {
      const errorMsg = "نوع الملف غير مدعوم. الصيغ المسموحة: PNG, JPG, DICOM";
      setError(errorMsg);
      showToast(errorMsg, "error");
      clearSelection();
      return;
    }
    if (sizeMB > MAX_MB) {
      const errorMsg = `الحجم كبير (${sizeMB.toFixed(1)}MB). الحد الأقصى ${MAX_MB}MB`;
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
    showToast(`تم تحديد الملف: ${f.name}`, "success");
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
      const errorMsg = "يرجى اختيار ملف أولاً";
      setError(errorMsg);
      showToast(errorMsg, "error");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    showToast("جاري رفع الملف...", "info");
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 1500) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setUploading(false);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + "MB";
        setRecent((r) => [
          { id: `U${Date.now()}`, name: file.name, size: sizeMB, status: "بانتظار المراجعة" },
          ...r,
        ]);
        const successMsg = "تم رفع الملف بنجاح وإرساله للمراجعة";
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
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">رفع صور الأشعة</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">PNG • JPG • DICOM • حد {MAX_MB}MB</span>
        </header>

        <GlassCard title="رفع ملف الأشعة">
          <div className="space-y-4">
            {successMsg && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{successMsg}</div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اختَر الملف أو اسحب وأفلت هنا</label>
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
                <div className="mt-3 relative h-64 w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image src={previewUrl} alt="معاينة" fill className="object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ملاحظات للطبيب (اختياري)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="اكتب أي تفاصيل مهمة عن الحالة"
              />
            </div>

            <div className="flex items-center gap-3">
              <HoloButton onClick={mockUpload} disabled={uploading || !file}>
                {uploading ? "جاري الرفع..." : "رفع"}
              </HoloButton>
              <HoloButton variant="outline" onClick={clearSelection}>إلغاء</HoloButton>
            </div>

            {uploading && (
              <div className="mt-2">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-600">نسبة التقدم: {progress}%</div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard title="الملفات المرفوعة حديثاً">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">الملفات المرفوعة حديثاً</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="ابحث بالاسم..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 md:w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option>الكل</option>
                <option>جاهز</option>
                <option>بانتظار المراجعة</option>
              </select>
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {recent
              .filter((f) => (statusFilter === "الكل" ? true : f.status === statusFilter))
              .filter((f) => (query ? f.name.toLowerCase().includes(query.toLowerCase()) : true))
              .map((f) => (
              <li key={f.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{f.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">الحجم: {f.size}</div>
                </div>
                <StatusBadge status={f.status} />
              </li>
            ))}
            {recent.length === 0 && <li className="py-3 text-sm text-gray-500">لا توجد ملفات بعد</li>}
          </ul>
        </GlassCard>
      </section>
    </>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "جاهز"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "بانتظار المراجعة"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  return <span className={`text-xs rounded-full border px-2 py-1 ${style}`}>{status}</span>;
}
