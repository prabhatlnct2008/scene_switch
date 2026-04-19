// Popup shell and screen renderer (Slice 02).
//
// Owns the popup state machine: default | applying | applied | unsupported |
// error. Real scene application lands in Slice 03; here, scene card clicks walk
// the state machine with a short stub so the UI shape and flow can be verified.
// Unsupported and eligibility detection are already wired through shared/urls.

import { STORAGE_KEYS } from "../shared/constants.js";
import {
  ERROR_COPY,
  POPUP_COPY,
  getUnsupportedCopy,
} from "../shared/copy.js";
import { SCENES, getSceneById } from "../shared/scene-meta.js";
import { getSettings, setSettings } from "../shared/storage.js";
import { checkUrlEligibility, getActiveTabInfo } from "../shared/urls.js";

const state = {
  popupState: "loading", // loading | default | applying | applied | unsupported | error
  activeTab: null,
  currentScene: null,
  unsupportedReason: null,
  errorReason: null,
  isFirstRun: false,
  lastUsedScene: null,
};

function $(selector) {
  return document.querySelector(selector);
}

function setState(patch) {
  Object.assign(state, patch);
  render();
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

function createSceneCard(scene) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "scene-card";
  card.setAttribute("data-scene-id", scene.id);
  card.setAttribute("aria-label", `${scene.name}. ${scene.descriptor}`);

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
      line: ERROR_COPY.BODY,
    }),
  );

  const actions = document.createElement("div");
  actions.className = "popup__actions";

  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "popup__button popup__button--primary";
  retry.textContent = ERROR_COPY.RETRY;
  retry.addEventListener("click", onRetryClick);
  actions.appendChild(retry);

  const reload = document.createElement("button");
  reload.type = "button";
  reload.className = "popup__button";
  reload.textContent = ERROR_COPY.RELOAD;
  reload.addEventListener("click", onReloadClick);
  actions.appendChild(reload);

  body.appendChild(actions);
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
// In Slice 02 the action handlers walk the state machine with stubs. Slice 03
// replaces these with real calls into the service worker orchestration layer.

function onSceneClick(sceneId) {
  if (state.popupState === "applying") return;
  setState({ popupState: "applying", currentScene: sceneId });
  // Stub: resolve to applied shortly so the UX shape is testable.
  window.setTimeout(() => {
    if (state.popupState !== "applying") return;
    setState({ popupState: "applied" });
  }, 400);
}

function onRestoreClick() {
  // Stub: return to default. Slice 03 calls the real restore path.
  setState({ popupState: "default", currentScene: null });
}

function onRetryClick() {
  // Stub: drop back to default. Slice 07 wires real retry.
  setState({ popupState: "default", errorReason: null });
}

function onReloadClick() {
  // Stub: drop back to default. Slice 07 wires scripted tab reload.
  setState({ popupState: "default", errorReason: null });
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
  // Use PAYPAL constants in Slice 08. Here we only confirm the click path.
  console.debug("[scene-switch] support footer clicked (wired in Slice 08)");
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
