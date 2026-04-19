// Popup shell and screen renderer.
//
// Owns the popup state machine: default | applying | applied | unsupported |
// error. Slice 02 set up the UI shape; Slice 03 replaces the stubbed action
// handlers with real service-worker messages.

import { PAYPAL, STORAGE_KEYS, buildPaypalUrl } from "../shared/constants.js";
import {
  ERROR_COPY,
  POPUP_COPY,
  SUPPORT_COPY,
  getUnsupportedCopy,
} from "../shared/copy.js";
import { SCENES, getSceneById, isValidSceneId } from "../shared/scene-meta.js";
import {
  disableSupportPrompts,
  getSettings,
  incrementUsageCount,
  isSupportPromptEligible,
  setSettings,
  snoozeSupportPrompts,
} from "../shared/storage.js";
import { checkUrlEligibility, getActiveTabInfo } from "../shared/urls.js";

const state = {
  popupState: "loading", // loading | default | applying | applied | unsupported | error
  activeTab: null,
  currentScene: null,
  unsupportedReason: null,
  errorReason: null,
  needsReload: false,
  isFirstRun: false,
  lastUsedScene: null,
  // Support card inputs. `supportEligible` is the result of the three-gate
  // check (usage/enabled/cooldown). `supportExpanded` means "render the card
  // right now" — true when eligibility fires automatically, or when the user
  // opens the footer manually. `supportDismissedThisSession` suppresses the
  // card after Not now / Hide so one popup session stays calm.
  supportEligible: false,
  supportExpanded: false,
  supportDismissedThisSession: false,
  usageCount: 0,
  supportPromptsEnabled: true,
  supportPromptCooldownUntil: 0,
};

function $(selector) {
  return document.querySelector(selector);
}

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function sendMessage(message) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "[scene-switch] sendMessage failed",
            chrome.runtime.lastError,
          );
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    } catch (err) {
      console.warn("[scene-switch] sendMessage threw", err);
      resolve(null);
    }
  });
}

function renderStaticCopy() {
  const title = $("[data-popup-title]");
  if (title) title.textContent = POPUP_COPY.TITLE;
  const subheading = $("[data-popup-subheading]");
  if (subheading) subheading.textContent = POPUP_COPY.SUBHEADING;
  const trust = $("[data-popup-trust]");
  if (trust) trust.textContent = POPUP_COPY.TRUST_NOTE;
  const support = $("[data-popup-support-footer]");
  if (support) support.textContent = POPUP_COPY.SUPPORT_FOOTER;
}

function setBodyBusy(busy) {
  const body = $("[data-popup-body]");
  if (body) body.setAttribute("aria-busy", busy ? "true" : "false");
}

function clearBody() {
  const body = $("[data-popup-body]");
  if (body) body.innerHTML = "";
  return body;
}

function createStatus({ state: dataState, title, line, spinner = false }) {
  const status = document.createElement("section");
  status.className = "popup__status";
  status.setAttribute("data-state", dataState);
  if (title) {
    const titleEl = document.createElement("p");
    titleEl.className = "popup__status-title";
    titleEl.textContent = title;
    status.appendChild(titleEl);
  }
  const lineEl = document.createElement("p");
  lineEl.className = "popup__status-line";
  if (spinner) {
    const spinnerEl = document.createElement("span");
    spinnerEl.className = "popup__spinner";
    spinnerEl.setAttribute("aria-hidden", "true");
    lineEl.appendChild(spinnerEl);
  }
  lineEl.appendChild(document.createTextNode(line));
  status.appendChild(lineEl);
  return status;
}

function createHint() {
  const wrap = document.createElement("div");
  wrap.className = "popup__hint";
  wrap.setAttribute("role", "note");

  const text = document.createElement("span");
  text.textContent = POPUP_COPY.FIRST_RUN_HINT;
  wrap.appendChild(text);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "popup__hint-close";
  close.setAttribute("aria-label", "Dismiss hint");
  close.textContent = "\u00d7";
  close.addEventListener("click", dismissHint);
  wrap.appendChild(close);

  return wrap;
}

function createSceneCard(scene, { disabled = false } = {}) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "scene-card";
  card.setAttribute("data-scene-id", scene.id);
  card.setAttribute("aria-label", `${scene.name}. ${scene.descriptor}`);
  if (disabled) card.disabled = true;

  const name = document.createElement("span");
  name.className = "scene-card__name";
  name.textContent = scene.name;
  if (state.lastUsedScene === scene.id) {
    const badge = document.createElement("span");
    badge.className = "scene-card__last-used";
    badge.textContent = "Last used";
    name.appendChild(document.createTextNode(" "));
    name.appendChild(badge);
  }
  card.appendChild(name);

  const desc = document.createElement("span");
  desc.className = "scene-card__descriptor";
  desc.textContent = scene.descriptor;
  card.appendChild(desc);

  card.addEventListener("click", () => onSceneClick(scene.id));
  return card;
}

function renderDefault() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(false);

  if (state.isFirstRun) {
    body.appendChild(createHint());
  }

  const scenes = document.createElement("div");
  scenes.className = "popup__scenes";
  for (const scene of SCENES) {
    scenes.appendChild(createSceneCard(scene));
  }
  body.appendChild(scenes);

  maybeAppendSupportCard(body);
}

function renderApplying() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(true);

  const scene = getSceneById(state.currentScene);
  const line = scene ? scene.applyingCopy : "Applying scene\u2026";
  body.appendChild(
    createStatus({ state: "applying", line, spinner: true }),
  );
}

function renderApplied() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(false);

  const scene = getSceneById(state.currentScene);
  const title = scene ? scene.activeBadge : "Scene is live";
  body.appendChild(
    createStatus({
      state: "applied",
      title,
      line: "Restore the page anytime, or switch to another scene.",
    }),
  );

  const actions = document.createElement("div");
  actions.className = "popup__actions";

  const restore = document.createElement("button");
  restore.type = "button";
  restore.className = "popup__button popup__button--primary";
  restore.textContent = POPUP_COPY.RESTORE_BUTTON;
  restore.addEventListener("click", onRestoreClick);
  actions.appendChild(restore);

  body.appendChild(actions);

  const switchLabel = document.createElement("p");
  switchLabel.className = "popup__switch-label";
  switchLabel.textContent = POPUP_COPY.SWITCH_HINT;
  body.appendChild(switchLabel);

  const scenes = document.createElement("div");
  scenes.className = "popup__scenes";
  for (const other of SCENES) {
    if (other.id === state.currentScene) continue;
    scenes.appendChild(createSceneCard(other));
  }
  body.appendChild(scenes);

  maybeAppendSupportCard(body);
}

function renderUnsupported() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(false);
  const copy = getUnsupportedCopy(state.unsupportedReason);
  body.appendChild(
    createStatus({
      state: "unsupported",
      title: copy.title,
      line: copy.body,
    }),
  );
}

function renderError() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(false);
  body.appendChild(
    createStatus({
      state: "error",
      title: ERROR_COPY.TITLE,
      line: state.needsReload ? ERROR_COPY.BODY_RELOAD : ERROR_COPY.BODY,
    }),
  );

  const actions = document.createElement("div");
  actions.className = "popup__actions";

  // When the runtime flagged needsReload, retrying in-place won't help. Make
  // Reload the primary so the escape hatch is unambiguous.
  const primaryIsReload = Boolean(state.needsReload);

  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = primaryIsReload
    ? "popup__button"
    : "popup__button popup__button--primary";
  retry.textContent = ERROR_COPY.RETRY;
  retry.addEventListener("click", onRetryClick);

  const reload = document.createElement("button");
  reload.type = "button";
  reload.className = primaryIsReload
    ? "popup__button popup__button--primary"
    : "popup__button";
  reload.textContent = ERROR_COPY.RELOAD;
  reload.addEventListener("click", onReloadClick);

  if (primaryIsReload) {
    actions.appendChild(reload);
    actions.appendChild(retry);
  } else {
    actions.appendChild(retry);
    actions.appendChild(reload);
  }

  body.appendChild(actions);

  // Secondary escape hatch: About / Settings gives the user somewhere to go
  // when both recovery buttons feel wrong.
  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "popup__text-link";
  settings.textContent = POPUP_COPY.SETTINGS_LINK;
  settings.addEventListener("click", openSettings);
  body.appendChild(settings);
}

function shouldShowSupportCard() {
  if (state.supportDismissedThisSession) return false;
  if (state.supportExpanded) return true;
  return state.supportEligible;
}

function maybeAppendSupportCard(body) {
  if (!shouldShowSupportCard()) return;
  body.appendChild(createSupportCard());
}

function createSupportCard() {
  const card = document.createElement("section");
  card.className = "popup__support";
  card.setAttribute("aria-label", SUPPORT_COPY.CARD_TITLE);

  const title = document.createElement("p");
  title.className = "popup__support-title";
  title.textContent = SUPPORT_COPY.CARD_TITLE;
  card.appendChild(title);

  const body = document.createElement("p");
  body.className = "popup__support-body";
  body.textContent = SUPPORT_COPY.CARD_BODY;
  card.appendChild(body);

  const amountButtons = document.createElement("div");
  amountButtons.className = "popup__support-amounts";
  const amountSpecs = [
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
  for (const spec of amountSpecs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "popup__button popup__button--primary popup__support-amount";
    btn.textContent = spec.label;
    btn.addEventListener("click", () => onSupportAmountClick(spec.amount));
    amountButtons.appendChild(btn);
  }
  card.appendChild(amountButtons);

  const founder = document.createElement("p");
  founder.className = "popup__support-founder";
  founder.textContent = SUPPORT_COPY.FOUNDER_NOTE;
  card.appendChild(founder);

  const secondary = document.createElement("div");
  secondary.className = "popup__support-secondary";

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "popup__text-link";
  dismiss.textContent = SUPPORT_COPY.DISMISS;
  dismiss.addEventListener("click", onSupportDismiss);
  secondary.appendChild(dismiss);

  const hide = document.createElement("button");
  hide.type = "button";
  hide.className = "popup__text-link";
  hide.textContent = SUPPORT_COPY.HIDE;
  hide.addEventListener("click", onSupportHide);
  secondary.appendChild(hide);

  card.appendChild(secondary);
  return card;
}

function renderLoading() {
  const body = clearBody();
  if (!body) return;
  setBodyBusy(true);
  body.appendChild(
    createStatus({
      state: "loading",
      line: "Checking this page\u2026",
      spinner: true,
    }),
  );
}

function render() {
  switch (state.popupState) {
    case "default":
      renderDefault();
      break;
    case "applying":
      renderApplying();
      break;
    case "applied":
      renderApplied();
      break;
    case "unsupported":
      renderUnsupported();
      break;
    case "error":
      renderError();
      break;
    case "loading":
    default:
      renderLoading();
      break;
  }
}

// --- Actions ----------------------------------------------------------------

async function onSceneClick(sceneId) {
  if (state.popupState === "applying") return;
  if (!isValidSceneId(sceneId)) return;
  setState({ popupState: "applying", currentScene: sceneId });

  const response = await sendMessage({ type: "apply-scene", sceneId });
  if (!response || !response.ok) {
    // Unsupported is a distinct screen with its own copy — don't drop it into
    // the generic error recovery flow. The runtime-level DOM check can surface
    // unsupported on a URL that looked fine pre-click.
    if (response?.reason === "unsupported_page") {
      setState({
        popupState: "unsupported",
        unsupportedReason: response?.subReason || null,
        currentScene: null,
      });
      return;
    }
    setState({
      popupState: "error",
      errorReason: response?.reason || "apply_failed",
      needsReload: Boolean(response?.needsReload),
    });
    return;
  }

  try {
    // Remember-last-used is opt-in via the rememberLastUsedScene setting. The
    // popup init layer already honors that toggle; here we just persist the id.
    // Also flip firstRunHintSeen so the onboarding nudge stops showing once
    // the user has successfully applied at least one scene.
    const [, nextUsage] = await Promise.all([
      setSettings({
        [STORAGE_KEYS.LAST_USED_SCENE]: sceneId,
        [STORAGE_KEYS.FIRST_RUN_HINT_SEEN]: true,
      }),
      incrementUsageCount(),
    ]);
    if (typeof nextUsage === "number") {
      state.usageCount = nextUsage;
    }
  } catch (err) {
    console.warn("[scene-switch] failed to persist post-apply settings", err);
  }

  // Usage just ticked up; the card may now be eligible. Only auto-expand when
  // the user hasn't already dismissed it this popup session.
  recomputeSupportEligibility();

  setState({
    popupState: "applied",
    currentScene: response.sceneId || sceneId,
    errorReason: null,
    needsReload: false,
    lastUsedScene: sceneId,
    isFirstRun: false,
  });
}

async function onRestoreClick() {
  const response = await sendMessage({ type: "restore-scene" });
  if (!response || !response.ok) {
    // A failed restore almost always wants the reload escape hatch so the user
    // is never stranded with partial state. Honor the flag the runtime sent,
    // and default to true if the field is missing.
    setState({
      popupState: "error",
      errorReason: response?.reason || "restore_failed",
      needsReload: response?.needsReload !== false,
    });
    return;
  }
  setState({
    popupState: "default",
    currentScene: null,
    errorReason: null,
    needsReload: false,
  });
}

async function onRetryClick() {
  // If we were mid-apply, re-try the same scene; otherwise fall back to a
  // fresh default render so the user can pick again.
  if (state.currentScene && isValidSceneId(state.currentScene)) {
    onSceneClick(state.currentScene);
    return;
  }
  setState({
    popupState: "default",
    errorReason: null,
    needsReload: false,
  });
}

async function onReloadClick() {
  await sendMessage({ type: "reload-active-tab" });
  window.close();
}

async function dismissHint() {
  setState({ isFirstRun: false });
  try {
    await setSettings({ [STORAGE_KEYS.FIRST_RUN_HINT_SEEN]: true });
  } catch (err) {
    console.warn("[scene-switch] failed to persist firstRunHintSeen", err);
  }
}

function openSupport() {
  // The footer link is always visible; clicking it forces the expanded card
  // open even when the eligibility gate hasn't fired yet. This is the
  // "user-initiated" path the PRD calls out.
  setState({
    supportExpanded: true,
    supportDismissedThisSession: false,
  });
}

function openPaypalUrl(amount) {
  const url = buildPaypalUrl(amount);
  try {
    // chrome.tabs.create opens a new tab without requiring the "tabs"
    // permission. Fall back to window.open if the API is unavailable.
    if (chrome.tabs && typeof chrome.tabs.create === "function") {
      chrome.tabs.create({ url, active: true });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (err) {
    console.warn("[scene-switch] failed to open PayPal url", err);
  }
}

function onSupportAmountClick(amount) {
  openPaypalUrl(amount);
  // Close the popup after sending the user to PayPal so they aren't left
  // staring at stale UI. The open tab is their new focus.
  window.close();
}

async function onSupportDismiss() {
  setState({
    supportDismissedThisSession: true,
    supportExpanded: false,
    supportEligible: false,
  });
  try {
    const until = await snoozeSupportPrompts();
    state.supportPromptCooldownUntil = until;
  } catch (err) {
    console.warn("[scene-switch] snoozeSupportPrompts failed", err);
  }
}

async function onSupportHide() {
  setState({
    supportDismissedThisSession: true,
    supportExpanded: false,
    supportEligible: false,
    supportPromptsEnabled: false,
  });
  try {
    await disableSupportPrompts();
  } catch (err) {
    console.warn("[scene-switch] disableSupportPrompts failed", err);
  }
}

function recomputeSupportEligibility() {
  const eligible = isSupportPromptEligible({
    [STORAGE_KEYS.USAGE_COUNT]: state.usageCount,
    [STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED]: state.supportPromptsEnabled,
    [STORAGE_KEYS.SUPPORT_PROMPT_COOLDOWN_UNTIL]:
      state.supportPromptCooldownUntil,
  });
  state.supportEligible = eligible;
  return eligible;
}

function openSettings() {
  if (chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  }
}

// --- Bootstrap --------------------------------------------------------------

async function init() {
  renderStaticCopy();

  const settingsButton = $("[data-open-settings]");
  if (settingsButton) settingsButton.addEventListener("click", openSettings);
  const supportButton = $("[data-open-support]");
  if (supportButton) supportButton.addEventListener("click", openSupport);

  render(); // shows "loading" first

  const [tab, settings] = await Promise.all([
    getActiveTabInfo(),
    getSettings().catch((err) => {
      console.warn("[scene-switch] settings load failed", err);
      return null;
    }),
  ]);

  const firstRunHintSeen =
    settings?.[STORAGE_KEYS.FIRST_RUN_HINT_SEEN] === true;
  const lastUsedScene = settings?.[STORAGE_KEYS.LAST_USED_SCENE] || null;
  const rememberLastUsed =
    settings?.[STORAGE_KEYS.REMEMBER_LAST_USED_SCENE] === true;

  // Seed support-card inputs from the stored settings, then compute the
  // initial eligibility. `supportExpanded` stays false; the card only
  // auto-renders when eligibility is true.
  state.usageCount = Number(settings?.[STORAGE_KEYS.USAGE_COUNT]) || 0;
  state.supportPromptsEnabled =
    settings?.[STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED] !== false;
  state.supportPromptCooldownUntil =
    Number(settings?.[STORAGE_KEYS.SUPPORT_PROMPT_COOLDOWN_UNTIL]) || 0;
  recomputeSupportEligibility();

  if (!tab || !tab.url) {
    setState({
      popupState: "unsupported",
      unsupportedReason: null,
      activeTab: tab,
      isFirstRun: !firstRunHintSeen,
      lastUsedScene: rememberLastUsed ? lastUsedScene : null,
    });
    return;
  }

  const { supported, reason } = checkUrlEligibility(tab.url);
  if (!supported) {
    setState({
      popupState: "unsupported",
      unsupportedReason: reason,
      activeTab: tab,
      isFirstRun: !firstRunHintSeen,
      lastUsedScene: rememberLastUsed ? lastUsedScene : null,
    });
    return;
  }

  // Check whether a scene is already active on this tab. If so, render the
  // applied state directly so the user can restore or switch. We avoid
  // injecting the full runtime for this probe — the service worker reads the
  // DOM marker directly.
  const activeResponse = await sendMessage({ type: "get-active-scene" });
  const activeSceneId = activeResponse?.sceneId || null;
  if (activeSceneId && isValidSceneId(activeSceneId)) {
    setState({
      popupState: "applied",
      activeTab: tab,
      currentScene: activeSceneId,
      isFirstRun: false, // scene is already active, hint is no longer relevant
      lastUsedScene: rememberLastUsed ? lastUsedScene : null,
    });
    return;
  }

  setState({
    popupState: "default",
    activeTab: tab,
    isFirstRun: !firstRunHintSeen,
    lastUsedScene: rememberLastUsed ? lastUsedScene : null,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
