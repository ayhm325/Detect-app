function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function serializeLocalizedMessage(message) {
  if (!message) return '';
  if (typeof message === 'string') return message;
  const asJson = safeJsonStringify(message);
  return asJson || String(message);
}

export function formatDateTimeForLocale(dateInput, locale) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return String(dateInput);
  }
}

export async function createNotificationBestEffort(prisma, { userId, type = 'info', message }) {
  if (!prisma || !userId) return null;
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        message: serializeLocalizedMessage(message),
        isRead: false,
        isDeleted: false
      }
    });
  } catch (e) {
    console.warn('createNotificationBestEffort failed', e && e.message);
    return null;
  }
}
