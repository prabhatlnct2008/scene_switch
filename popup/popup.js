// Slice 01 popup: render static copy, detect whether the active tab is
// eligible, and touch storage so first-run defaults are visible. The full
// scene picker / state machine lands in Slice 02.

import { POPUP_COPY, getUnsupportedCopy } from "../shared/copy.js";
import { getSettings } from "../shared/storage.js";
import { checkUrlEligibility, getActiveTabInfo } from "../shared/urls.js";

function $(selector) {
  return document.querySelector(selector);
}

function renderStaticCopy() {
  const title = $("[data-popup-title]");
  if (title) title.textContent = POPUP_COPY.TITLE;

  const subheading = $("[data-popup-subheading]");
  if (subheading) subheading.textContent = POPUP_COPY.SUBHEADING;

  const trust = $("[data-popup-trust]");
  if (trust) trust.textContent = POPUP_COPY.TRUST_NOTE;
}

function renderStatus({ state, title, line }) {
  const status = $("[data-popup-status]");
  if (!status) return;
  status.setAttribute("data-state", state);
  status.innerHTML = "";

  if (title) {
    const titleEl = document.createElement("p");
    titleEl.className = "popup__status-title";
    titleEl.textContent = title;
    status.appendChild(titleEl);
  }

  const lineEl = document.createElement("p");
  lineEl.className = "popup__status-line";
  lineEl.textContent = line;
  status.appendChild(lineEl);
}

async function renderEligibility() {
  const tab = await getActiveTabInfo();
  if (!tab || !tab.url) {
    const copy = getUnsupportedCopy(null);
    renderStatus({ state: "unsupported", title: copy.title, line: copy.body });
    return;
  }

  const { supported, reason } = checkUrlEligibility(tab.url);
  if (!supported) {
    const copy = getUnsupportedCopy(reason);
    renderStatus({ state: "unsupported", title: copy.title, line: copy.body });
    return;
  }

  renderStatus({
    state: "supported",
    title: "This page is ready.",
    line: "Scene picker arrives in the next slice.",
  });
}

async function logStorageSnapshot() {
  // Not rendered; just confirms storage defaults load without throwing on
  // first install. Useful when inspecting the popup console during QA.
  try {
    const settings = await getSettings();
    console.debug("[scene-switch] settings", settings);
  } catch (err) {
    console.warn("[scene-switch] settings load failed", err);
  }
}

function init() {
  renderStaticCopy();
  renderEligibility();
  logStorageSnapshot();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
