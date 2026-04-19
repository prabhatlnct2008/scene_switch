// Service worker. Slice 03 adds the orchestration layer: receives popup
// messages, injects the content runtime on demand, and drives apply / restore
// via chrome.scripting.executeScript. Slice 01 still owns first-run storage
// defaults on install/startup.
//
// Messages accepted (popup -> service worker):
//   { type: "apply-scene", sceneId, tabId? }
//   { type: "restore-scene", tabId? }
//   { type: "get-active-scene", tabId? }
//   { type: "reload-active-tab", tabId? }
//
// All responses match the structured shape from content/state-bridge.js:
//   { ok, sceneId, reason, needsReload }
// except get-active-scene, which returns { sceneId }.

import { ensureDefaults } from "../shared/storage.js";
import { checkUrlEligibility } from "../shared/urls.js";
import { isValidSceneId } from "../shared/scene-meta.js";

const CONTENT_FILES = [
  "content/state-bridge.js",
  "content/scene-engine.js",
  "content/restore-pill.js",
  "content/runtime.js",
];

const CONTENT_CSS_FILES = ["content/styles/restore-pill.css"];

// Per-scene classic scripts appended after the runtime so they can call
// __SceneSwitchRuntime__.registerScene(...) synchronously.
const SCENE_FILES = Object.freeze({
  boardroom: ["content/scenes/boardroom.js"],
  melodrama: ["content/scenes/melodrama.js"],
  cursed: ["content/scenes/cursed.js"],
});

// Per-scene stylesheets. Inserted alongside the shared pill CSS when a scene
// is applied; removed on restore by the engine's class toggle.
const SCENE_CSS_FILES = Object.freeze({
  boardroom: ["content/styles/boardroom.css"],
  cursed: ["content/styles/cursed.css"],
  // melodrama: ["content/styles/melodrama.css"], // text-only scene
});

const BRIDGE_REASONS = Object.freeze({
  UNSUPPORTED_PAGE: "unsupported_page",
  APPLY_FAILED: "apply_failed",
  RESTORE_FAILED: "restore_failed",
  SCENE_NOT_FOUND: "scene_not_found",
  PAGE_CONTEXT_ERROR: "page_context_error",
});

function failResponse(reason, extras = {}) {
  return {
    ok: false,
    sceneId: extras.sceneId || null,
    reason,
    needsReload: Boolean(extras.needsReload),
  };
}

async function resolveTabId(requested) {
  if (typeof requested === "number" && Number.isFinite(requested)) {
    return requested;
  }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || typeof tab.id !== "number") return null;
  return tab.id;
}

async function verifyTabSupported(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!tab || !tab.url) {
    return { supported: false, reason: BRIDGE_REASONS.UNSUPPORTED_PAGE };
  }
  const { supported, reason } = checkUrlEligibility(tab.url);
  if (!supported) {
    return { supported: false, reason: BRIDGE_REASONS.UNSUPPORTED_PAGE, subReason: reason };
  }
  return { supported: true, reason: null };
}

async function injectRuntime(tabId, sceneId) {
  const files = [...CONTENT_FILES];
  if (sceneId && SCENE_FILES[sceneId]) {
    files.push(...SCENE_FILES[sceneId]);
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files,
  });
  const cssFiles = [...CONTENT_CSS_FILES];
  if (sceneId && SCENE_CSS_FILES[sceneId]) {
    cssFiles.push(...SCENE_CSS_FILES[sceneId]);
  }
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: cssFiles,
  });
}

async function callRuntime(tabId, method, args = []) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: (methodName, methodArgs) => {
      const runtime = window.__SceneSwitchRuntime__;
      if (!runtime || typeof runtime[methodName] !== "function") {
        return {
          ok: false,
          sceneId: null,
          reason: "page_context_error",
          needsReload: true,
        };
      }
      try {
        return runtime[methodName](...methodArgs);
      } catch (err) {
        return {
          ok: false,
          sceneId: null,
          reason: "page_context_error",
          needsReload: true,
        };
      }
    },
    args: [method, args],
  });
  const first = Array.isArray(results) ? results[0] : null;
  return first && first.result ? first.result : failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR);
}

async function handleApplyScene({ sceneId, tabId: requestedTabId }) {
  if (!isValidSceneId(sceneId)) {
    return failResponse(BRIDGE_REASONS.SCENE_NOT_FOUND, { sceneId });
  }
  const tabId = await resolveTabId(requestedTabId);
  if (tabId == null) {
    return failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR);
  }
  const eligibility = await verifyTabSupported(tabId);
  if (!eligibility.supported) {
    return failResponse(BRIDGE_REASONS.UNSUPPORTED_PAGE, { sceneId });
  }
  try {
    await injectRuntime(tabId, sceneId);
  } catch (err) {
    console.warn("[scene-switch] injectRuntime failed", err);
    return failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR, { sceneId });
  }
  try {
    return await callRuntime(tabId, "apply", [sceneId]);
  } catch (err) {
    console.warn("[scene-switch] apply call failed", err);
    return failResponse(BRIDGE_REASONS.APPLY_FAILED, { sceneId });
  }
}

async function handleRestoreScene({ tabId: requestedTabId }) {
  const tabId = await resolveTabId(requestedTabId);
  if (tabId == null) {
    return failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR);
  }
  try {
    await injectRuntime(tabId);
  } catch (err) {
    console.warn("[scene-switch] injectRuntime (restore) failed", err);
    return failResponse(BRIDGE_REASONS.RESTORE_FAILED, { needsReload: true });
  }
  try {
    return await callRuntime(tabId, "restore", []);
  } catch (err) {
    console.warn("[scene-switch] restore call failed", err);
    return failResponse(BRIDGE_REASONS.RESTORE_FAILED, { needsReload: true });
  }
}

// Cheap probe that does NOT inject the runtime. Reads the DOM marker the
// engine would have left behind. Returns { sceneId } or { sceneId: null }.
async function handleGetActiveScene({ tabId: requestedTabId }) {
  const tabId = await resolveTabId(requestedTabId);
  if (tabId == null) return { sceneId: null };
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const el = document.documentElement;
        if (!el) return null;
        return el.getAttribute("data-scene-switch-active") || null;
      },
    });
    const first = Array.isArray(results) ? results[0] : null;
    return { sceneId: first ? first.result || null : null };
  } catch {
    // Permission or unsupported page: silently report no active scene.
    return { sceneId: null };
  }
}

async function handleReloadActiveTab({ tabId: requestedTabId }) {
  const tabId = await resolveTabId(requestedTabId);
  if (tabId == null) return { ok: false };
  try {
    await chrome.tabs.reload(tabId);
    return { ok: true };
  } catch (err) {
    console.warn("[scene-switch] reload failed", err);
    return { ok: false };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse(failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR));
    return false;
  }
  let handler = null;
  switch (message.type) {
    case "apply-scene":
      handler = handleApplyScene(message);
      break;
    case "restore-scene":
      handler = handleRestoreScene(message);
      break;
    case "get-active-scene":
      handler = handleGetActiveScene(message);
      break;
    case "reload-active-tab":
      handler = handleReloadActiveTab(message);
      break;
    default:
      sendResponse(failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR));
      return false;
  }
  handler
    .then((result) => sendResponse(result))
    .catch((err) => {
      console.warn("[scene-switch] handler failed", err);
      sendResponse(failResponse(BRIDGE_REASONS.PAGE_CONTEXT_ERROR));
    });
  return true; // keep the channel open for async sendResponse
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await ensureDefaults();
  } catch (err) {
    console.warn("[scene-switch] ensureDefaults failed", err);
  }
});

// Chrome may wake the service worker from cold start without firing
// onInstalled. Make sure defaults exist in that case too.
chrome.runtime.onStartup.addListener(async () => {
  try {
    await ensureDefaults();
  } catch (err) {
    console.warn("[scene-switch] ensureDefaults (startup) failed", err);
  }
});
