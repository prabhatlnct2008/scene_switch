// Non-scene constants: storage keys, DOM markers, thresholds, support config,
// and the enum of reasons a page can be marked unsupported.
// Scene IDs and per-scene metadata live in `scene-meta.js`.

export const STORAGE_KEYS = Object.freeze({
  USAGE_COUNT: "usageCount",
  SUPPORT_PROMPTS_ENABLED: "supportPromptsEnabled",
  SUPPORT_PROMPT_COOLDOWN_UNTIL: "supportPromptCooldownUntil",
  LAST_USED_SCENE: "lastUsedScene",
  SHOW_RESTORE_PILL: "showRestorePill",
  REMEMBER_LAST_USED_SCENE: "rememberLastUsedScene",
  FIRST_RUN_HINT_SEEN: "firstRunHintSeen",
});

export const STORAGE_DEFAULTS = Object.freeze({
  [STORAGE_KEYS.USAGE_COUNT]: 0,
  [STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED]: true,
  [STORAGE_KEYS.SUPPORT_PROMPT_COOLDOWN_UNTIL]: 0,
  [STORAGE_KEYS.LAST_USED_SCENE]: null,
  [STORAGE_KEYS.SHOW_RESTORE_PILL]: true,
  [STORAGE_KEYS.REMEMBER_LAST_USED_SCENE]: true,
  [STORAGE_KEYS.FIRST_RUN_HINT_SEEN]: false,
});

export const DOM_MARKERS = Object.freeze({
  ROOT_ID: "scene-switch-root",
  RESTORE_PILL_ID: "scene-switch-restore-pill",
  DATA_SCENE_ACTIVE: "data-scene-switch-active",
  DATA_ORIGINAL_TEXT: "data-scene-switch-original-text",
  DATA_ORIGINAL_TITLE: "data-scene-switch-original-title",
  DATA_SCENE_TOUCHED: "data-scene-switch-touched",
  STYLE_ID_PREFIX: "scene-switch-style-",
});

export const THRESHOLDS = Object.freeze({
  SUPPORT_USAGE_THRESHOLD: 3,
  SUPPORT_COOLDOWN_MS: 7 * 24 * 60 * 60 * 1000,
  TEXT_MIN_LENGTH: 2,
  TEXT_MAX_LENGTH: 80,
  MAX_NODES_PER_SCENE: 120,
});

export const UNSUPPORTED_REASONS = Object.freeze({
  CHROME_INTERNAL: "chrome_internal",
  WEB_STORE: "web_store",
  EXTENSION_PAGE: "extension_page",
  BLOCKED_DOMAIN: "blocked_domain",
  SENSITIVE_CONTEXT: "sensitive_context",
  UNKNOWN_SCHEME: "unknown_scheme",
});

// Placeholder PayPal.Me destinations. The real URL is set before store submission
// (see prd.md section 32). Keep all three presets routed to the same base URL and
// append the amount — PayPal.Me accepts /USERNAME/AMOUNT.
export const PAYPAL = Object.freeze({
  BASE_URL: "https://www.paypal.com/paypalme/scene-switch-placeholder",
  AMOUNTS: Object.freeze({
    COFFEE: 3,
    DOUBLE_COFFEE: 5,
    SPONSOR_CHAOS: 8,
  }),
});

export function buildPaypalUrl(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return PAYPAL.BASE_URL;
  }
  return `${PAYPAL.BASE_URL}/${amount}`;
}
