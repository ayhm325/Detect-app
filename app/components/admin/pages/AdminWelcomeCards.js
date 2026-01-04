import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AdminWelcomeCards() {
  const t = useTranslations("adminDashboard");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="card-glass flex flex-col items-center p-8">
        <Image src="/icons/ai.svg" alt="AI" width={56} height={56} className="mb-4" />
        <h3 className="mb-2 text-xl font-bold text-foreground">{t("welcomeCards.dashboard.title")}</h3>
        <p className="text-center text-(--ui-muted-2)">{t("welcomeCards.dashboard.description")}</p>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <Image src="/icons/users.svg" alt="Users" width={56} height={56} className="mb-4" />
        <h3 className="mb-2 text-xl font-bold text-foreground">{t("welcomeCards.users.title")}</h3>
        <p className="text-center text-(--ui-muted-2)">{t("welcomeCards.users.description")}</p>
      </div>
      <div className="card-glass flex flex-col items-center p-8">
        <Image src="/icons/settings.svg" alt="Settings" width={56} height={56} className="mb-4" />
        <h3 className="mb-2 text-xl font-bold text-foreground">{t("welcomeCards.settings.title")}</h3>
        <p className="text-center text-(--ui-muted-2)">{t("welcomeCards.settings.description")}</p>
      </div>
    </div>
  );
}
