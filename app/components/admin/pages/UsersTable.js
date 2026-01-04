import { FaUserPlus } from "react-icons/fa";
import UserRow from "../UserRow";
import { useTranslations } from "next-intl";

export default function UsersTable({ users, onEdit, onDelete, onDetails, onAdd }) {
  const t = useTranslations("adminUsers");

  return (
    <div className="overflow-x-auto mt-8">
      <table className="min-w-full rounded-2xl border border-(--ui-border) bg-(--ui-surface)">
        <thead>
          <tr className="bg-(--ui-surface-2)">
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("table.index")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("table.name")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("table.email")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("table.role")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} onDetails={onDetails} />
          ))}
        </tbody>
      </table>
      <button className="btn-gradient mt-6 flex items-center gap-2 rounded-xl px-6 py-3 font-semibold" onClick={onAdd}>
        <FaUserPlus /> {t("buttons.addNewUser")}
      </button>
    </div>
  );
}
