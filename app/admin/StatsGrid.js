import React from "react";
import UnifiedCard from "../components/ui/UnifiedCard";

/**
 * StatsGrid
 * شبكة تعرض إحصاءات بشكل بطاقات موحدة (UnifiedCard)
 *
 * @param {Array} stats - مصفوفة الإحصاءات، كل عنصر يحتوي على:
 *   - title: عنوان الإحصاء
 *   - value: القيمة الرقمية أو النصية
 *   - icon: أيقونة (React element)
 *   - color: لون الحدود أو الخلفية الاختياري
 */
export default function StatsGrid({ stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="text-sm text-(--ui-muted)">
        No statistics available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <UnifiedCard
          key={stat.title || idx} // fallback للـ key في حال كان العنوان مكرر
          className={`rounded-2xl flex flex-col items-center justify-center p-4 ${
            stat.color || "border-(--ui-border)"
          }`}
          glass
        >
          {/* أيقونة الإحصاء */}
          <div className="mb-3 text-4xl">{stat.icon}</div>

          {/* القيمة الرئيسية */}
          <div className="text-2xl font-bold mb-1">{stat.value}</div>

          {/* عنوان الإحصاء */}
          <div className="text-(--ui-muted) text-center">{stat.title}</div>
        </UnifiedCard>
      ))}
    </div>
  );
}
