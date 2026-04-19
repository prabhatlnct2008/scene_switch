// Slice 00: minimal service worker. Orchestration and scripting calls land in later slices.

chrome.runtime.onInstalled.addListener(() => {
  // Intentionally empty in Slice 00. Future slices will initialize storage defaults here.
});
