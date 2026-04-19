// Melodrama Mode scene. Classic script; registers itself with the runtime.
//
// Apply behavior (Slice 05, prd.md Feature 3):
//   - Swap the document title with a theatrical flourish.
//   - Rewrite a deterministic phrase bank of common UI labels (exact match,
//     case-insensitive). This handles the most recognizable buttons.
//   - Run a small set of pattern-based tone filters on short label-like text
//     for nodes the dictionary did not cover.
//
// All transformations go through Engine.transformTextNodes, which enforces:
//   - skip inputs/textareas/contenteditable/code/pre/script/style/iframes
//   - skip already-wrapped text
//   - skip text shorter than 2 or longer than 80 chars (legal copy and
//     paragraphs are out of bounds)
//   - skip replacements that grow more than 2.2x the original
//   - cap at 120 transformed nodes per pass
// Restore is centrally handled by the engine (text spans, title, class,
// owned root, injected styles all sweep on restore).

(function installMelodramaScene() {
  const Runtime = window.__SceneSwitchRuntime__;
  const Engine = window.__SceneSwitchEngine__;
  if (!Runtime || !Engine) return;

  const SCENE_ID = "melodrama";
  const SCENE_LABEL = "Melodrama Mode";

  const EXACT_DICT = {
    // Core CTAs called out in slices.md
    "Search": "Seek your destiny",
    "Continue": "Let the tale proceed",
    "View all": "Behold the full spectacle",
    "Sign in": "Reveal thy identity",
    "Add to cart": "Summon this treasure",
    "Apply now": "Step forth and test thy fate",

    // Auth & accounts
    "Sign up": "Pledge thy name to the realm",
    "Log in": "Reveal thy identity",
    "Login": "Reveal thy identity",
    "Log out": "Vanish into the night",
    "Sign out": "Vanish into the night",
    "Logout": "Vanish into the night",
    "Register": "Inscribe thy name",
    "Create account": "Forge thy legacy",
    "Forgot password": "I have lost the sacred word",
    "Reset password": "Anoint a new sacred word",

    // Navigation
    "Home": "The grand hall",
    "Back": "Retreat into shadow",
    "Next": "Onward, brave soul",
    "Previous": "Unto the past",
    "Menu": "The royal index",
    "More": "Yet more secrets",
    "Settings": "Royal preferences",
    "Profile": "Thy chronicle",
    "Account": "Thy legacy",
    "Notifications": "Whispers from afar",

    // Commerce
    "Buy now": "Claim this prize",
    "Buy": "Claim this prize",
    "Add to bag": "Stow this in thy satchel",
    "Add to wishlist": "Mark for thy longing",
    "Checkout": "Settle thy debts",
    "Order now": "Decree this be thine",
    "Quantity": "How many dost thou desire",
    "Free": "Granted without burden",
    "Sale": "A bargain most theatrical",

    // Engagement
    "Subscribe": "Pledge thy allegiance",
    "Subscribed": "Allegiance sworn",
    "Follow": "Pledge thy fealty",
    "Following": "Sworn fealty",
    "Unfollow": "Withdraw thy fealty",
    "Like": "Bestow thy favor",
    "Liked": "Favor bestowed",
    "Share": "Proclaim to the realm",
    "Comment": "Speak thy mind",
    "Comments": "Voices of the crowd",
    "Reply": "Issue thy retort",
    "Replies": "Retorts of the chorus",
    "Save": "Preserve thy works",
    "Saved": "Preserved",
    "Send": "Dispatch thy missive",
    "Submit": "Cast thy decree",
    "Post": "Proclaim thy verse",

    // CRUD
    "Edit": "Alter thy creation",
    "Delete": "Banish forever",
    "Remove": "Cast it away",
    "Cancel": "Abandon this quest",
    "Confirm": "Seal thy oath",
    "Done": "The deed is complete",
    "Close": "Dismiss this audience",
    "Open": "Unveil the chamber",

    // Discovery
    "Read more": "Continue the saga",
    "Learn more": "Seek deeper wisdom",
    "See more": "Witness yet more",
    "Show more": "Reveal thy secrets",
    "Show less": "Conceal thy secrets",
    "Get started": "Begin thy journey",
    "Try it free": "Sample fate without cost",
    "Download": "Receive this gift",
    "Upload": "Offer thy creation",
    "Install": "Etch this into thy domain",

    // Help / company
    "Help": "Plead for guidance",
    "Contact us": "Send word to the heralds",
    "About": "Of our humble origins",
    "FAQ": "Whispered questions",

    // Social-platform staples
    "Upvote": "Bestow thy favor",
    "Downvote": "Curse this verse",
    "Watch later": "Reserve for moonlit hours",
    "Connect": "Forge an alliance",
    "Message": "Send a missive",

    // Generic
    "Click here": "Tap upon this rune",
    "Get the app": "Receive the enchanted vessel",
    "Filter": "Sift the chaff",
    "Sort by": "Arrange by thy whim",
  };

  // Mirror of shared/text.js#isShortLabel. The content runtime is a classic
  // script and cannot ES-import.
  function isShortLabel(value) {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 24) return false;
    if (/\d/.test(trimmed)) return false;
    if (!/^[A-Za-z][A-Za-z'\- ]*$/.test(trimmed)) return false;
    if (!/^[A-Z]/.test(trimmed)) return false;
    const words = trimmed.split(/\s+/).filter(Boolean);
    return words.length > 0 && words.length <= 3;
  }

  // Pattern-based fallback for label-shaped text. Only fires when the exact
  // dictionary did not match. Returns null to skip.
  function tonePatterns(trimmed) {
    if (!isShortLabel(trimmed)) return null;

    let m;
    if ((m = trimmed.match(/^([A-Z][a-z]+) now$/))) {
      return `${m[1]}, posthaste`;
    }
    if ((m = trimmed.match(/^Add to (.+)$/i))) {
      return `Append to thy ${m[1].toLowerCase()}`;
    }
    if ((m = trimmed.match(/^Remove from (.+)$/i))) {
      return `Banish from thy ${m[1].toLowerCase()}`;
    }
    if ((m = trimmed.match(/^Get (?:the )?(.+)$/))) {
      return `Receive thy ${m[1].toLowerCase()}`;
    }
    if ((m = trimmed.match(/^Try (.+)$/))) {
      return `Sample thy ${m[1].toLowerCase()}`;
    }
    if ((m = trimmed.match(/^See all (.+)$/i))) {
      return `Witness all ${m[1].toLowerCase()}`;
    }
    if ((m = trimmed.match(/^View (.+)$/))) {
      return `Behold thy ${m[1].toLowerCase()}`;
    }
    return null;
  }

  // Compose dictionary lookup in front of pattern fallback. Mirror of
  // shared/text.js#composeTransformers, kept inline for the classic script.
  function buildTransformer() {
    const dict = new Map();
    for (const [k, v] of Object.entries(EXACT_DICT)) {
      dict.set(k.toLowerCase(), v);
    }
    return function transform(trimmed) {
      const exact = dict.get(trimmed.toLowerCase());
      if (exact) return exact;
      return tonePatterns(trimmed);
    };
  }

  function pickTitle() {
    const original = document.title || "";
    if (!original) return "Behold: a tale unfolds";
    return `Behold: ${original}`;
  }

  function apply() {
    Engine.setTitle(pickTitle());
    try {
      Engine.transformTextNodes(buildTransformer());
    } catch (err) {
      console.warn("[scene-switch] melodrama transform failed", err);
    }
  }

  function restore() {
    // Engine sweeps text spans, title, owned root, and scene class on restore.
  }

  Runtime.registerScene({
    id: SCENE_ID,
    label: SCENE_LABEL,
    apply,
    restore,
  });
})();
