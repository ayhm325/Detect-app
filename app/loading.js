"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--ui-surface) text-(--ui-foreground)">
      <div className="text-center">
        {/* شعار متحرك */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* خلفية متوهجة مع تأثير blur و pulse */}
          <div className="absolute inset-0 brand-gradient rounded-full animate-pulse opacity-20 blur-xl" />
          
          {/* دائرة دوارة مع تأثير gradient */}
          <div
            className="absolute inset-0 brand-gradient rounded-full animate-spin"
            style={{ animationDuration: "3s" }} // سرعة الدوران
          >
            {/* طبقة داخلية لتفريغ وسط الدائرة */}
            <div className="absolute inset-2 bg-(--ui-surface) rounded-full" />
          </div>

          {/* أيقونة في مركز الشعار */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-(--ui-ring)"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
        </div>

        {/* شريط التحميل */}
        <div className="w-64 h-2 bg-(--ui-surface-2) rounded-full overflow-hidden mx-auto border border-(--ui-border)">
          <div className="h-full brand-gradient animate-gradient bg-size-[200%_100%]" />
        </div>

        {/* نقاط التحميل المتحركة */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-(--ui-ring) rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} // تأخير متتابع للنقاط
            />
          ))}
        </div>
      </div>
    </div>
  );
}
