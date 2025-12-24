import Image from "next/image";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function CompareViewer({ images }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const compareTr = tr.compareViewer || {};
  const needTwoImages = compareTr.needTwoImages || (locale === "ar" ? "يجب اختيار صورتين للمقارنة." : "You must select two images to compare.");
  const imageLabel = compareTr.imageLabel || (locale === "ar" ? "صورة" : "Image");

  if (!images || images.length < 2) return <div className="text-center text-gray-400 py-4">{needTwoImages}</div>;
  return (
    <div className="flex gap-8 justify-center mt-4">
      {images.map((img, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <div className="relative w-72 h-80">
            <Image
              src={img}
              alt={`${imageLabel} ${idx + 1}`}
              fill
              sizes="(min-width: 1024px) 18rem, 60vw"
              className="object-contain rounded-xl shadow"
            />
          </div>
          <span className="text-sm text-zinc-500">{imageLabel} {idx + 1}</span>
        </div>
      ))}
    </div>
  );
}
