// Test helper: generate clientKey for optimistic messages
export function generateClientKey() {
  // lightweight UUID-like generation for client-side usage in tests
  return `ck-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
}
