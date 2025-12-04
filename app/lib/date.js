export function formatDateTimeASCII(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    // Use UTC to avoid server/client timezone differences if needed
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    // Fixed ASCII-only format with no locale punctuation
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "—";
  }
}

export function formatDateASCII(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
}