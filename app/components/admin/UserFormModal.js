import { useState } from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function UserFormModal({ open, onClose, onSave, user }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const formTr = tr.usersSection?.form || {};
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || (locale === "ar" ? "مريض" : "Patient"));
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl min-w-100 max-w-125 w-full flex flex-col gap-5 border border-gray-200 dark:border-zinc-800" onSubmit={e => {e.preventDefault(); onSave({ name, email, role });}}>
        <h3 className="font-bold text-2xl mb-2 bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">{user ? (formTr.editTitle || (locale === "ar" ? "تعديل مستخدم" : "Edit User")) : (formTr.addTitle || (locale === "ar" ? "إضافة مستخدم جديد" : "Add New User"))}</h3>
        <input type="text" className="border-2 border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all" placeholder={formTr.name || (locale === "ar" ? "الاسم" : "Name")} value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" className="border-2 border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all" placeholder={formTr.email || (locale === "ar" ? "البريد الإلكتروني" : "Email")} value={email} onChange={e => setEmail(e.target.value)} required />
        <select className="border-2 border-gray-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all" value={role} onChange={e => setRole(e.target.value)}>
          <option value={formTr.admin || (locale === "ar" ? "أدمن" : "Admin")}>{formTr.admin || (locale === "ar" ? "أدمن" : "Admin")}</option>
          <option value={formTr.doctor || (locale === "ar" ? "طبيب" : "Doctor")}>{formTr.doctor || (locale === "ar" ? "طبيب" : "Doctor")}</option>
          <option value={formTr.patient || (locale === "ar" ? "مريض" : "Patient")}>{formTr.patient || (locale === "ar" ? "مريض" : "Patient")}</option>
        </select>
        <div className="flex gap-3 mt-4">
          <button type="submit" className="flex-1 px-6 py-3 bg-linear-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]">{formTr.save || (locale === "ar" ? "حفظ" : "Save")}</button>
          <button type="button" className="flex-1 px-6 py-3 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all" onClick={onClose}>{formTr.cancel || (locale === "ar" ? "إلغاء" : "Cancel")}</button>
        </div>
      </form>
    </div>
  );
}
