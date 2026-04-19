// Cursed Mode scene. Classic script; registers itself with the runtime.
//
// Apply behavior (Slice 06, prd.md Feature 4):
//   - Swap the document title with a hostname-specific cursed variant + a
//     generic fallback so unknown sites still get themed.
//   - Append a static vignette overlay (radial darkening). No animation, no
//     flashing — Cursed Mode should feel screenshotable, not motion-sick.
//   - Rewrite an ominous label dictionary over safe text nodes (CTAs, nav,
//     commerce strings). Long copy and forms are skipped by the engine.
//
// The visual mood (dark surfaces, eerie shadows, link tint, image desat) is
// scoped to html.scene-switch-scene--cursed in content/styles/cursed.css and
// loads/unloads with the scene class. Restore is centrally handled.

(function installCursedScene() {
  const Runtime = window.__SceneSwitchRuntime__;
  const Engine = window.__SceneSwitchEngine__;
  if (!Runtime || !Engine) return;

  const SCENE_ID = "cursed";
  const SCENE_LABEL = "Cursed Mode";

  const TITLE_MAP = [
    { match: /(^|\.)amazon\.[a-z.]+$/i, title: "The Cursed Marketplace" },
    { match: /(^|\.)reddit\.com$/i, title: "Echoes from the Forgotten Threads" },
    { match: /(^|\.)youtube\.com$/i, title: "Visions in the Static" },
    { match: /(^|\.)linkedin\.com$/i, title: "Specters of the Career Beyond" },
    { match: /(^|\.)twitter\.com$/i, title: "Whispers in the Void" },
    { match: /(^|\.)x\.com$/i, title: "Whispers in the Void" },
    { match: /(^|\.)facebook\.com$/i, title: "The Haunted Feed" },
    { match: /(^|\.)instagram\.com$/i, title: "Portraits from the Shadow Realm" },
    { match: /(^|\.)tiktok\.com$/i, title: "Visions in Endless Scroll" },
    { match: /(^|\.)wikipedia\.org$/i, title: "The Forbidden Archive" },
    { match: /(^|\.)news\.ycombinator\.com$/i, title: "Omens of the Coming Storm" },
  ];
  const GENERIC_TITLE = "Whispers from the Beyond";

  const CURSED_DICT = {
    // Slice-listed examples
    "Buy now": "Claim before it vanishes",
    "Deal": "Forbidden bargain",
    "Deals": "Forbidden bargains",
    "Recommended": "Whispered suggestion",
    "Recommended for you": "Whispered to thy ear",

    // Commerce
    "Add to cart": "Bind to thy fate",
    "Add to bag": "Slip into thy satchel",
    "Add to wishlist": "Mark for thy longing",
    "Buy": "Claim it now",
    "Order now": "Decree thy fate",
    "Checkout": "Pay the toll",
    "Free": "Cursed and unpriced",
    "Sale": "Forbidden bargain",
    "Cart": "Vessel of thy bargains",

    // Discovery / feeds
    "Trending": "Omens rising",
    "Popular": "Spoken of in shadows",
    "Popular now": "Heard now in the dark",
    "New": "Newly conjured",
    "Read more": "Continue, if thou darest",
    "Learn more": "Unveil dark truths",
    "See more": "Witness yet more",
    "Show more": "Reveal more shadows",
    "View all": "Behold all that lurks",
    "See all": "Witness all that lurks",
    "Get started": "Step into the dark",
    "Get the app": "Receive the cursed vessel",

    // Engagement
    "Subscribe": "Bind thy soul",
    "Subscribed": "Soul bound",
    "Follow": "Shadow them",
    "Following": "Shadowing",
    "Unfollow": "Release them",
    "Like": "Mark thy approval",
    "Liked": "Marked",
    "Share": "Spread the curse",
    "Comment": "Murmur thy thoughts",
    "Comments": "Murmurs from the dark",
    "Reply": "Echo back",
    "Save": "Hide it well",
    "Saved": "Hidden",
    "Watch later": "Witness in darker hours",

    // Auth / accounts
    "Sign in": "Enter the shadows",
    "Sign up": "Pledge thy soul",
    "Log in": "Enter the shadows",
    "Login": "Enter the shadows",
    "Log out": "Slip into the night",
    "Sign out": "Slip into the night",

    // CTAs / forms
    "Apply now": "Pledge thy fate",
    "Send": "Cast it into the void",
    "Submit": "Surrender thy will",
    "Continue": "Press onward, mortal",
    "Confirm": "Seal thy doom",
    "Cancel": "Renounce this rite",
    "Delete": "Banish from this realm",
    "Edit": "Twist thy creation",
    "Search": "Divine the unknown",

    // Nav
    "Next": "Onward into shadow",
    "Previous": "Recede into the past",
    "Back": "Retreat into shadow",
    "Home": "The haunted hall",
    "Menu": "The dread index",
    "Settings": "Dark preferences",
    "Profile": "Thy specter",
    "Account": "Thy soul",
    "Notifications": "Whispers in the night",
    "Help": "Beg the spirits",

    // Misc
    "Filter": "Strain the shadows",
    "Sort by": "Order thy ill omens",
    "Download": "Receive the relic",
    "Upload": "Offer thy artifact",
  };

  function pickTitle() {
    const host = (location.hostname || "").toLowerCase();
    for (const entry of TITLE_MAP) {
      if (entry.match.test(host)) return entry.title;
    }
    return GENERIC_TITLE;
  }

  function buildVignette() {
    // Static overlay — no animation, no transitions, no flashing. The radial
    // darkening lives entirely in cursed.css; this element is just a host.
    const v = document.createElement("div");
    v.className = "scene-switch-cursed__vignette";
    v.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    v.setAttribute("aria-hidden", "true");
    return v;
  }

  function apply() {
    Engine.setTitle(pickTitle());
    // Attach the vignette directly to <html> rather than the engine root so a
    // body-level filter cannot tint or wash it out. clearTouchedNodes sweeps
    // any [data-scene-switch-touched="true"] node anywhere in the document.
    const vignette = buildVignette();
    (document.documentElement || document.body).appendChild(vignette);
    try {
      Engine.rewriteTextNodes(CURSED_DICT);
    } catch (err) {
      console.warn("[scene-switch] cursed rewriteTextNodes failed", err);
    }
  }

  function restore() {
    // Engine handles title, scene class, touched nodes (vignette), text spans.
  }

  Runtime.registerScene({
    id: SCENE_ID,
    label: SCENE_LABEL,
    apply,
    restore,
  });
})();
