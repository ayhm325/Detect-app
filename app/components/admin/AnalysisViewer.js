export default function AnalysisViewer({ imageUrl }) {
  if (!imageUrl) return <div className="text-center text-gray-400 py-4">لا توجد صورة للعرض.</div>;
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <img src={imageUrl} alt="صورة التحليل" className="max-w-full max-h-96 rounded-xl shadow" />
      <span className="text-sm text-zinc-500">صورة التحليل</span>
    </div>
  );
}
