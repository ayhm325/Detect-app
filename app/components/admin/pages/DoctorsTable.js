import { FaUserMd, FaUserEdit, FaUserTimes, FaUserPlus } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function DoctorsTable() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب الأطباء من API
  useEffect(() => {
    fetch("/api/admin/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data.doctors || []);
        setLoading(false);
      })
      .catch(() => {
        setError("خطأ في جلب الأطباء");
        setLoading(false);
      });
  }, []);

  // حذف الطبيب
  const handleDelete = async (doctor) => {
    if (!window.confirm("هل أنت متأكد من حذف الطبيب؟")) return;
    try {
      await fetch(`/api/admin/doctors/${doctor.userId || doctor.id}`, { method: "DELETE" });
      setDoctors((prev) => prev.filter((d) => (d.userId || d.id) !== (doctor.userId || doctor.id)));
    } catch {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="overflow-x-auto mt-8">
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <>
          <table className="min-w-full bg-white rounded-2xl shadow-xl border border-zinc-200">
            <thead>
              <tr className="bg-linear-to-r from-yellow-100 via-red-100/40 to-white">
                <th className="py-3 px-4 text-zinc-700 font-bold">#</th>
                <th className="py-3 px-4 text-zinc-700 font-bold">الاسم</th>
                <th className="py-3 px-4 text-zinc-700 font-bold">رقم الترخيص</th>
                <th className="py-3 px-4 text-zinc-700 font-bold">رقم الجوال</th>
                <th className="py-3 px-4 text-zinc-700 font-bold">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-zinc-700 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor, i) => (
                <tr key={doctor.userId || doctor.id} className="border-t border-zinc-100 hover:bg-yellow-50/40">
                  <td className="py-2 px-4 text-center font-bold">{i + 1}</td>
                  <td className="py-2 px-4 text-center flex items-center gap-2 justify-center"><FaUserMd className="text-yellow-600" />{doctor.user?.fullName || doctor.fullName || doctor.name || "—"}</td>
                  <td className="py-2 px-4 text-center">{doctor.licenseNumber || "—"}</td>
                  <td className="py-2 px-4 text-center">{doctor.phone || "—"}</td>
                  <td className="py-2 px-4 text-center">{doctor.user?.email || doctor.email || "—"}</td>
                  <td className="py-2 px-4 flex items-center justify-center gap-3">
                    <button className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700" title="تعديل"><FaUserEdit /></button>
                    <button className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700" title="حذف" onClick={() => handleDelete(doctor)}><FaUserTimes /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-6 px-8 py-3 rounded-full bg-linear-to-r from-yellow-400 via-red-400 to-red-600 text-white font-bold text-lg shadow hover:scale-105 flex items-center gap-2 mx-auto">
            <FaUserPlus /> إضافة طبيب جديد
          </button>
        </>
      )}
    </div>
  );
}
