import { redirect } from "next/navigation";

export default function Home() {
  // إعادة توجيه المستخدم مباشرة إلى النسخة العربية من الموقع
  redirect("/ar");

  // لا حاجة لإرجاع أي JSX لأن الصفحة ستنتقل فورًا
  return null;
}
