// Security: Centralized audit logging for sensitive actions/events
import fs from "fs";
import path from "path";

const LOG_PATH = path.resolve(process.cwd(), "logs", "audit.log");

export function logAudit({ event, userId, ip, details }) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ip,
    details,
  };
  try {
    // Ensure the logs directory exists to avoid ENOENT in dev
    const dir = path.dirname(LOG_PATH);
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (mkdirErr) {
      // ignore — we'll surface error if append fails
    }

    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n");
  } catch (err) {
    // In production, use a proper logging service
    console.error("Audit log error:", err);
  }
}
