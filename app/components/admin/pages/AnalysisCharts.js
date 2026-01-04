import { FaChartBar, FaChartPie, FaChartArea } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function AnalysisCharts() {
  const t = useTranslations("adminAnalyses");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      <div className="card-glass rounded-2xl shadow-(--shadow-soft) p-6 flex flex-col items-center border border-(--ui-border)">
        <FaChartBar className="text-3xl text-(--ui-muted-2) mb-2" />
        <span className="font-bold text-foreground mb-2">{t("charts.monthly")}</span>
        <div className="w-full h-24 bg-(--ui-surface-2) border border-(--ui-border) rounded-xl" />
      </div>
      <div className="card-glass rounded-2xl shadow-(--shadow-soft) p-6 flex flex-col items-center border border-(--ui-border)">
        <FaChartPie className="text-3xl text-(--ui-muted-2) mb-2" />
        <span className="font-bold text-foreground mb-2">{t("charts.successRate")}</span>
        <div className="w-full h-24 bg-(--ui-surface-2) border border-(--ui-border) rounded-xl" />
      </div>
      <div className="card-glass rounded-2xl shadow-(--shadow-soft) p-6 flex flex-col items-center border border-(--ui-border)">
        <FaChartArea className="text-3xl text-(--ui-muted-2) mb-2" />
        <span className="font-bold text-foreground mb-2">{t("charts.caseDistribution")}</span>
        <div className="w-full h-24 bg-(--ui-surface-2) border border-(--ui-border) rounded-xl" />
      </div>
    </div>
  );
}
