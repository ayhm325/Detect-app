// Security: Centralized audit logging for sensitive actions/events
import fs from 'fs';
import path from 'path';

const LOG_PATH = path.resolve(process.cwd(), 'logs', 'audit.log');

export function logAudit({ event, userId, ip, details }) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ip,
    details,
  };
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  } catch (err) {
    // In production, use a proper logging service
    console.error('Audit log error:', err);
  }
}
