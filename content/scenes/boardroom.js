// Boardroom Mode scene. Classic script; registers itself with the runtime.
//
// Apply behavior (Slice 04, prd.md sections 5.1 and 6):
//   - Swap the page title using a hostname-specific mapping with a generic
//     fallback. Original title is preserved by the engine.
//   - Append a "KPI ribbon" banner with four fixed KPI chips. The element is
//     owned by the scene root so the engine's sweep removes it on restore.
//   - Rewrite a short corporate-speak dictionary over safe text nodes. Skipped
//     silently on pages where no matches exist.
//
// Restore is handled centrally: the engine unwraps text spans, clears the
// owned root, removes the injected stylesheet, restores the title, and drops
// the scene class on <html>. The scene's restore() is therefore a no-op.

(function installBoardroomScene() {
  const Runtime = window.__SceneSwitchRuntime__;
  const Engine = window.__SceneSwitchEngine__;
  if (!Runtime || !Engine) return;

  const SCENE_ID = "boardroom";
  const SCENE_LABEL = "Boardroom Mode";

  const TITLE_MAP = [
    { match: /(^|\.)reddit\.com$/i, title: "Cross-functional Sentiment Review" },
    { match: /(^|\.)youtube\.com$/i, title: "Video Insights — Quarterly Review" },
    { match: /(^|\.)amazon\.[a-z.]+$/i, title: "Procurement Dashboard" },
    { match: /(^|\.)linkedin\.com$/i, title: "Talent Pipeline Overview" },
    { match: /(^|\.)twitter\.com$/i, title: "Market Signal Monitor" },
    { match: /(^|\.)x\.com$/i, title: "Market Signal Monitor" },
    { match: /(^|\.)facebook\.com$/i, title: "Stakeholder Engagement Brief" },
    { match: /(^|\.)instagram\.com$/i, title: "Brand Exposure Dashboard" },
    { match: /(^|\.)tiktok\.com$/i, title: "Short-Form Content Review" },
    { match: /(^|\.)news\.ycombinator\.com$/i, title: "Industry Intelligence Digest" },
  ];
  const GENERIC_TITLE = "Q3 Operations Review";

  const KPIS = [
    { label: "Sync Health", value: "98%" },
    { label: "Review Queue", value: "12" },
    { label: "Focus Score", value: "High" },
    { label: "Risk Level", value: "Low" },
  ];

  const BOARDROOM_DICT = {
    "Trending": "Priority Signals",
    "Recommended for you": "Suggested Review Items",
    "Comments": "Feedback",
    "Popular now": "Current Activity",
    "Watch later": "Follow-up Items",
    "Subscriptions": "Reporting Feeds",
    "Home": "Overview",
    "Explore": "Discovery",
    "Shorts": "Brief Summaries",
  };

  function pickTitle() {
    const host = (location.hostname || "").toLowerCase();
    for (const entry of TITLE_MAP) {
      if (entry.match.test(host)) return entry.title;
    }
    return GENERIC_TITLE;
  }

  function buildRibbon() {
    const ribbon = document.createElement("div");
    ribbon.className = "scene-switch-boardroom__ribbon";
    ribbon.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    ribbon.setAttribute("role", "status");
    ribbon.setAttribute("aria-label", "Boardroom KPI ribbon");

    const title = document.createElement("span");
    title.className = "scene-switch-boardroom__ribbon-title";
    title.textContent = "Executive Summary";
    ribbon.appendChild(title);

    const list = document.createElement("ul");
    list.className = "scene-switch-boardroom__kpis";
    for (const kpi of KPIS) {
      const item = document.createElement("li");
      item.className = "scene-switch-boardroom__kpi";

      const label = document.createElement("span");
      label.className = "scene-switch-boardroom__kpi-label";
      label.textContent = kpi.label;

      const value = document.createElement("span");
      value.className = "scene-switch-boardroom__kpi-value";
      value.textContent = kpi.value;

      item.appendChild(label);
      item.appendChild(value);
      list.appendChild(item);
    }
    ribbon.appendChild(list);
    return ribbon;
  }

  function apply() {
    Engine.setTitle(pickTitle());
    Engine.appendOwnedNode(buildRibbon());
    try {
      Engine.rewriteTextNodes(BOARDROOM_DICT);
    } catch (err) {
      console.warn("[scene-switch] boardroom rewriteTextNodes failed", err);
    }
  }

  function restore() {
    // The engine handles title/root/styles/class/span unwrap. Nothing to do.
  }

  Runtime.registerScene({
    id: SCENE_ID,
    label: SCENE_LABEL,
    apply,
    restore,
  });
})();
