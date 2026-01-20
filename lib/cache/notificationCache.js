// Simple in-memory notification cache (replace with Redis for production)
const cache = new Map();

export function getNotificationCache(userId) {
  return cache.get(userId);
}

export function setNotificationCache(userId, count) {
  cache.set(userId, count);
}

export function clearNotificationCache(userId) {
  cache.delete(userId);
}
