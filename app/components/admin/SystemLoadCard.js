import React from "react";
import { FaServer } from "react-icons/fa";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function SystemLoadCard() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const loadLabel =
    tr.systemLoadCard?.label ||
    (locale === "ar" ? "استهلاك النظام الحالي" : "Current System Load");
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-2 border-green-200 mt-8">
      <FaServer className="text-4xl text-green-500 mb-3" />
      <div className="text-2xl font-bold mb-1">%65</div>
      <div className="text-zinc-700">{loadLabel}</div>
    </div>
  );
}
