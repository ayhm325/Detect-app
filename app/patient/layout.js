import React from "react";

// بيانات الميتاداتا للصفحة (مثل العنوان)
export const metadata = {
  title: "Patient",
};

/**
 * Layout خاص بمنطقة المريض
 * يحدد الخلفية ويغطي كامل مساحة الشاشة
 * @param {React.ReactNode} children المحتوى الداخلي للصفحة
 */
export default function PatientLayout({ children }) {
  // إعدادات النمط لتحديد لون خلفية موحد للمنطقة
  const style = {
    // تحديد متغير CSS للون الخلفية، يمكن استخدامه في البطاقات والمكونات الفرعية
    "--color-background": "#DFF2E5",
    // ضمان وجود خلفية واضحة خلف البطاقات الداخلية
    backgroundColor: "#DFF2E5",
    // تغطية كامل ارتفاع الشاشة
    minHeight: "100vh",
  };

  return (
    <div style={style} className="min-h-screen">
      {children /* سيتم وضع المحتوى الفرعي هنا */}
    </div>
  );
}
