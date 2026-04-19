// Thin wrapper around chrome.storage.local that always merges in defaults, so
// first-run reads never return undefined. Everything persisted here is settings
// and counters; no URLs, page text, or personal data are stored.

import { STORAGE_DEFAULTS, STORAGE_KEYS } from "./constants.js";

const STORAGE_KEY_LIST = Object.values(STORAGE_KEYS);

function withDefaults(partial) {
  const merged = { ...STORAGE_DEFAULTS };
  if (partial && typeof partial === "object") {
    for (const key of STORAGE_KEY_LIST) {
      if (Object.prototype.hasOwnProperty.call(partial, key)) {
        merged[key] = partial[key];
      }
    }
  }
  return merged;
}

export async function getSettings() {
  const stored = await chrome.storage.local.get(STORAGE_KEY_LIST);
  return withDefaults(stored);
}

export async function setSettings(partial) {
  if (!partial || typeof partial !== "object") return;
  const patch = {};
  for (const key of STORAGE_KEY_LIST) {
    if (Object.prototype.hasOwnProperty.call(partial, key)) {
      patch[key] = partial[key];
    }
  }
  if (Object.keys(patch).length === 0) return;
  await chrome.storage.local.set(patch);
}

export async function incrementUsageCount() {
  const { [STORAGE_KEYS.USAGE_COUNT]: current } = await chrome.storage.local.get(
    STORAGE_KEYS.USAGE_COUNT,
  );
  const next =
    typeof current === "number" && Number.isFinite(current) ? current + 1 : 1;
  await chrome.storage.local.set({ [STORAGE_KEYS.USAGE_COUNT]: next });
  return next;
}

export async function resetLocalData() {
  // Only remove keys this extension owns. Leaves any unrelated keys alone in
  // case future slices or other tools share chrome.storage.local.
  await chrome.storage.local.remove(STORAGE_KEY_LIST);
}

export async function ensureDefaults() {
  // Write defaults for any key that is missing. Used by the service worker on
  // install so the popup never has to race with first-run reads.
  const stored = await chrome.storage.local.get(STORAGE_KEY_LIST);
  const patch = {};
  for (const key of STORAGE_KEY_LIST) {
    if (!Object.prototype.hasOwnProperty.call(stored, key)) {
      patch[key] = STORAGE_DEFAULTS[key];
    }
  }
  if (Object.keys(patch).length > 0) {
    await chrome.storage.local.set(patch);
  }
}
