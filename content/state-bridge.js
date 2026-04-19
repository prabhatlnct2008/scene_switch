// Structured response factory shared across the content runtime. Injected as a
// classic script; cannot use ES imports. Attaches to window via a private
// namespace and is idempotent.
//
// Error reasons mirror slices.md section 9.5. Everything that crosses back to
// the popup should go through ok() / fail() so the UI layer only ever sees the
// small set of known reasons.

(function installBridge() {
  if (window.__SceneSwitchBridge__ && window.__SceneSwitchBridge__.installed) {
    return;
  }

  const REASONS = Object.freeze({
    UNSUPPORTED_PAGE: "unsupported_page",
    APPLY_FAILED: "apply_failed",
    RESTORE_FAILED: "restore_failed",
    SCENE_NOT_FOUND: "scene_not_found",
    PAGE_CONTEXT_ERROR: "page_context_error",
  });

  function ok(payload) {
    return {
      ok: true,
      sceneId: payload && payload.sceneId ? payload.sceneId : null,
      reason: null,
      needsReload: false,
    };
  }

  function fail(reason, opts) {
    const needsReload = Boolean(opts && opts.needsReload);
    const sceneId = opts && opts.sceneId ? opts.sceneId : null;
    return {
      ok: false,
      sceneId,
      reason: reason || REASONS.PAGE_CONTEXT_ERROR,
      needsReload,
    };
  }

  window.__SceneSwitchBridge__ = Object.freeze({
    installed: true,
    REASONS,
    ok,
    fail,
  });
})();
