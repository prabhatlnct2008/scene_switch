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
  // Shown when the runtime reported needsReload — retrying in place won't help.
  BODY_RELOAD: "Part of the page didn\u2019t come back cleanly. Reload this tab to finish restoring it.",
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
  SUPPORTED_EXAMPLES: [
    "News articles and blogs",
    "Shopping product pages",
    "Social feeds (Reddit, Twitter/X)",
    "Wikipedia and other wikis",
    "Video pages (YouTube)",
  ],
  UNSUPPORTED_TITLE: "Blocked pages",
  UNSUPPORTED_BODY:
    "Skipped by design: chrome:// pages, the Chrome Web Store, email (Gmail), editors (Docs/Sheets/Slides), and obvious checkout pages.",
  UNSUPPORTED_EXAMPLES: [
    "chrome:// and browser internal pages",
    "Chrome Web Store",
    "Email (Gmail, Outlook)",
    "Editors (Docs, Sheets, Slides)",
    "Banking and checkout pages",
  ],
});

export const OPTIONS_COPY = Object.freeze({
  PAGE_TITLE: "Scene Switch",
  SECTIONS: Object.freeze({
    ABOUT: "About",
    SUPPORTED: "Supported pages",
    UNSUPPORTED: "Blocked pages",
    PRIVACY: "Privacy",
    SETTINGS: "Settings",
    SUPPORT: "Support the creator",
  }),
  CONTROLS: Object.freeze({
    SUPPORT_PROMPTS_LABEL: "Show support prompts",
    SUPPORT_PROMPTS_HELP:
      "When on, an inline support card may appear after you\u2019ve used Scene Switch a few times. Turn off to hide it permanently.",
    REMEMBER_LABEL: "Remember last used scene",
    REMEMBER_HELP:
      "Highlights the scene you used most recently so it\u2019s easier to pick again.",
    PILL_LABEL: "Show on-page restore pill",
    PILL_HELP:
      "Displays a small \u201cRestore\u201d button on the page while a scene is active. Turn off to hide it.",
  }),
  RESET: Object.freeze({
    TITLE: "Reset local data",
    HELP:
      "Clears Scene Switch settings and counters from this browser. Does not touch any websites.",
    BUTTON: "Reset",
    CONFIRM:
      "This clears all Scene Switch settings and counters from this browser. Continue?",
    SUCCESS: "Local data was reset.",
  }),
  VERSION_LABEL: "Version",
  SUPPORT_THANKS:
    "Thanks for trying Scene Switch. If it made your tab better, consider chipping in below \u2014 it directly funds the next scene.",
});
