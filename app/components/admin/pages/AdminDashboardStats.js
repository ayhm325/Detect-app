import { FaUserMd, FaUserInjured, FaUsers, FaChartBar, FaCogs, FaComments } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function AdminDashboardStats() {
  const t = useTranslations("adminDashboard");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="card-glass flex flex-col items-center p-8">
        <FaUsers className="mb-3 text-4xl text-(--ui-muted-2)" />
        <div className="mb-1 text-2xl font-bold text-foreground">120</div>
        <div className="text-(--ui-muted-2)">{t("stats.totalUsers")}</div>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <FaUserMd className="mb-3 text-4xl text-(--ui-muted-2)" />
        <div className="mb-1 text-2xl font-bold text-foreground">35</div>
        <div className="text-(--ui-muted-2)">{t("stats.doctors")}</div>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <FaUserInjured className="mb-3 text-4xl text-(--ui-muted-2)" />
        <div className="mb-1 text-2xl font-bold text-foreground">85</div>
        <div className="text-(--ui-muted-2)">{t("stats.patients")}</div>
      </div>
    </div>
  );
}
