export async function POST(request) {
  // استخراج البيانات المرسلة في جسم الطلب
  const body = await request.json();

  // تحديد رابط خدمة النموذج (Python API)
  // في حال لم يتم تعريفه في environment variables، يتم استخدام localhost
  const modelUrl = process.env.PY_MODEL_URL || "http://127.0.0.1:8000/predict";

  // إرسال الطلب إلى نموذج الذكاء الاصطناعي
  const res = await fetch(modelUrl, {
    method: "POST", // طريقة الطلب POST
    headers: { "Content-Type": "application/json" }, // نوع المحتوى JSON
    body: JSON.stringify(body), // تحويل البيانات إلى JSON
  });

  // قراءة الاستجابة من النموذج
  const data = await res.json();

  // إعادة الاستجابة للعميل بنفس الحالة والبيانات
  return new Response(JSON.stringify(data), {
    status: res.status, // نفس حالة الاستجابة من النموذج
    headers: { "Content-Type": "application/json" }, // تعيين الهيدر
  });
}
