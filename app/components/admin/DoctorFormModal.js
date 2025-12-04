import { useState } from "react";

export default function DoctorFormModal({ open, onClose, onSave, doctor }) {
  const [name, setName] = useState(doctor?.name || "");
  const [email, setEmail] = useState(doctor?.email || "");
  const [specialty, setSpecialty] = useState(doctor?.specialty || "أشعة");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded shadow-lg min-w-[320px] flex flex-col gap-4" onSubmit={e => {e.preventDefault(); onSave({ name, email, specialty });}}>
        <h3 className="font-bold text-lg mb-2 text-red-700">{doctor ? "تعديل طبيب" : "إضافة طبيب جديد"}</h3>
        <input type="text" className="border rounded px-3 py-2" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" className="border rounded px-3 py-2" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
        <select className="border rounded px-3 py-2" value={specialty} onChange={e => setSpecialty(e.target.value)}>
          <option value="أشعة">أشعة</option>
          <option value="صدرية">صدرية</option>
          <option value="عظام">عظام</option>
        </select>
        <div className="flex gap-4 mt-4">
          <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded">حفظ</button>
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
