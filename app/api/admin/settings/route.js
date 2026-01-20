// Security: جميع الـ API محمية بواسطة withRBAC() لتطبيق المصادقة وRBAC.
// Rate limiting و audit logging مطبّقة على جميع العمليات الحساسة للإدارة.

import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import fs from "fs/promises";
import path from "path";

// مسار ملف الإعدادات
const SETTINGS_FILE = path.resolve(process.cwd(), "data", "settings.json");

// دالة قراءة الإعدادات من ملف JSON
async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return null; // إعادة null إذا لم يوجد الملف أو حدث خطأ
  }
}

// دالة كتابة الإعدادات إلى ملف JSON
async function writeSettings(obj) {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

/////////////////////////
// GET /api/admin/settings
// جلب الإعدادات الحالية
/////////////////////////
export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited)
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

    const settings = await readSettings();
    if (!settings)
      return Response.json({ error: "Settings not found" }, { status: 404 });

    logAudit({
      event: "admin_settings_read",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
    });

    return Response.json({ settings });
  },
  ["admin"]
);

/////////////////////////
// PATCH /api/admin/settings
// تعديل الإعدادات المحددة فقط
/////////////////////////
export const PATCH = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited)
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });

    try {
      const body = await request.json();

      // تحديد المفاتيح المسموح تعديلها فقط
      const allowedKeys = [
        "systemName",
        "defaultLanguage",
        "registrationEnabled",
        "allowPatientChangeDoctor",
        "maxDoctorChangeRequests",
        "appointmentInterval",
        "rolePermissions",
        "sessionDuration",
        "enableTwoFactor",
      ];

      const current = (await readSettings()) || {};
      const updated = { ...current };

      for (const key of allowedKeys) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updated[key] = body[key];
        }
      }

      // حفظ التعديلات في الملف
      await writeSettings(updated);

      logAudit({
        event: "admin_settings_updated",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { updatedKeys: Object.keys(body) },
      });

      return Response.json({ success: true, settings: updated });
    } catch (error) {
      logAudit({
        event: "admin_settings_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }
  },
  ["admin"]
);
