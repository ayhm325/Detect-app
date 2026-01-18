import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.resolve(process.cwd(), "data", "settings.json");

async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function writeSettings(obj) {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited)
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    const s = await readSettings();
    if (!s)
      return Response.json({ error: "Settings not found" }, { status: 404 });
    logAudit({
      event: "admin_settings_read",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
    });
    return Response.json({ settings: s });
  },
  ["admin"],
);

export const PATCH = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited)
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    try {
      const body = await request.json();
      // Basic validation: only allow expected keys
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
      for (const k of allowedKeys) {
        if (Object.prototype.hasOwnProperty.call(body, k)) {
          updated[k] = body[k];
        }
      }
      await writeSettings(updated);
      logAudit({
        event: "admin_settings_updated",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { keys: Object.keys(body) },
      });
      return Response.json({ success: true, settings: updated });
    } catch (e) {
      logAudit({
        event: "admin_settings_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e.message },
      });
      return Response.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
