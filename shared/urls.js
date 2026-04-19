// URL eligibility rules and a helper for reading the active tab.
// Kept intentionally explicit. Per the PRD we\u2019d rather be too conservative
// than accidentally run on email, checkout, or editor pages.

import { UNSUPPORTED_REASONS } from "./constants.js";

const CHROME_INTERNAL_SCHEMES = [
  "chrome:",
  "chrome-search:",
  "chrome-devtools:",
  "devtools:",
  "edge:",
  "brave:",
  "opera:",
  "vivaldi:",
  "about:",
  "view-source:",
];

const EXTENSION_SCHEMES = ["chrome-extension:", "moz-extension:", "safari-web-extension:"];

const SUPPORTED_SCHEMES = ["http:", "https:", "file:", "ftp:"];

const WEB_STORE_HOSTS = [
  "chromewebstore.google.com",
  "chrome.google.com", // /webstore paths
];

// Full-hostname matches. These map to BLOCKED_DOMAIN.
const BLOCKED_HOSTS = new Set([
  // Email
  "mail.google.com",
  "outlook.live.com",
  "outlook.office.com",
  "outlook.office365.com",
  // Google editors (Docs / Sheets / Slides are all served from docs.google.com)
  "docs.google.com",
  "sheets.google.com",
  "slides.google.com",
]);

// Path-based heuristics on any host. These map to SENSITIVE_CONTEXT.
// Intentionally narrow so we don\u2019t block, say, a blog post titled "checkout".
const SENSITIVE_PATH_PATTERNS = [
  /(^|\/)checkout(\/|$)/i,
  /(^|\/)cart\/checkout(\/|$)/i,
  /(^|\/)payment(s)?(\/|$)/i,
  /(^|\/)billing(\/|$)/i,
  /(^|\/)pay(\/|$)/i,
];

function parseUrl(url) {
  if (typeof url !== "string" || url.length === 0) return null;
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function matchesChromeWebStore(parsed) {
  if (parsed.hostname === "chromewebstore.google.com") return true;
  if (parsed.hostname === "chrome.google.com" && parsed.pathname.startsWith("/webstore")) {
    return true;
  }
  return false;
}

export function checkUrlEligibility(url) {
  const parsed = parseUrl(url);
  if (!parsed) {
    return { supported: false, reason: UNSUPPORTED_REASONS.UNKNOWN_SCHEME };
  }

  const scheme = parsed.protocol;

  if (CHROME_INTERNAL_SCHEMES.includes(scheme)) {
    return { supported: false, reason: UNSUPPORTED_REASONS.CHROME_INTERNAL };
  }

  if (EXTENSION_SCHEMES.includes(scheme)) {
    return { supported: false, reason: UNSUPPORTED_REASONS.EXTENSION_PAGE };
  }

  if (!SUPPORTED_SCHEMES.includes(scheme)) {
    return { supported: false, reason: UNSUPPORTED_REASONS.UNKNOWN_SCHEME };
  }

  if (matchesChromeWebStore(parsed)) {
    return { supported: false, reason: UNSUPPORTED_REASONS.WEB_STORE };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(hostname)) {
    return { supported: false, reason: UNSUPPORTED_REASONS.BLOCKED_DOMAIN };
  }

  const path = parsed.pathname || "";
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(path)) {
      return { supported: false, reason: UNSUPPORTED_REASONS.SENSITIVE_CONTEXT };
    }
  }

  return { supported: true, reason: null };
}

// Convenience: returns the reason string when unsupported, null when supported.
export function isUnsupportedUrl(url) {
  const { supported, reason } = checkUrlEligibility(url);
  return supported ? null : reason;
}

// Read the active tab in the current window. Works from both popup and service
// worker contexts. Returns { id, url } or null if the tab or URL is unavailable.
// With the activeTab permission, the URL is only populated after the user
// invokes the extension, which matches the PRD\u2019s "runs only when invited" rule.
export async function getActiveTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || typeof tab.id !== "number") return null;
    return { id: tab.id, url: tab.url || null };
  } catch {
    return null;
  }
}
