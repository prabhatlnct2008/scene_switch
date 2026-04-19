// On-page restore pill. Classic script; attaches to window.__SceneSwitchPill__.
// Visual styling lives in content/styles/restore-pill.css and is inserted by
// the service worker via chrome.scripting.insertCSS.
//
// Usage:
//   __SceneSwitchPill__.mount({ label, onRestore })
//   __SceneSwitchPill__.unmount()
//   __SceneSwitchPill__.updateLabel(label)

(function installPill() {
  if (window.__SceneSwitchPill__ && window.__SceneSwitchPill__.installed) {
    return;
  }

  const PILL_ID = "scene-switch-restore-pill";

  function getExisting() {
    return document.getElementById(PILL_ID);
  }

  function unmount() {
    const existing = getExisting();
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function mount({ label, onRestore }) {
    unmount(); // always rebuild so handlers are fresh

    const pill = document.createElement("div");
    pill.id = PILL_ID;
    pill.setAttribute("role", "region");
    pill.setAttribute("aria-label", "Scene Switch controls");

    const labelEl = document.createElement("span");
    labelEl.className = "scene-switch-pill__label";
    labelEl.textContent = label || "Scene active";
    pill.appendChild(labelEl);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-switch-pill__button";
    button.textContent = "Restore";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof onRestore === "function") {
        try {
          onRestore();
        } catch (err) {
          console.warn("[scene-switch] pill onRestore threw", err);
        }
      }
    });
    pill.appendChild(button);

    // Attach to <html> rather than <body> so pages that rewrite <body> on nav
    // transitions do not take the pill down with them. Fallback to body.
    (document.documentElement || document.body).appendChild(pill);
    return pill;
  }

  function updateLabel(label) {
    const existing = getExisting();
    if (!existing) return;
    const labelEl = existing.querySelector(".scene-switch-pill__label");
    if (labelEl) labelEl.textContent = label || "Scene active";
  }

  window.__SceneSwitchPill__ = Object.freeze({
    installed: true,
    PILL_ID,
    mount,
    unmount,
    updateLabel,
  });
})();
