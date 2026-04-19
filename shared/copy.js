// Single source of truth for user-facing strings. Popup, options page, and
// injected runtime should read from here so microcopy stays consistent and can
// be tuned in one place before store submission.

import { UNSUPPORTED_REASONS } from "./constants.js";

export const POPUP_COPY = Object.freeze({
  TITLE: "Scene Switch",
  SUBHEADING: "Turn this tab into something else.",
  TRUST_NOTE: "Runs only on this page when you click. No history tracking.",
  FIRST_RUN_HINT:
    "Pick a scene to transform this tab. It only runs on the page you\u2019re viewing.",
  SUPPORT_FOOTER: "Made you laugh? Buy me a coffee.",
  SETTINGS_LINK: "About / Settings",
  RESTORE_BUTTON: "Restore page",
  SWITCH_HINT: "Switch to another scene",
});

export const UNSUPPORTED_COPY = Object.freeze({
  DEFAULT: Object.freeze({
    title: "Scene Switch can\u2019t run on this page.",
    body:
      "Try it on normal websites like articles, shopping pages, social feeds, and video pages.",
  }),
  BY_REASON: Object.freeze({
    [UNSUPPORTED_REASONS.CHROME_INTERNAL]: Object.freeze({
      title: "Scene Switch can\u2019t run on Chrome pages.",
      body:
        "Browser internal pages like chrome:// are off-limits. Open a normal website and try again.",
    }),
    [UNSUPPORTED_REASONS.WEB_STORE]: Object.freeze({
      title: "Scene Switch can\u2019t run on the Chrome Web Store.",
      body: "Try it on a normal website instead.",
    }),
    [UNSUPPORTED_REASONS.EXTENSION_PAGE]: Object.freeze({
      title: "Scene Switch can\u2019t run on extension pages.",
      body:
        "Extension pages are protected by the browser. Open a normal website to use Scene Switch.",
    }),
    [UNSUPPORTED_REASONS.BLOCKED_DOMAIN]: Object.freeze({
      title: "Scene Switch skips this site for now.",
      body:
        "We keep away from email, documents, and checkout pages so nothing important breaks.",
    }),
    [UNSUPPORTED_REASONS.SENSITIVE_CONTEXT]: Object.freeze({
      title: "Scene Switch is staying out of the way here.",
      body:
        "This page looks like an editor or checkout. Try a normal website to see the scene.",
    }),
    [UNSUPPORTED_REASONS.UNKNOWN_SCHEME]: Object.freeze({
      title: "Scene Switch can\u2019t run on this page.",
      body: "Open a regular website (http or https) and try again.",
    }),
  }),
});

export function getUnsupportedCopy(reason) {
  return UNSUPPORTED_COPY.BY_REASON[reason] || UNSUPPORTED_COPY.DEFAULT;
}

export const ERROR_COPY = Object.freeze({
  TITLE: "Something went weird while switching this page.",
  BODY: "Try again, or reload this tab to restore everything.",
  RETRY: "Try again",
  RELOAD: "Reload tab",
});

export const SUPPORT_COPY = Object.freeze({
  CARD_TITLE: "Buy me a coffee",
  CARD_BODY:
    "If Scene Switch made your tab better, fund the next scene.",
  BUTTONS: Object.freeze({
    COFFEE: "Coffee \u2014 $3",
    DOUBLE_COFFEE: "Double Coffee \u2014 $5",
    SPONSOR_CHAOS: "Sponsor Chaos \u2014 $8",
  }),
  DISMISS: "Not now",
  HIDE: "Hide support prompts",
  FOUNDER_NOTE: "Built by one person.",
});

export const ABOUT_COPY = Object.freeze({
  WHAT_TITLE: "What Scene Switch does",
  WHAT_BODY:
    "Scene Switch transforms the current page into playful themed scenes. It runs only when you click it on a page.",
  PRIVACY_TITLE: "Privacy",
  PRIVACY_BODY: [
    "No browsing history collection.",
    "No account.",
    "No cloud sync.",
    "Settings are stored locally in your browser.",
  ],
  SUPPORTED_TITLE: "Supported pages",
  SUPPORTED_BODY:
    "Works on normal websites \u2014 articles, shopping, social feeds, wikis, and video pages.",
  UNSUPPORTED_TITLE: "Blocked pages",
  UNSUPPORTED_BODY:
    "Skipped by design: chrome:// pages, the Chrome Web Store, email (Gmail), editors (Docs/Sheets/Slides), and obvious checkout pages.",
});
