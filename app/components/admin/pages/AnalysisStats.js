import { FaChartLine, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function AnalysisStats() {
  const t = useTranslations("adminAnalyses");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="card-glass flex flex-col items-center p-8">
        <FaChartLine className="mb-3 text-4xl text-(--ui-muted-2)" />
        <div className="mb-1 text-2xl font-bold text-foreground">230</div>
        <div className="text-(--ui-muted-2)">{t("summary.total")}</div>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <FaCheckCircle className="mb-3 text-4xl text-(--ui-success)" />
        <div className="mb-1 text-2xl font-bold text-(--ui-success)">180</div>
        <div className="text-(--ui-muted-2)">{t("summary.success")}</div>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <FaTimesCircle className="mb-3 text-4xl text-(--ui-danger)" />
        <div className="mb-1 text-2xl font-bold text-(--ui-danger)">50</div>
        <div className="text-(--ui-muted-2)">{t("summary.failed")}</div>
      </div>
    </div>
  );
}
