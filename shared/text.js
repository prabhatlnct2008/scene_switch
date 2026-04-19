// Text helpers shared across popup tooling and the content runtime. Like
// shared/dom.js, the content runtime mirrors the rules inline because injected
// classic scripts cannot use ES imports.

import { THRESHOLDS } from "./constants.js";

export function normalize(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function isTransformableLength(value) {
  const trimmed = normalize(value);
  return (
    trimmed.length >= THRESHOLDS.TEXT_MIN_LENGTH &&
    trimmed.length <= THRESHOLDS.TEXT_MAX_LENGTH
  );
}

// Build a dictionary-based replacer. `entries` is an iterable of [from, to]
// pairs. Matching is case-insensitive on the trimmed text, but the replacement
// preserves the original surrounding whitespace so layout stays stable.
export function buildDictionaryReplacer(entries) {
  const map = new Map();
  for (const [from, to] of entries) {
    if (typeof from !== "string" || typeof to !== "string") continue;
    map.set(from.trim().toLowerCase(), to);
  }
  return function replace(original) {
    if (typeof original !== "string") return null;
    const trimmed = original.trim();
    if (!trimmed) return null;
    const replacement = map.get(trimmed.toLowerCase());
    if (!replacement) return null;
    // Preserve leading and trailing whitespace so the surrounding layout is
    // not perturbed by removal of a non-visible space.
    const leading = original.slice(0, original.indexOf(trimmed[0]));
    const trailing = original.slice(leading.length + trimmed.length);
    return `${leading}${replacement}${trailing}`;
  };
}

// Guard against replacements that blow up layout. Scenes should skip a
// replacement if the new text is longer than this factor of the original.
export function isSafeReplacement(original, replacement) {
  if (typeof original !== "string" || typeof replacement !== "string") return false;
  const originalLen = normalize(original).length;
  const replacementLen = normalize(replacement).length;
  if (replacementLen === 0) return false;
  if (replacementLen > THRESHOLDS.TEXT_MAX_LENGTH) return false;
  // Allow replacements up to ~2.2x the original so "View all" → "Behold the
  // full spectacle" is allowed but a whole paragraph rewrite is not.
  const growth = replacementLen / Math.max(1, originalLen);
  return growth <= 2.2;
}

// Heuristic: text looks like a short button or chip label rather than body
// copy. Scenes use this to gate generic tone filters so paragraphs are spared.
export function isShortLabel(value) {
  const trimmed = normalize(value);
  if (trimmed.length < 3 || trimmed.length > 24) return false;
  if (/\d/.test(trimmed)) return false;
  if (!/^[A-Za-z][A-Za-z'\- ]*$/.test(trimmed)) return false;
  if (!/^[A-Z]/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 3;
}

// Compose a sequence of transformer functions: each takes (trimmed, original)
// and returns a replacement string or a falsy value. The composed transformer
// returns the first non-empty string result. Used to layer an exact-phrase
// dictionary in front of pattern-based fallbacks.
export function composeTransformers(...transformers) {
  return function compose(value, ...rest) {
    for (const t of transformers) {
      if (typeof t !== "function") continue;
      const out = t(value, ...rest);
      if (typeof out === "string" && out) return out;
    }
    return null;
  };
}
