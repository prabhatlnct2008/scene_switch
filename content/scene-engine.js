// Shared scene engine helpers for apply/restore bookkeeping. Classic script;
// attaches to window.__SceneSwitchEngine__. Idempotent.
//
// Responsibilities:
//   - title save/restore using a dataset marker on <html>
//   - injected-style registry (register by id so restore can sweep them)
//   - root container for scene-owned DOM nodes
//   - tracking "touched" nodes so DOM additions can be removed on restore

(function installEngine() {
  if (window.__SceneSwitchEngine__ && window.__SceneSwitchEngine__.installed) {
    return;
  }

  const MARKERS = Object.freeze({
    ROOT_ID: "scene-switch-root",
    DATA_SCENE_ACTIVE: "data-scene-switch-active",
    DATA_ORIGINAL_TITLE: "data-scene-switch-original-title",
    DATA_SCENE_TOUCHED: "data-scene-switch-touched",
    STYLE_ID_PREFIX: "scene-switch-style-",
  });

  function getRoot() {
    let root = document.getElementById(MARKERS.ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = MARKERS.ROOT_ID;
    // The root is a single anchor for scene-owned nodes. It is appended to
    // <body>. Scenes should never manipulate it directly; use appendOwnedNode.
    root.setAttribute("aria-hidden", "true");
    root.style.all = "initial"; // neutralize inherited styles
    root.style.display = "contents"; // no layout impact from the container itself
    if (document.body) {
      document.body.appendChild(root);
    }
    return root;
  }

  function removeRoot() {
    const root = document.getElementById(MARKERS.ROOT_ID);
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  function appendOwnedNode(node) {
    if (!(node instanceof Node)) return;
    const root = getRoot();
    root.appendChild(node);
  }

  function markSceneActive(sceneId) {
    const el = document.documentElement;
    if (el) el.setAttribute(MARKERS.DATA_SCENE_ACTIVE, sceneId);
  }

  function clearSceneActive() {
    const el = document.documentElement;
    if (el) el.removeAttribute(MARKERS.DATA_SCENE_ACTIVE);
  }

  function getActiveSceneId() {
    const el = document.documentElement;
    if (!el) return null;
    return el.getAttribute(MARKERS.DATA_SCENE_ACTIVE) || null;
  }

  function saveTitle() {
    const el = document.documentElement;
    if (!el) return;
    if (el.hasAttribute(MARKERS.DATA_ORIGINAL_TITLE)) return; // already saved
    el.setAttribute(MARKERS.DATA_ORIGINAL_TITLE, document.title || "");
  }

  function setTitle(nextTitle) {
    if (typeof nextTitle !== "string") return;
    saveTitle();
    document.title = nextTitle;
  }

  function restoreTitle() {
    const el = document.documentElement;
    if (!el) return;
    if (!el.hasAttribute(MARKERS.DATA_ORIGINAL_TITLE)) return;
    const original = el.getAttribute(MARKERS.DATA_ORIGINAL_TITLE) || "";
    document.title = original;
    el.removeAttribute(MARKERS.DATA_ORIGINAL_TITLE);
  }

  function injectStyle(sceneId, cssText) {
    if (typeof sceneId !== "string" || typeof cssText !== "string") return null;
    const id = `${MARKERS.STYLE_ID_PREFIX}${sceneId}`;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      el.setAttribute(MARKERS.DATA_SCENE_TOUCHED, "true");
      document.head?.appendChild(el);
    }
    el.textContent = cssText;
    return el;
  }

  function removeSceneStyles(sceneId) {
    // Remove both scene-specific style and any residual scene-switch-* styles
    // if sceneId is omitted. The wildcard form is used during full restore.
    if (typeof sceneId === "string") {
      const el = document.getElementById(`${MARKERS.STYLE_ID_PREFIX}${sceneId}`);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      return;
    }
    const all = document.querySelectorAll(`[id^="${MARKERS.STYLE_ID_PREFIX}"]`);
    all.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  // Remove every node the engine added (root + any stray touched nodes in the
  // document that the root did not own). Guards against scenes that forgot to
  // attach a node to the owned root.
  function clearTouchedNodes() {
    removeRoot();
    const stray = document.querySelectorAll(
      `[${MARKERS.DATA_SCENE_TOUCHED}="true"]`,
    );
    stray.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function isDirty() {
    const el = document.documentElement;
    if (!el) return false;
    if (el.hasAttribute(MARKERS.DATA_ORIGINAL_TITLE)) return true;
    if (el.hasAttribute(MARKERS.DATA_SCENE_ACTIVE)) return true;
    if (document.getElementById(MARKERS.ROOT_ID)) return true;
    if (document.querySelector(`[id^="${MARKERS.STYLE_ID_PREFIX}"]`)) return true;
    if (document.querySelector(`[${MARKERS.DATA_SCENE_TOUCHED}="true"]`)) return true;
    return false;
  }

  window.__SceneSwitchEngine__ = Object.freeze({
    installed: true,
    MARKERS,
    appendOwnedNode,
    clearTouchedNodes,
    clearSceneActive,
    getActiveSceneId,
    getRoot,
    injectStyle,
    isDirty,
    markSceneActive,
    removeRoot,
    removeSceneStyles,
    restoreTitle,
    saveTitle,
    setTitle,
  });
})();
