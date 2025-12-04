import { useState } from "react";

export default function PatientFormModal({ open, onClose, onSave, patient }) {
  const [name, setName] = useState(patient?.name || "");
  const [age, setAge] = useState(patient?.age || "");
  const [email, setEmail] = useState(patient?.email || "");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded shadow-lg min-w-[320px] flex flex-col gap-4" onSubmit={e => {e.preventDefault(); onSave({ name, age, email });}}>
        <h3 className="font-bold text-lg mb-2 text-yellow-700">{patient ? "تعديل مريض" : "إضافة مريض جديد"}</h3>
        <input type="text" className="border rounded px-3 py-2" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" className="border rounded px-3 py-2" placeholder="العمر" value={age} onChange={e => setAge(e.target.value)} required />
        <input type="email" className="border rounded px-3 py-2" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
        <div className="flex gap-4 mt-4">
          <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">حفظ</button>
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
