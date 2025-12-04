import { useState } from "react";

export default function UserFormModal({ open, onClose, onSave, user }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "مريض");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded shadow-lg min-w-[320px] flex flex-col gap-4" onSubmit={e => {e.preventDefault(); onSave({ name, email, role });}}>
        <h3 className="font-bold text-lg mb-2 text-yellow-700">{user ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h3>
        <input type="text" className="border rounded px-3 py-2" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" className="border rounded px-3 py-2" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
        <select className="border rounded px-3 py-2" value={role} onChange={e => setRole(e.target.value)}>
          <option value="أدمن">أدمن</option>
          <option value="طبيب">طبيب</option>
          <option value="مريض">مريض</option>
        </select>
        <div className="flex gap-4 mt-4">
          <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">حفظ</button>
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
