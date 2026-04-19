// Shared scene engine helpers for apply/restore bookkeeping. Classic script;
// attaches to window.__SceneSwitchEngine__. Idempotent.
//
// Responsibilities:
//   - title save/restore using a dataset marker on <html>
//   - injected-style registry (register by id so restore can sweep them)
//   - root container for scene-owned DOM nodes
//   - tracking "touched" nodes so DOM additions can be removed on restore
//   - safe dictionary-based text rewrites with wrap/unwrap for restore
//   - scene-specific class on <html> so CSS files can scope rules

(function installEngine() {
  if (window.__SceneSwitchEngine__ && window.__SceneSwitchEngine__.installed) {
    return;
  }

  const MARKERS = Object.freeze({
    ROOT_ID: "scene-switch-root",
    DATA_SCENE_ACTIVE: "data-scene-switch-active",
    DATA_ORIGINAL_TITLE: "data-scene-switch-original-title",
    DATA_ORIGINAL_TEXT: "data-scene-switch-original-text",
    DATA_SCENE_TOUCHED: "data-scene-switch-touched",
    STYLE_ID_PREFIX: "scene-switch-style-",
    SCENE_CLASS_PREFIX: "scene-switch-scene--",
  });

  // Tags whose contents we will never rewrite. Mirror of shared/dom.js; kept
  // inline because injected classic scripts cannot ES-import.
  const UNSAFE_TAG_NAMES = new Set([
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "OPTION",
    "BUTTON",
    "SCRIPT",
    "STYLE",
    "CODE",
    "PRE",
    "NOSCRIPT",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "SVG",
    "CANVAS",
    "VIDEO",
    "AUDIO",
  ]);

  const TEXT_REWRITE_DEFAULTS = Object.freeze({
    maxNodes: 120,
    minLen: 2,
    maxLen: 80,
    growthFactor: 2.2,
  });

  function hasUnsafeAncestor(node) {
    let cursor = node.parentElement;
    while (cursor) {
      if (UNSAFE_TAG_NAMES.has(cursor.tagName)) return true;
      if (cursor.isContentEditable) return true;
      const role = cursor.getAttribute && cursor.getAttribute("role");
      if (role === "textbox" || role === "combobox") return true;
      cursor = cursor.parentElement;
    }
    return false;
  }

  function isElementHidden(el) {
    if (!(el instanceof Element)) return true;
    if (el.hasAttribute("hidden")) return true;
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    const style = view && view.getComputedStyle ? view.getComputedStyle(el) : null;
    if (!style) return false;
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (parseFloat(style.opacity || "1") === 0) return true;
    return false;
  }

  // Mirror of shared/dom.js#detectBlockingContext. Returns { blocked, reason }
  // where reason is an UNSUPPORTED_REASONS value. Runtime.apply() calls this
  // after URL eligibility so pages with checkout widgets, large compose
  // surfaces, or an active textarea draft are left untouched.
  function detectBlockingContext() {
    if (!document || !document.body) return { blocked: false, reason: null };

    if (
      document.querySelector(
        'input[autocomplete*="cc-number" i], input[autocomplete*="cc-csc" i], input[autocomplete*="cc-exp" i], input[autocomplete*="cc-name" i]',
      )
    ) {
      return { blocked: true, reason: "sensitive_context" };
    }

    const editables = document.querySelectorAll(
      '[contenteditable="true"], [contenteditable=""]',
    );
    for (const el of editables) {
      if (isElementHidden(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width >= 240 && rect.height >= 120) {
        return { blocked: true, reason: "sensitive_context" };
      }
    }

    const active = document.activeElement;
    if (active && active.tagName === "TEXTAREA" && (active.value || "").length > 40) {
      return { blocked: true, reason: "sensitive_context" };
    }

    return { blocked: false, reason: null };
  }

  function getRoot() {
    let root = document.getElementById(MARKERS.ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = MARKERS.ROOT_ID;
    root.setAttribute("aria-hidden", "true");
    root.style.all = "initial";
    root.style.display = "contents";
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
    if (!el) return;
    el.setAttribute(MARKERS.DATA_SCENE_ACTIVE, sceneId);
    el.classList.add(`${MARKERS.SCENE_CLASS_PREFIX}${sceneId}`);
  }

  function clearSceneActive() {
    const el = document.documentElement;
    if (!el) return;
    const previous = el.getAttribute(MARKERS.DATA_SCENE_ACTIVE);
    if (previous) {
      el.classList.remove(`${MARKERS.SCENE_CLASS_PREFIX}${previous}`);
    }
    // Defensively strip any stray scene classes in case of partial state.
    for (const cls of Array.from(el.classList)) {
      if (cls.startsWith(MARKERS.SCENE_CLASS_PREFIX)) {
        el.classList.remove(cls);
      }
    }
    el.removeAttribute(MARKERS.DATA_SCENE_ACTIVE);
  }

  function getActiveSceneId() {
    const el = document.documentElement;
    if (!el) return null;
    return el.getAttribute(MARKERS.DATA_SCENE_ACTIVE) || null;
  }

  function saveTitle() {
    const el = document.documentElement;
    if (!el) return;
    if (el.hasAttribute(MARKERS.DATA_ORIGINAL_TITLE)) return;
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
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = cssText;
    return el;
  }

  function removeSceneStyles(sceneId) {
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

  function clearTouchedNodes() {
    removeRoot();
    const stray = document.querySelectorAll(
      `[${MARKERS.DATA_SCENE_TOUCHED}="true"]`,
    );
    stray.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  // Walk text nodes under <body> and call `transformer(trimmed, original)` for
  // each candidate. The transformer returns a replacement string or a falsy
  // value to skip. Layout-safety rules apply to all callers:
  //   - skip text whose parent (or any ancestor) is unsafe
  //   - skip already-wrapped text
  //   - skip text outside [minLen, maxLen]
  //   - skip replacements whose growth ratio exceeds growthFactor
  //   - cap the number of nodes considered per pass
  // Returns the count of replacements performed.
  function transformTextNodes(transformer, options) {
    if (typeof transformer !== "function") return 0;
    const config = Object.assign({}, TEXT_REWRITE_DEFAULTS, options || {});
    if (!document.body) return 0;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (UNSAFE_TAG_NAMES.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (hasUnsafeAncestor(node)) return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute(MARKERS.DATA_ORIGINAL_TEXT)) {
            return NodeFilter.FILTER_REJECT;
          }
          const value = node.nodeValue || "";
          const trimmed = value.trim();
          if (trimmed.length < config.minLen) return NodeFilter.FILTER_REJECT;
          if (trimmed.length > config.maxLen) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const candidates = [];
    let n = walker.nextNode();
    while (n && candidates.length < config.maxNodes) {
      candidates.push(n);
      n = walker.nextNode();
    }

    let changed = 0;
    for (const node of candidates) {
      const original = node.nodeValue || "";
      const trimmed = original.trim();
      if (!trimmed) continue;
      let replacement;
      try {
        replacement = transformer(trimmed, original);
      } catch (err) {
        console.warn("[scene-switch] transformer threw", err);
        continue;
      }
      if (typeof replacement !== "string" || !replacement) continue;
      if (replacement === trimmed) continue;
      const growth = replacement.length / Math.max(1, trimmed.length);
      if (growth > config.growthFactor) continue;
      if (replacement.length > config.maxLen) continue;
      const firstCharIndex = original.indexOf(trimmed[0]);
      const leading = firstCharIndex >= 0 ? original.slice(0, firstCharIndex) : "";
      const trailing = original.slice(leading.length + trimmed.length);
      const span = document.createElement("span");
      span.setAttribute(MARKERS.DATA_ORIGINAL_TEXT, original);
      span.textContent = `${leading}${replacement}${trailing}`;
      try {
        node.parentNode.replaceChild(span, node);
        changed += 1;
      } catch (err) {
        // Parent may have been removed by a dynamic page. Skip silently.
      }
    }
    return changed;
  }

  // Convenience wrapper for the common "exact dictionary" case. Builds a
  // case-insensitive lookup over the dictionary entries and delegates to
  // transformTextNodes. `dictionary` is a plain object or Map of from->to.
  function rewriteTextNodes(dictionary, options) {
    const map = new Map();
    const entries =
      dictionary instanceof Map
        ? dictionary.entries()
        : Object.entries(dictionary || {});
    for (const [k, v] of entries) {
      if (typeof k !== "string" || typeof v !== "string") continue;
      map.set(k.trim().toLowerCase(), v);
    }
    if (map.size === 0) return 0;
    return transformTextNodes(
      (trimmed) => map.get(trimmed.toLowerCase()) || null,
      options,
    );
  }

  function restoreTextNodes() {
    const spans = document.querySelectorAll(
      `[${MARKERS.DATA_ORIGINAL_TEXT}]`,
    );
    spans.forEach((span) => {
      const original = span.getAttribute(MARKERS.DATA_ORIGINAL_TEXT) || "";
      const textNode = document.createTextNode(original);
      if (span.parentNode) span.parentNode.replaceChild(textNode, span);
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
    if (document.querySelector(`[${MARKERS.DATA_ORIGINAL_TEXT}]`)) return true;
    for (const cls of Array.from(el.classList)) {
      if (cls.startsWith(MARKERS.SCENE_CLASS_PREFIX)) return true;
    }
    return false;
  }

  window.__SceneSwitchEngine__ = Object.freeze({
    installed: true,
    MARKERS,
    appendOwnedNode,
    clearSceneActive,
    clearTouchedNodes,
    detectBlockingContext,
    getActiveSceneId,
    getRoot,
    injectStyle,
    isDirty,
    markSceneActive,
    removeRoot,
    removeSceneStyles,
    restoreTextNodes,
    restoreTitle,
    rewriteTextNodes,
    saveTitle,
    setTitle,
    transformTextNodes,
  });
})();
