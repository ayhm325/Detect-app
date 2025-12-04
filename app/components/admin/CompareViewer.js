export default function CompareViewer({ images }) {
  if (!images || images.length < 2) return <div className="text-center text-gray-400 py-4">يجب اختيار صورتين للمقارنة.</div>;
  return (
    <div className="flex gap-8 justify-center mt-4">
      {images.map((img, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <img src={img} alt={`صورة ${idx+1}`} className="max-w-xs max-h-80 rounded-xl shadow" />
          <span className="text-sm text-zinc-500">صورة {idx+1}</span>
        </div>
      ))}
    </div>
  );
}
