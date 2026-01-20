// يعيد JWT المخزن في الكوكيز (عادة لاستخدامه في مصادقة Socket)
export async function GET(req) {
  try {
    // قراءة كل الكوكيز المرسلة في الهيدر
    const cookie = req.headers.get("cookie") || "";

    // البحث عن التوكن باسم "token" داخل الكوكيز
    const match = cookie.match(/token=([^;]+)/);

    if (match && match[1]) {
      // إذا وجد التوكن، إرجاعه بصيغة JSON
      return new Response(JSON.stringify({ token: match[1] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // إذا لم يوجد التوكن، إرجاع خطأ 404
    return new Response(JSON.stringify({ error: "Token not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // في حال حدوث أي خطأ داخلي، نعيد 500
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
