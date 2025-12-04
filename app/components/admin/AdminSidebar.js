import React from "react";
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-64 h-full bg-white shadow-lg p-4">
      {/* قائمة التنقل الجانبية */}
      <nav>
        <ul className="space-y-4">
          <li><Link href="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">لوحة التحكم</Link></li>
          <li><Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">المستخدمين</Link></li>
          <li><Link href="/admin/patients" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">المرضى</Link></li>
          <li><Link href="/admin/doctors" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">الأطباء</Link></li>
          <li><Link href="/admin/analysis" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">التحليلات</Link></li>
          <li><Link href="/admin/settings" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">الإعدادات</Link></li>
          <li><Link href="/admin/logout" className="block px-4 py-2 rounded hover:bg-yellow-100 font-bold">تسجيل الخروج</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
