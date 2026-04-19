// Cursed Mode scene. Classic script; registers itself with the runtime.
//
// Apply behavior (prd.md Feature 4):
//   - Swap the document title with a hostname-specific cursed variant + a
//     generic fallback so unknown sites still get themed.
//   - Append a static vignette overlay (radial darkening).
//   - Rewrite an ominous label dictionary over safe text nodes (CTAs, nav,
//     commerce strings). Long copy and forms are skipped by the engine.
//   - Spawn a motion layer: crow flocks, a rare witch silhouette crossing
//     the screen, and occasional "shadow pass" sweeps. All motion is
//     disabled under prefers-reduced-motion: reduce (see cursed.css).
//
// The visual mood (dark surfaces, eerie shadows, link tint, image desat) is
// scoped to html.scene-switch-scene--cursed in content/styles/cursed.css and
// loads/unloads with the scene class. Restore clears any scheduled timers
// and the engine sweeps tagged nodes, so nothing lingers.

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
    // Static overlay — the radial darkening lives entirely in cursed.css;
    // this element is just a host.
    const v = document.createElement("div");
    v.className = "scene-switch-cursed__vignette";
    v.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    v.setAttribute("aria-hidden", "true");
    return v;
  }

  // --- Motion layer ---------------------------------------------------------
  // Crows, witches, and shadow passes. Each piece is a DOM node tagged with
  // the engine's "touched" marker so clearTouchedNodes can sweep anything
  // that's still in flight when the user restores. All scheduled timers are
  // also tracked and cleared in restore() to stop new spawns.

  const CROW_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24" ' +
    'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ' +
    'aria-hidden="true">' +
    '<path fill="#3a3040" d="M2 14 Q12 2 20 10 Q26 4 30 12 L30 14 ' +
    'Q26 10 20 13 Q12 10 2 16 Z"/>' +
    '<path fill="#3a3040" d="M62 14 Q52 2 44 10 Q38 4 34 12 L34 14 ' +
    'Q38 10 44 13 Q52 10 62 16 Z"/>' +
    '<ellipse fill="#3a3040" cx="32" cy="13" rx="3" ry="1.8"/>' +
    '<path fill="#3a3040" d="M35 13 L40 13.5 L35 14 Z"/>' +
    "</svg>";

  const WITCH_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70" ' +
    'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ' +
    'aria-hidden="true" fill="#3a3040">' +
    // broom handle
    '<path d="M15 48 L100 36 L100 40 L15 52 Z"/>' +
    // broom bristles (trailing, right side)
    '<path d="M100 36 L118 28 L112 40 L118 50 L108 45 L105 54 L100 44 Z"/>' +
    // cloak / torso
    '<path d="M55 38 Q50 28 45 38 L42 52 Q52 56 62 52 Z"/>' +
    // head
    '<circle cx="50" cy="26" r="5"/>' +
    // pointy hat
    '<path d="M43 22 L52 4 L58 22 Z"/>' +
    // hat brim
    '<ellipse cx="50.5" cy="22.5" rx="9" ry="1.6"/>' +
    // cloak trailing behind (to the right)
    '<path d="M60 40 Q78 38 92 44 L88 50 Q72 46 60 48 Z"/>' +
    // dangling leg
    '<path d="M48 48 L50 58 L54 58 L52 48 Z"/>' +
    "</svg>";

  const motion = {
    timers: new Set(),
    running: false,
  };

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(randRange(min, max + 1));
  }

  function schedule(fn, delay) {
    if (!motion.running) return null;
    const id = setTimeout(() => {
      motion.timers.delete(id);
      if (!motion.running) return;
      try {
        fn();
      } catch (err) {
        console.warn("[scene-switch] cursed motion tick failed", err);
      }
    }, delay);
    motion.timers.add(id);
    return id;
  }

  function onceAnimationEnd(el) {
    // Self-remove when the horizontal travel animation finishes. Fallback
    // timer guards against animation events being swallowed by a hidden tab.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.remove();
    };
    el.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 30000);
  }

  function buildCrow() {
    const wrap = document.createElement("div");
    wrap.className = "scene-switch-cursed__crow";
    wrap.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    wrap.setAttribute("aria-hidden", "true");

    const startTop = randInt(4, 55);
    const drift = randInt(-8, 8);
    const endTop = Math.max(2, Math.min(65, startTop + drift));
    const duration = randInt(4500, 8500);
    const flap = randInt(240, 380);

    wrap.style.setProperty("--start-top", `${startTop}vh`);
    wrap.style.setProperty("--end-top", `${endTop}vh`);
    wrap.style.animationDuration = `${duration}ms`;

    const wings = document.createElement("span");
    wings.className = "wings";
    wings.innerHTML = CROW_SVG;
    wings.style.animationDuration = `${flap}ms`;
    wrap.appendChild(wings);

    onceAnimationEnd(wrap);
    (document.documentElement || document.body).appendChild(wrap);
  }

  function buildWitch() {
    const wrap = document.createElement("div");
    wrap.className = "scene-switch-cursed__witch";
    wrap.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    wrap.setAttribute("aria-hidden", "true");

    const startTop = randInt(12, 45);
    const drift = randInt(-6, 10);
    const endTop = Math.max(4, Math.min(55, startTop + drift));
    const duration = randInt(14000, 22000);

    wrap.style.setProperty("--start-top", `${startTop}vh`);
    wrap.style.setProperty("--end-top", `${endTop}vh`);
    wrap.style.animationDuration = `${duration}ms`;

    const bob = document.createElement("span");
    bob.className = "bob";
    bob.innerHTML = WITCH_SVG;
    wrap.appendChild(bob);

    onceAnimationEnd(wrap);
    (document.documentElement || document.body).appendChild(wrap);
  }

  function buildShadowPass() {
    const shadow = document.createElement("div");
    shadow.className = "scene-switch-cursed__shadow";
    shadow.setAttribute(Engine.MARKERS.DATA_SCENE_TOUCHED, "true");
    shadow.setAttribute("aria-hidden", "true");
    onceAnimationEnd(shadow);
    (document.documentElement || document.body).appendChild(shadow);
  }

  function scheduleCrowFlock() {
    // 1-4 birds staggered by 120-350ms so each flock feels organic.
    const count = randInt(1, 4);
    for (let i = 0; i < count; i++) {
      schedule(buildCrow, i * randInt(120, 350));
    }
    schedule(scheduleCrowFlock, randInt(6000, 18000));
  }

  function scheduleWitch() {
    schedule(buildWitch, 0);
    // Witches are rare — 45s to 95s between appearances.
    schedule(scheduleWitch, randInt(45000, 95000));
  }

  function scheduleShadow() {
    schedule(buildShadowPass, 0);
    // Shadow pass is rare too; avoids becoming a strobe.
    schedule(scheduleShadow, randInt(40000, 90000));
  }

  function startMotion() {
    // Respect accessibility: if the user opted out of motion, skip the whole
    // spawn layer. The CSS side also hides anything that slips through.
    let reduced = false;
    try {
      reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    if (reduced) return;

    motion.running = true;
    // First crow flock: staggered so it doesn't appear instantly on apply.
    schedule(scheduleCrowFlock, randInt(1500, 3500));
    // First witch and shadow-pass start further out so the scene can settle.
    schedule(scheduleWitch, randInt(12000, 25000));
    schedule(scheduleShadow, randInt(20000, 40000));
  }

  function stopMotion() {
    motion.running = false;
    for (const id of motion.timers) clearTimeout(id);
    motion.timers.clear();
    // In-flight nodes carry DATA_SCENE_TOUCHED and are swept by
    // Engine.clearTouchedNodes after scene.restore returns.
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
    startMotion();
  }

  function restore() {
    stopMotion();
    // Engine handles title, scene class, touched nodes, text spans.
  }

  Runtime.registerScene({
    id: SCENE_ID,
    label: SCENE_LABEL,
    apply,
    restore,
  });
})();
