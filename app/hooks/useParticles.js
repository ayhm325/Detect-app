import { useState, useEffect } from "react";

/**
 * إنشاء مصفوفة من الجزيئات (Particles) مع خصائص عشوائية
 * @param {number} count عدد الجزيئات المطلوب توليدها
 */
function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i, // معرف فريد لكل جزيء
    x: Math.random() * 100, // موقع X (نسبة مئوية)
    y: Math.random() * 100, // موقع Y (نسبة مئوية)
    size: Math.random() * 3 + 1, // حجم الجزيء
    duration: Math.random() * 10 + 15, // مدة الحركة
    delay: Math.random() * 5, // تأخير الحركة
    color: ["yellow", "orange", "red"][Math.floor(Math.random() * 3)], // لون الجزيء
    vx: Math.random() * 2 - 1, // سرعة الحركة X
    vy: Math.random() * 2 - 1, // سرعة الحركة Y
  }));
}

/**
 * هوك لإرجاع الجزيئات الجاهزة للعرض
 * @param {number} count عدد الجزيئات
 * @returns {Array} مصفوفة الجزيئات
 */
export function useParticles(count = 15) {
  return generateParticles(count);
}

/**
 * هوك لتتبع حركة الماوس (Parallax)
 * @returns {Object} موقع الماوس { x, y }
 */
export function useMouseParallax() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePos;
}

/**
 * هوك لعرض إحصائيات متحركة (Animated Stats)
 * يحاكي أرقام تتغير بشكل دوري لإضفاء حركة حية
 * @param {Object} initial القيم الابتدائية للإحصائيات
 * @returns {Object} الإحصائيات الحالية { users, analyses, accuracy }
 */
export function useAnimatedStats(
  initial = { users: 0, analyses: 0, accuracy: 0 },
) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const animateStats = () => {
      setStats({
        users: Math.min(4500 + Math.random() * 500, 5000), // عدد المستخدمين
        analyses: Math.min(28000 + Math.random() * 2000, 30000), // عدد التحليلات
        accuracy: Math.min(97.8 + Math.random() * 2, 99.9), // دقة
      });
    };
    const interval = setInterval(animateStats, 3000); // تحديث كل 3 ثوانٍ
    return () => clearInterval(interval); // تنظيف المؤقت عند إلغاء التركيب
  }, []);

  return stats;
}
