import React from "react";
import UnifiedCard from "../components/ui/UnifiedCard";

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <UnifiedCard
          key={stat.title}
          className={`rounded-2xl flex flex-col items-center ${stat.color || "border-(--ui-border)"}`}
          glass
        >
          <div className="mb-3 text-4xl">{stat.icon}</div>
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-(--ui-muted)">{stat.title}</div>
        </UnifiedCard>
      ))}
    </div>
  );
}
