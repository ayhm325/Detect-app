"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function AnalysisUploader({ onUpload }) {
  const fileRef = useRef();
  const t = useTranslations("adminAnalyses");
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={e => onUpload(e.target.files[0])} />
      <button className="btn-gradient px-6 py-2 rounded" onClick={() => fileRef.current.click()}>{t("buttons.upload")}</button>
    </div>
  );
}
