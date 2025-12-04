import SpecialtyBadge from "./SpecialtyBadge";

export default function DoctorDetailsCard({ doctor, onClose }) {
  if (!doctor) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100 max-w-md mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-red-700">تفاصيل الطبيب</h3>
      <div className="mb-2"><span className="font-bold">الاسم:</span> {doctor.name}</div>
      <div className="mb-2"><span className="font-bold">البريد الإلكتروني:</span> {doctor.email}</div>
      <div className="mb-2"><span className="font-bold">التخصص:</span> <SpecialtyBadge specialty={doctor.specialty} /></div>
      <button className="mt-6 px-6 py-2 rounded-full bg-red-400 text-white font-bold" onClick={onClose}>إغلاق</button>
    </div>
  );
}
