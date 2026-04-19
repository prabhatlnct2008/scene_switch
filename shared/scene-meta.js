// Canonical scene IDs and display metadata. Scene copy lives here so popup,
// options, and the on-page restore pill never drift on naming.

export const SCENE_IDS = Object.freeze({
  BOARDROOM: "boardroom",
  MELODRAMA: "melodrama",
  CURSED: "cursed",
});

// Display order matches the popup card order.
export const SCENES = Object.freeze([
  Object.freeze({
    id: SCENE_IDS.BOARDROOM,
    name: "Boardroom Mode",
    descriptor: "Make this page look like serious work.",
    applyingCopy: "Applying Boardroom Mode\u2026",
    activeBadge: "Boardroom Mode is live",
  }),
  Object.freeze({
    id: SCENE_IDS.MELODRAMA,
    name: "Melodrama Mode",
    descriptor: "Rewrite this page like a theatrical villain got involved.",
    applyingCopy: "Rewriting the drama\u2026",
    activeBadge: "Melodrama Mode is live",
  }),
  Object.freeze({
    id: SCENE_IDS.CURSED,
    name: "Cursed Mode",
    descriptor: "Give this tab a haunted makeover.",
    applyingCopy: "Summoning the cursed version\u2026",
    activeBadge: "Cursed Mode is live",
  }),
]);

const SCENE_BY_ID = new Map(SCENES.map((scene) => [scene.id, scene]));

export function getSceneById(id) {
  return SCENE_BY_ID.get(id) || null;
}

export function isValidSceneId(id) {
  return SCENE_BY_ID.has(id);
}
