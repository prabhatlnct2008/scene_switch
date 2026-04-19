// Service worker. Slice 01 only initializes storage defaults so the popup
// never races with first-run reads. Orchestration (scripting.executeScript)
// lands in Slice 03.

import { ensureDefaults } from "../shared/storage.js";

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
