// In-memory & sessionStorage cache for instant admin page rendering (SWR)
const memoryCache = new Map();

export const getCachedData = (key, fallback = null) => {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(`careconnect_admin_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
  return fallback;
};

export const setCachedData = (key, value) => {
  if (value === undefined) return;
  memoryCache.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`careconnect_admin_${key}`, JSON.stringify(value));
    }
  } catch (e) {
    // Ignore quota or serialization errors
  }
};

