// Safe DOM targeting helpers shared across popup/options tooling and the
// content runtime. The content runtime ships a mirror of these rules inline
// (see content/scene-engine.js) because files injected via
// chrome.scripting.executeScript run as classic scripts and cannot ES-import.
//
// Rules follow prd.md section 12.2 and slices.md section 9.3:
//   - never touch inputs, textareas, selects, password fields, contenteditable
//   - never touch code/pre/script/style
//   - never touch long paragraphs above TEXT_MAX_LENGTH
//   - never touch hidden nodes
//   - cap the transformed-node count to keep heavy pages stable

import { THRESHOLDS } from "./constants.js";

export const UNSAFE_TAG_NAMES = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
  "BUTTON", // buttons can be touched only through label text, not whole-button replacement
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

// Tags whose text content is considered low-risk to transform when paired with
// the length threshold. Scenes that want to be conservative can intersect their
// own allowlist with this set.
export const SAFE_HOST_TAG_NAMES = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "A",
  "SPAN",
  "LI",
  "P",
  "DT",
  "DD",
  "TD",
  "TH",
  "LABEL",
  "SUMMARY",
  "FIGCAPTION",
  "STRONG",
  "EM",
  "B",
  "I",
  "U",
  "SMALL",
  "DIV", // only if it holds a direct text node; handled by isShallowTextHost
]);

export function isElementHidden(el) {
  if (!(el instanceof Element)) return true;
  if (el.hasAttribute("hidden")) return true;
  const style = el.ownerDocument?.defaultView?.getComputedStyle?.(el);
  if (!style) return false;
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (parseFloat(style.opacity || "1") === 0) return true;
  return false;
}

export function hasUnsafeAncestor(node) {
  let cursor = node.parentElement;
  while (cursor) {
    if (UNSAFE_TAG_NAMES.has(cursor.tagName)) return true;
    if (cursor.isContentEditable) return true;
    const role = cursor.getAttribute?.("role");
    if (role === "textbox" || role === "combobox") return true;
    cursor = cursor.parentElement;
  }
  return false;
}

// A text node is "shallow" if its parent element is predominantly that text
// (short label / heading / chip), not a big paragraph wrapping it.
export function isShallowTextHost(textNode) {
  const parent = textNode.parentElement;
  if (!parent) return false;
  if (!SAFE_HOST_TAG_NAMES.has(parent.tagName)) return false;
  const trimmed = (textNode.textContent || "").trim();
  if (trimmed.length < THRESHOLDS.TEXT_MIN_LENGTH) return false;
  if (trimmed.length > THRESHOLDS.TEXT_MAX_LENGTH) return false;
  return true;
}

// Collect a bounded list of safe text nodes. The runtime uses this to gather
// targets for deterministic rewrites; callers decide whether to transform each.
export function collectSafeTextNodes(root = document.body, limit = THRESHOLDS.MAX_NODES_PER_SCENE) {
  const results = [];
  if (!root) return results;
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        if (UNSAFE_TAG_NAMES.has(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (hasUnsafeAncestor(node)) return NodeFilter.FILTER_REJECT;
        if (isElementHidden(node.parentElement)) return NodeFilter.FILTER_REJECT;
        if (!isShallowTextHost(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let current = walker.nextNode();
  while (current && results.length < limit) {
    results.push(current);
    current = walker.nextNode();
  }
  return results;
}

// Second-layer eligibility check. URL eligibility catches known bad pages; this
// catches generic pages that happen to carry sensitive widgets (checkout forms
// on marketing sites, embedded compose surfaces, rich text editors). Returns
// { blocked, reason } where reason maps to an UNSUPPORTED_REASONS value.
//
// Scoring is conservative: we'd rather over-block than damage a compose draft.
// The content runtime ships a mirror of this function inline because injected
// classic scripts cannot ES-import.
export function detectBlockingContext(doc = typeof document !== "undefined" ? document : null) {
  if (!doc || !doc.body) return { blocked: false, reason: null };

  // Payment form signals: autocomplete tokens on credit-card fields are the
  // clearest indicator a merchant is live on the page.
  if (
    doc.querySelector(
      'input[autocomplete*="cc-number" i], input[autocomplete*="cc-csc" i], input[autocomplete*="cc-exp" i], input[autocomplete*="cc-name" i]',
    )
  ) {
    return { blocked: true, reason: "sensitive_context" };
  }

  // Large visible contenteditable host = compose surface (Gmail body, Notion,
  // Google-Docs-style editors, drafting UIs). We intentionally skip tiny
  // contenteditable chips which are common on social feeds.
  const editables = doc.querySelectorAll(
    '[contenteditable="true"], [contenteditable=""]',
  );
  for (const el of editables) {
    if (isElementHidden(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width >= 240 && rect.height >= 120) {
      return { blocked: true, reason: "sensitive_context" };
    }
  }

  // User is actively drafting text in a textarea — don't run over their work.
  const active = doc.activeElement;
  if (active && active.tagName === "TEXTAREA" && (active.value || "").length > 40) {
    return { blocked: true, reason: "sensitive_context" };
  }

  return { blocked: false, reason: null };
}
