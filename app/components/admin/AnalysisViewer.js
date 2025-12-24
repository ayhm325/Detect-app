import Image from "next/image";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

function isValidImageUrl(url) {
  // رابط يبدأ بـ http أو /
  return typeof url === "string" && (url.startsWith("http") || url.startsWith("/"));
}

export default function AnalysisViewer({ imageUrl }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const viewTr = tr.viewModal || {};
  const noImageText = viewTr.noImage || (locale === "ar" ? "لا توجد صورة للعرض." : "No image to display.");
  const imageLabel = viewTr.imageLabel || (locale === "ar" ? "صورة التحليل" : "Analysis Image");

  if (!imageUrl) return <div className="text-center text-gray-400 py-4">{noImageText}</div>;
  if (!isValidImageUrl(imageUrl)) {
    // إذا كان رمز أو نص وليس رابط صورة
    return <div className="text-center text-6xl py-12">{imageUrl}</div>;
  }
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="relative w-full max-w-3xl h-96">
        <Image
          src={imageUrl}
          alt={imageLabel}
          fill
          sizes="(min-width: 1024px) 768px, 90vw"
          className="object-contain rounded-xl shadow"
        />
      </div>
      <span className="text-sm text-zinc-500">{imageLabel}</span>
    </div>
  );
}
