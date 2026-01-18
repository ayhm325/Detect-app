export function formatDateTime(iso, locale = "ar-EG", placeholder = "") {
  if (!iso) return placeholder;
  try {
    const d = new Date(iso);
    const l = String(locale || "").toLowerCase();
    const resolved = l.startsWith("en")
      ? "en-US"
      : l.startsWith("ar")
        ? "ar-EG"
        : locale;
    return d.toLocaleString(resolved, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting date time:", e);
    return placeholder;
  }
}

export function formatDate(iso, locale = "ar-EG", placeholder = "") {
  if (!iso) return placeholder;
  try {
    const d = new Date(iso);
    const l = String(locale || "").toLowerCase();
    const resolved = l.startsWith("en")
      ? "en-US"
      : l.startsWith("ar")
        ? "ar-EG"
        : locale;
    return d.toLocaleDateString(resolved, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return placeholder;
  }
}

export function formatTime(iso, locale = "ar-EG", placeholder = "") {
  if (!iso) return placeholder;
  try {
    const d = new Date(iso);
    const l = String(locale || "").toLowerCase();
    const resolved = l.startsWith("en")
      ? "en-US"
      : l.startsWith("ar")
        ? "ar-EG"
        : locale;
    return d.toLocaleTimeString(resolved, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return placeholder;
  }
}

// Keep old functions for backward compatibility
export const formatDateTimeASCII = (iso, placeholder = "") =>
  formatDateTime(iso, "en", placeholder);
export const formatDateASCII = (iso, placeholder = "") =>
  formatDate(iso, "en", placeholder);
