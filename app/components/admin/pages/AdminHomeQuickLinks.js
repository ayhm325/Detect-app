import { FaUserMd, FaUserInjured, FaChartBar, FaComments, FaCogs } from "react-icons/fa";

export default function AdminHomeQuickLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-12">
      <a href="/admin/dashboard" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-100 border-2 border-yellow-200 shadow group transition">
        <FaChartBar className="text-4xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">لوحة التحكم</span>
      </a>
      <a href="/admin/analysis" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-blue-100 border-2 border-blue-200 shadow group transition">
        <FaChartBar className="text-4xl text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">تحليل الأشعة</span>
      </a>
      <a href="/admin/doctors" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-red-100 border-2 border-red-200 shadow group transition">
        <FaUserMd className="text-4xl text-red-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">الأطباء</span>
      </a>
      <a href="/admin/patients" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-50 border-2 border-yellow-300 shadow group transition">
        <FaUserInjured className="text-4xl text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">المرضى</span>
      </a>
      <a href="/admin/chat" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-red-50 border-2 border-red-300 shadow group transition">
        <FaComments className="text-4xl text-red-400 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">الدردشة</span>
      </a>
      <a href="/admin/settings" className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-50 border-2 border-yellow-400 shadow group transition">
        <FaCogs className="text-4xl text-yellow-700 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">الإعدادات</span>
      </a>
    </div>
  );
}
