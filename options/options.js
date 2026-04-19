// Options page controller. Slice 09 turns the scaffold into the real
// About / Settings page: static copy, three persistent toggles, a reset
// button that clears local data, and PayPal support buttons that reuse
// the popup's PayPal config. No analytics, no network calls.

import {
  PAYPAL,
  STORAGE_KEYS,
  buildPaypalUrl,
} from "../shared/constants.js";
import {
  ABOUT_COPY,
  OPTIONS_COPY,
  SUPPORT_COPY,
} from "../shared/copy.js";
import {
  ensureDefaults,
  getSettings,
  resetLocalData,
  setSettings,
} from "../shared/storage.js";

function $(selector) {
  return document.querySelector(selector);
}

function setText(selector, text) {
  const el = $(selector);
  if (el) el.textContent = text;
}

function fillList(selector, items) {
  const ul = $(selector);
  if (!ul) return;
  ul.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  }
}

function renderStaticCopy() {
  document.title = `${OPTIONS_COPY.PAGE_TITLE} \u2014 Settings`;
  setText("[data-options-title]", OPTIONS_COPY.PAGE_TITLE);

  const version = chrome.runtime?.getManifest?.()?.version || "";
  setText("[data-version-label]", `${OPTIONS_COPY.VERSION_LABEL} `);
  setText("[data-version-value]", version);

  setText('[data-section="about"]', OPTIONS_COPY.SECTIONS.ABOUT);
  setText('[data-section="supported"]', OPTIONS_COPY.SECTIONS.SUPPORTED);
  setText('[data-section="unsupported"]', OPTIONS_COPY.SECTIONS.UNSUPPORTED);
  setText('[data-section="privacy"]', OPTIONS_COPY.SECTIONS.PRIVACY);
  setText('[data-section="settings"]', OPTIONS_COPY.SECTIONS.SETTINGS);
  setText('[data-section="support"]', OPTIONS_COPY.SECTIONS.SUPPORT);

  setText("[data-about-body]", ABOUT_COPY.WHAT_BODY);
  setText("[data-supported-body]", ABOUT_COPY.SUPPORTED_BODY);
  setText("[data-unsupported-body]", ABOUT_COPY.UNSUPPORTED_BODY);
  fillList("[data-supported-examples]", ABOUT_COPY.SUPPORTED_EXAMPLES);
  fillList("[data-unsupported-examples]", ABOUT_COPY.UNSUPPORTED_EXAMPLES);
  fillList("[data-privacy-body]", ABOUT_COPY.PRIVACY_BODY);

  setText(
    "[data-label-support-prompts]",
    OPTIONS_COPY.CONTROLS.SUPPORT_PROMPTS_LABEL,
  );
  setText(
    "[data-help-support-prompts]",
    OPTIONS_COPY.CONTROLS.SUPPORT_PROMPTS_HELP,
  );
  setText("[data-label-remember-scene]", OPTIONS_COPY.CONTROLS.REMEMBER_LABEL);
  setText("[data-help-remember-scene]", OPTIONS_COPY.CONTROLS.REMEMBER_HELP);
  setText("[data-label-restore-pill]", OPTIONS_COPY.CONTROLS.PILL_LABEL);
  setText("[data-help-restore-pill]", OPTIONS_COPY.CONTROLS.PILL_HELP);

  setText("[data-reset-title]", OPTIONS_COPY.RESET.TITLE);
  setText("[data-reset-help]", OPTIONS_COPY.RESET.HELP);
  const resetBtn = $("[data-reset-button]");
  if (resetBtn) resetBtn.textContent = OPTIONS_COPY.RESET.BUTTON;

  setText("[data-support-founder]", SUPPORT_COPY.FOUNDER_NOTE);
  setText("[data-support-thanks]", OPTIONS_COPY.SUPPORT_THANKS);
}

function renderSupportButtons() {
  const container = $("[data-support-buttons]");
  if (!container) return;
  container.innerHTML = "";
  const specs = [
    { label: SUPPORT_COPY.BUTTONS.COFFEE, amount: PAYPAL.AMOUNTS.COFFEE },
    {
      label: SUPPORT_COPY.BUTTONS.DOUBLE_COFFEE,
      amount: PAYPAL.AMOUNTS.DOUBLE_COFFEE,
    },
    {
      label: SUPPORT_COPY.BUTTONS.SPONSOR_CHAOS,
      amount: PAYPAL.AMOUNTS.SPONSOR_CHAOS,
    },
  ];
  for (const spec of specs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "options__button options__button--primary";
    btn.textContent = spec.label;
    btn.addEventListener("click", () => openPaypal(spec.amount));
    container.appendChild(btn);
  }
}

function openPaypal(amount) {
  const url = buildPaypalUrl(amount);
  try {
    if (chrome.tabs && typeof chrome.tabs.create === "function") {
      chrome.tabs.create({ url, active: true });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    console.warn("[scene-switch] failed to open PayPal url", err);
  }
}

function bindToggle(selector, key) {
  const input = $(selector);
  if (!input) return null;
  input.addEventListener("change", async (event) => {
    const next = Boolean(event.target.checked);
    try {
      await setSettings({ [key]: next });
    } catch (err) {
      console.warn("[scene-switch] failed to persist setting", key, err);
    }
  });
  return input;
}

async function loadToggles() {
  const supportInput = $("[data-toggle-support-prompts]");
  const rememberInput = $("[data-toggle-remember-scene]");
  const pillInput = $("[data-toggle-restore-pill]");

  let settings = null;
  try {
    settings = await getSettings();
  } catch (err) {
    console.warn("[scene-switch] options load failed", err);
  }

  if (supportInput) {
    supportInput.checked =
      settings?.[STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED] !== false;
  }
  if (rememberInput) {
    rememberInput.checked =
      settings?.[STORAGE_KEYS.REMEMBER_LAST_USED_SCENE] !== false;
  }
  if (pillInput) {
    pillInput.checked = settings?.[STORAGE_KEYS.SHOW_RESTORE_PILL] !== false;
  }
}

function wireReset() {
  const button = $("[data-reset-button]");
  const status = $("[data-reset-status]");
  if (!button) return;
  button.addEventListener("click", async () => {
    if (!window.confirm(OPTIONS_COPY.RESET.CONFIRM)) return;
    try {
      await resetLocalData();
      await ensureDefaults();
    } catch (err) {
      console.warn("[scene-switch] resetLocalData failed", err);
      if (status) status.textContent = "";
      return;
    }
    // Refresh the toggles so they reflect the freshly written defaults.
    await loadToggles();
    if (status) {
      status.textContent = OPTIONS_COPY.RESET.SUCCESS;
      // Clear the status after a few seconds so it doesn't linger.
      setTimeout(() => {
        if (status.textContent === OPTIONS_COPY.RESET.SUCCESS) {
          status.textContent = "";
        }
      }, 4000);
    }
  });
}

async function init() {
  renderStaticCopy();
  renderSupportButtons();
  bindToggle("[data-toggle-support-prompts]", STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED);
  bindToggle("[data-toggle-remember-scene]", STORAGE_KEYS.REMEMBER_LAST_USED_SCENE);
  bindToggle("[data-toggle-restore-pill]", STORAGE_KEYS.SHOW_RESTORE_PILL);
  wireReset();
  await loadToggles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
