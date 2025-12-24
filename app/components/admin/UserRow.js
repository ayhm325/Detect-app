import RolesBadge from "./RolesBadge";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function UserRow({ user, onEdit, onDelete, onDetails }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const rowTr = tr.usersSection?.row || {};
  return (
    <tr className="border-t border-zinc-100 hover:bg-yellow-50/40">
      <td className="py-2 px-4 text-center font-bold">{user.id}</td>
      <td className="py-2 px-4 text-center">{user.name}</td>
      <td className="py-2 px-4 text-center">{user.email}</td>
      <td className="py-2 px-4 text-center"><RolesBadge role={user.role} /></td>
      <td className="py-2 px-4 flex items-center justify-center gap-3">
        <button className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700" title={rowTr.edit || (locale === "ar" ? "تعديل" : "Edit")} onClick={() => onEdit(user)}>{rowTr.edit || (locale === "ar" ? "تعديل" : "Edit")}</button>
        <button className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700" title={rowTr.delete || (locale === "ar" ? "حذف" : "Delete")} onClick={() => onDelete(user)}>{rowTr.delete || (locale === "ar" ? "حذف" : "Delete")}</button>
        <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700" title={rowTr.details || (locale === "ar" ? "تفاصيل" : "Details")} onClick={() => onDetails(user)}>{rowTr.details || (locale === "ar" ? "تفاصيل" : "Details")}</button>
      </td>
    </tr>
  );
}
