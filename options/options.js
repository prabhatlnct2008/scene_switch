// Options page controller. Slice 08 adds the "Show support prompts" toggle.
// Reads the current value on load and writes changes back through the shared
// storage layer so the popup eligibility check stays consistent.

import { STORAGE_KEYS } from "../shared/constants.js";
import { getSettings, setSettings } from "../shared/storage.js";

async function init() {
  const toggle = document.querySelector("[data-support-prompts-toggle]");
  if (!toggle) return;

  try {
    const settings = await getSettings();
    toggle.checked = settings[STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED] !== false;
  } catch (err) {
    console.warn("[scene-switch] options load failed", err);
    toggle.checked = true;
  }

  toggle.addEventListener("change", async (event) => {
    const next = Boolean(event.target.checked);
    try {
      await setSettings({ [STORAGE_KEYS.SUPPORT_PROMPTS_ENABLED]: next });
    } catch (err) {
      console.warn("[scene-switch] options write failed", err);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
