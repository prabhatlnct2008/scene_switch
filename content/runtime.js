// Scene Switch page runtime. Classic script; attaches to
// window.__SceneSwitchRuntime__. Idempotent.
//
// Public surface (slices.md sections 3.3 and 9.2):
//   getState()                      -> { sceneId | null, isApplying }
//   apply(sceneId)                  -> { ok, sceneId, reason, needsReload }
//   restore()                       -> { ok, sceneId, reason, needsReload }
//   registerScene({ id, label, apply, restore })
//
// Real scenes register themselves after injection (Slices 04-06). Until a
// scene is registered, apply() falls back to a built-in dummy implementation
// so the engine can be verified end-to-end in Slice 03.

(function installRuntime() {
  if (window.__SceneSwitchRuntime__ && window.__SceneSwitchRuntime__.installed) {
    return;
  }

  const Bridge = window.__SceneSwitchBridge__;
  const Engine = window.__SceneSwitchEngine__;
  const Pill = window.__SceneSwitchPill__;
  if (!Bridge || !Engine || !Pill) {
    // Guard: the service worker injects bridge/engine/pill before runtime.
    // If any is missing, surface a safe failure rather than a raw throw.
    console.warn("[scene-switch] runtime dependencies missing");
    window.__SceneSwitchRuntime__ = Object.freeze({
      installed: true,
      getState() {
        return { sceneId: null, isApplying: false };
      },
      apply() {
        return {
          ok: false,
          sceneId: null,
          reason: "page_context_error",
          needsReload: true,
        };
      },
      restore() {
        return {
          ok: false,
          sceneId: null,
          reason: "page_context_error",
          needsReload: true,
        };
      },
      registerScene() {},
    });
    return;
  }

  const SCENE_LABELS = {
    boardroom: "Boardroom Mode",
    melodrama: "Melodrama Mode",
    cursed: "Cursed Mode",
    dummy: "Scene Switch (placeholder)",
  };

  const runtimeState = {
    isApplying: false,
  };

  const registry = new Map();

  function registerScene(scene) {
    if (!scene || typeof scene.id !== "string") return;
    if (typeof scene.apply !== "function") return;
    registry.set(scene.id, scene);
  }

  function getScene(sceneId) {
    if (registry.has(sceneId)) return registry.get(sceneId);
    return buildFallbackScene(sceneId);
  }

  // Slice 03 fallback scene: title swap + small banner + root marker. This
  // gives the popup a real applied state to observe before Slice 04 registers
  // the real Boardroom code. When a real scene registers with the same id, the
  // fallback is shadowed automatically.
  function buildFallbackScene(sceneId) {
    return {
      id: sceneId,
      label: SCENE_LABELS[sceneId] || "Scene Switch",
      apply() {
        const label = SCENE_LABELS[sceneId] || "Scene Switch";
        Engine.setTitle(`[${label}] ${document.title}`);

        const banner = document.createElement("div");
        banner.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
        banner.setAttribute("role", "status");
        banner.style.all = "initial";
        banner.style.display = "block";
        banner.style.position = "fixed";
        banner.style.top = "0";
        banner.style.left = "0";
        banner.style.right = "0";
        banner.style.padding = "6px 12px";
        banner.style.background = "#5c35b3";
        banner.style.color = "#ffffff";
        banner.style.fontFamily =
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        banner.style.fontSize = "12px";
        banner.style.fontWeight = "500";
        banner.style.textAlign = "center";
        banner.style.zIndex = "2147482000";
        banner.style.pointerEvents = "none";
        banner.textContent = `${label} — placeholder scene (Slice 03)`;
        Engine.appendOwnedNode(banner);
      },
      restore() {
        // The engine sweeps owned nodes and styles; no per-scene work needed.
      },
    };
  }

  function labelFor(sceneId) {
    const scene = registry.get(sceneId);
    if (scene && scene.label) return scene.label;
    return SCENE_LABELS[sceneId] || "Scene active";
  }

  function internalRestore() {
    const activeId = Engine.getActiveSceneId();
    try {
      if (activeId) {
        const scene = registry.get(activeId);
        if (scene && typeof scene.restore === "function") {
          try {
            scene.restore();
          } catch (err) {
            console.warn("[scene-switch] scene.restore threw", err);
          }
        }
      }
      Engine.restoreTitle();
      Engine.removeSceneStyles();
      Engine.clearTouchedNodes();
      Engine.clearSceneActive();
      Pill.unmount();

      if (Engine.isDirty()) {
        return Bridge.fail(Bridge.REASONS.RESTORE_FAILED, {
          sceneId: activeId,
          needsReload: true,
        });
      }
      return Bridge.ok({ sceneId: null });
    } catch (err) {
      console.warn("[scene-switch] restore failed", err);
      return Bridge.fail(Bridge.REASONS.RESTORE_FAILED, {
        sceneId: activeId,
        needsReload: true,
      });
    }
  }

  function apply(sceneId) {
    if (typeof sceneId !== "string" || !sceneId) {
      return Bridge.fail(Bridge.REASONS.SCENE_NOT_FOUND);
    }
    if (runtimeState.isApplying) {
      // Defensive: the popup already guards against rapid clicks. Returning a
      // harmless ok here avoids double-applying.
      return Bridge.ok({ sceneId: Engine.getActiveSceneId() });
    }

    runtimeState.isApplying = true;
    try {
      // Switching scenes: restore first so we never stack transformations.
      const activeId = Engine.getActiveSceneId();
      if (activeId) {
        const restoreResult = internalRestore();
        if (!restoreResult.ok) return restoreResult;
      }

      const scene = getScene(sceneId);
      try {
        scene.apply();
      } catch (err) {
        console.warn("[scene-switch] scene.apply threw", err);
        // Clean up partial state.
        internalRestore();
        return Bridge.fail(Bridge.REASONS.APPLY_FAILED, { sceneId });
      }

      Engine.markSceneActive(sceneId);
      Pill.mount({
        label: labelFor(sceneId),
        onRestore() {
          internalRestore();
        },
      });
      return Bridge.ok({ sceneId });
    } finally {
      runtimeState.isApplying = false;
    }
  }

  function restore() {
    return internalRestore();
  }

  function getState() {
    return {
      sceneId: Engine.getActiveSceneId(),
      isApplying: runtimeState.isApplying,
    };
  }

  window.__SceneSwitchRuntime__ = Object.freeze({
    installed: true,
    apply,
    getState,
    registerScene,
    restore,
  });
})();
