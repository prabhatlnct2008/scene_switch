# Scene Switch — Implementation Slice Plan

**Document status:** Draft  
**Version:** 0.1  
**Date:** 2026-04-19  
**Companion document:** `prd.md`  
**Purpose:** Convert the PRD into an implementation sequence that can be executed step by step until the MVP is built, tested, and ready for Chrome Web Store submission.

---

## 1. How to use this document

This is a **build-order document**, not just a backlog.

Use it like this:

1. Complete slices **in order**.
2. Do not skip acceptance criteria.
3. Keep the extension installable after every slice.
4. Do not add permissions, tracking, backend calls, or scope that is outside the PRD.
5. Treat each slice as done only after the **manual checks** for that slice pass.

The rule for any unclear decision is the same as the PRD:

> **Make it simpler, safer, and more immediately funny.**

---

## 2. Build strategy

The MVP should be built in **thin vertical slices** after the initial skeleton.

That means:
- first create a stable extension shell,
- then create the shared runtime and restore system,
- then ship one full scene end to end,
- then add the other scenes,
- then add support flow,
- then settings,
- then hardening and QA.

This keeps the build from turning into a pile of half-finished features.

---

## 3. Technical implementation assumptions

These assumptions are intentionally conservative so the MVP stays easy to ship.

### 3.1 Stack
- **Chrome extension, Manifest V3**
- **No backend**
- **No framework required** for MVP
- **Plain HTML/CSS/JavaScript**
- **ES modules** for popup, options, and service worker if desired
- **Classic injected scripts with one shared global namespace** for page runtime, to avoid MV3 injection complexity

### 3.2 Permissions
Only use:
- `activeTab`
- `scripting`
- `storage`

Do **not** add:
- `history`
- `tabs`
- broad host permissions
- analytics SDKs
- remote config
- anything that changes the trust story

### 3.3 Architecture shape
Use a **thin extension shell** with three layers:

1. **Popup / Options UI layer**  
   Renders screens and triggers actions.

2. **Service worker orchestration layer**  
   Finds the active tab, runs injected code, opens support links, reads/writes local storage.

3. **Injected page runtime layer**  
   Applies scenes, restores scenes, and mounts the on-page restore pill.

### 3.4 State model
- Persistent state belongs in `chrome.storage.local`
- Active scene state should live on the page through:
  - DOM markers,
  - data attributes,
  - injected root nodes,
  - and a runtime singleton namespace
- Do **not** persist visited URLs, page text, or personal browsing data

### 3.5 Implementation rule for scenes
Every scene must:
- be applied only after explicit click,
- be reversible,
- avoid inputs/forms/editors,
- avoid long unstable rewrites,
- avoid always-on observers,
- and avoid changing browser chrome or pretending to be system UI.

---

## 4. Recommended project structure

Create this structure first and keep it stable during the build:

```text
scene-switch/
├─ manifest.json
├─ README.md
├─ .gitignore
├─ assets/
│  ├─ icons/
│  │  ├─ icon16.png
│  │  ├─ icon32.png
│  │  ├─ icon48.png
│  │  └─ icon128.png
│  └─ screenshots/
├─ background/
│  └─ service-worker.js
├─ popup/
│  ├─ popup.html
│  ├─ popup.css
│  └─ popup.js
├─ options/
│  ├─ options.html
│  ├─ options.css
│  └─ options.js
├─ shared/
│  ├─ constants.js
│  ├─ copy.js
│  ├─ storage.js
│  ├─ urls.js
│  ├─ dom.js
│  ├─ text.js
│  └─ scene-meta.js
├─ content/
│  ├─ runtime.js
│  ├─ scene-engine.js
│  ├─ restore-pill.js
│  ├─ state-bridge.js
│  ├─ scenes/
│  │  ├─ boardroom.js
│  │  ├─ melodrama.js
│  │  └─ cursed.js
│  └─ styles/
│     ├─ base.css
│     ├─ boardroom.css
│     ├─ cursed.css
│     └─ restore-pill.css
└─ test-notes/
   ├─ manual-smoke.md
   └─ release-checklist.md
```

### Structure rules
- Keep `manifest.json` at root.
- Keep popup, options, background, and content runtime separate.
- Keep all scene-specific logic in `content/scenes/`.
- Keep copy and config centralized in `shared/`.
- Do not duplicate scene names, labels, thresholds, or PayPal URLs across files.

---

## 5. Shared data model and constants

Create these shared constants early and use them everywhere.

### 5.1 Scene IDs
```js
SCENES = {
  BOARDROOM: 'boardroom',
  MELODRAMA: 'melodrama',
  CURSED: 'cursed'
}
```

### 5.2 Storage keys
```js
usageCount
supportPromptsEnabled
supportPromptCooldownUntil
lastUsedScene
showRestorePill
rememberLastUsedScene
firstRunHintSeen
```

### 5.3 Default storage values
```js
{
  usageCount: 0,
  supportPromptsEnabled: true,
  supportPromptCooldownUntil: 0,
  lastUsedScene: null,
  showRestorePill: true,
  rememberLastUsedScene: true,
  firstRunHintSeen: false
}
```

### 5.4 Runtime DOM markers
Use stable IDs and data attributes so restore is predictable.

```js
ROOT_ID = 'scene-switch-root'
RESTORE_PILL_ID = 'scene-switch-restore-pill'
DATA_SCENE_ACTIVE = 'data-scene-switch-active'
DATA_ORIGINAL_TEXT = 'data-scene-switch-original-text'
DATA_ORIGINAL_TITLE = 'data-scene-switch-original-title'
DATA_SCENE_TOUCHED = 'data-scene-switch-touched'
STYLE_ID_PREFIX = 'scene-switch-style-'
```

### 5.5 Added implementation note
The PRD mentions a cooldown period for “Not now” but does not list a storage key for it.

To support that behavior cleanly, add:
- `supportPromptCooldownUntil`

This is a small implementation detail that supports the PRD without changing the product scope.

---

## 6. Definition of done for every slice

A slice is only done when all of the following are true:

- code compiles / loads as an unpacked extension,
- there are no blocking console errors,
- the feature works in the intended flow,
- the slice acceptance criteria pass,
- the relevant manual tests pass,
- the product still respects the permission and privacy constraints in the PRD.

---

## 7. Slice overview

| Slice | Outcome | Main screens / flows | Status when done |
|---|---|---|---|
| 00 | Extension shell exists | Base shell | Extension loads unpacked |
| 01 | Shared constants, storage, URL guardrails | S1/S5 groundwork | Popup can determine page eligibility |
| 02 | Popup shell and screen renderer | S1, S2 stub, S5, S6 stub, S9 | User sees the product shape |
| 03 | Scene engine and restore infrastructure | S2, S3 groundwork, S7 | Apply/restore works with a dummy scene |
| 04 | Boardroom Mode end to end | S2, S3, S7 | First complete real scene works |
| 05 | Melodrama Mode | S2, S3, S7 | Second scene works |
| 06 | Cursed Mode | S2, S3, S7 | Third scene works |
| 07 | Switching, recovery, and error hardening | S3, S5, S6, S7 | Core flows are robust |
| 08 | Coffee support flow | S4, S10 | Donation experience works |
| 09 | About / Settings page | S8 | Settings and privacy page complete |
| 10 | Full QA and launch prep | All | MVP is release-ready |

---

# 8. Detailed slices

---

## Slice 00 — Project bootstrap and extension skeleton

### Goal
Create a clean extension skeleton that loads in Chrome and gives the project a stable structure.

### PRD coverage
- Platform and architecture basics
- Manifest V3 requirement
- Popup presence
- About / Settings page existence
- Minimal permission posture

### Tasks
- [ ] Create the folder structure from Section 4.
- [ ] Create `manifest.json` with:
  - [ ] `manifest_version: 3`
  - [ ] extension name placeholder
  - [ ] version `0.1.0`
  - [ ] `permissions: ["activeTab", "scripting", "storage"]`
  - [ ] `action.default_popup`
  - [ ] `background.service_worker`
  - [ ] `options_page`
  - [ ] icon references
- [ ] Create placeholder icons so the extension can load.
- [ ] Create minimal `popup.html`, `popup.css`, and `popup.js`.
- [ ] Create minimal `options.html`, `options.css`, and `options.js`.
- [ ] Create minimal `background/service-worker.js`.
- [ ] Add a small README with:
  - [ ] how to load unpacked extension
  - [ ] how to reload after code changes
  - [ ] what each folder does
- [ ] Add `.gitignore`.
- [ ] Load the extension in Chrome as unpacked.
- [ ] Verify popup opens without errors.
- [ ] Verify settings page opens without errors.

### Expected files touched
- `manifest.json`
- `popup/*`
- `options/*`
- `background/service-worker.js`
- `assets/icons/*`
- `README.md`
- `.gitignore`

### Acceptance criteria
- Extension loads successfully as unpacked.
- Popup opens.
- Settings page opens.
- Service worker is registered.
- No extra permissions beyond the 3 approved ones.

### Manual checks
- [ ] Load unpacked extension.
- [ ] Open popup.
- [ ] Open settings page.
- [ ] Open service worker console and confirm no errors.

### Notes
Do not build any real logic yet. This slice is only about structure and a stable shell.

---

## Slice 01 — Shared constants, storage wrapper, and URL eligibility

### Goal
Create the shared foundation that every later feature depends on.

### PRD coverage
- FR-05
- FR-10
- FR-24
- PRD Sections 14, 22, 23

### Tasks
- [ ] Create `shared/constants.js` for IDs, thresholds, and DOM marker strings.
- [ ] Create `shared/scene-meta.js` with scene names, labels, one-line descriptors, and card metadata.
- [ ] Create `shared/copy.js` for popup copy, trust text, error copy, support copy, and unsupported copy.
- [ ] Create `shared/storage.js` with:
  - [ ] `getSettings()`
  - [ ] `setSettings()`
  - [ ] `incrementUsageCount()`
  - [ ] `resetLocalData()`
  - [ ] safe defaults for missing keys
- [ ] Create `shared/urls.js` for URL eligibility rules.
- [ ] Implement `isUnsupportedUrl(url)` and return structured reasons:
  - [ ] `chrome_internal`
  - [ ] `web_store`
  - [ ] `extension_page`
  - [ ] `blocked_domain`
  - [ ] `sensitive_context`
- [ ] Start with explicit blocked patterns for MVP:
  - [ ] `chrome://*`
  - [ ] `chromewebstore.google.com/*`
  - [ ] extension pages
  - [ ] Gmail
  - [ ] Google Docs / Sheets / Slides editors
  - [ ] obvious payment / checkout pages when detected by domain/path heuristic
- [ ] Add a helper to read the active tab ID and URL in popup and service worker.
- [ ] Decide final PayPal placeholder constant location, even if the real URL comes later.

### Expected files touched
- `shared/constants.js`
- `shared/scene-meta.js`
- `shared/copy.js`
- `shared/storage.js`
- `shared/urls.js`
- `popup/popup.js`
- `background/service-worker.js`

### Acceptance criteria
- Popup code can determine whether the current page is eligible.
- Unsupported reason is structured, not a raw string blob.
- Storage wrapper returns defaults without crashing on first run.
- No page content is stored.

### Manual checks
- [ ] Normal article page returns supported.
- [ ] Chrome Web Store returns unsupported.
- [ ] `chrome://extensions` returns unsupported.
- [ ] Gmail returns unsupported.
- [ ] Local storage initializes correctly on first install.

### Notes
Keep URL blocking simple and explicit in MVP. Do not try to perfectly detect every risky page on the internet.

---

## Slice 02 — Popup shell, screen renderer, and first-use hint

### Goal
Create the popup UI and state machine shell before wiring real scene application.

### PRD coverage
- S1 Popup / Default state
- S2 Popup / Applying state (stub)
- S5 Unsupported state
- S6 Error state (stub)
- S9 First-use hint
- FR-01
- FR-02
- FR-17

### Tasks
- [ ] Build popup layout with:
  - [ ] header icon
  - [ ] product title
  - [ ] one-line subheading
  - [ ] 3 scene cards
  - [ ] trust note
  - [ ] support footer link
  - [ ] settings link/button
- [ ] Add first-use hint banner above the scene cards.
- [ ] Dismiss first-use hint after:
  - [ ] explicit close, or
  - [ ] first successful application later
- [ ] Build popup render states:
  - [ ] `default`
  - [ ] `applying`
  - [ ] `applied`
  - [ ] `unsupported`
  - [ ] `error`
- [ ] For now, `applied` and `error` can be skeleton states with placeholder data.
- [ ] Make scene cards keyboard accessible.
- [ ] Add visible focus styles.
- [ ] Keep popup within a standard extension popup width.
- [ ] Add support footer microcopy but keep it visually secondary.

### UI requirements
Each scene card must show:
- scene name
- one-line description
- obvious clickable area

Recommended descriptions:
- Boardroom Mode — “Make this page look like serious work.”
- Melodrama Mode — “Rewrite this page like a theatrical villain got involved.”
- Cursed Mode — “Give this tab a haunted makeover.”

### Expected files touched
- `popup/popup.html`
- `popup/popup.css`
- `popup/popup.js`
- `shared/copy.js`
- `shared/scene-meta.js`
- `shared/storage.js`

### Acceptance criteria
- User can open popup and understand the product immediately.
- All 3 scene cards are visible.
- Trust note is visible.
- First-use hint appears only for first-time users.
- Unsupported state renders instead of default when current tab is blocked.

### Manual checks
- [ ] Open popup on supported site.
- [ ] Open popup on unsupported site.
- [ ] Tab through all controls with keyboard.
- [ ] Press Enter / Space on a scene card.
- [ ] Confirm support footer is visible but not dominant.

### Notes
This slice is about the UI shell only. Real scene application comes next.

---

## Slice 03 — Scene engine, restore infrastructure, and dummy apply flow

### Goal
Build the shared runtime that can apply, restore, and inspect scene state on the current page.

### PRD coverage
- FR-07 to FR-16
- S2 Applying state
- S3 groundwork
- S7 On-page restore pill
- Flow A/B/C groundwork

### Core design for this slice
Use a single runtime namespace on the page, for example:

```js
window.SceneSwitchRuntime
```

That runtime should expose methods like:
- `getState()`
- `apply(sceneId)`
- `restore()`

The runtime must be idempotent:
- applying a scene when one is already active should restore first,
- restore should be safe to call even if no scene is active.

### Tasks
- [ ] Create `content/runtime.js` with the runtime singleton.
- [ ] Create `content/scene-engine.js` with shared apply/restore helpers.
- [ ] Create `content/restore-pill.js`.
- [ ] Create `content/state-bridge.js` or equivalent helper for structured responses.
- [ ] Implement page markers:
  - [ ] root node
  - [ ] active scene marker
  - [ ] stored original title
  - [ ] stored original text values
  - [ ] injected style tag IDs
- [ ] Implement safe DOM target collection helpers in `shared/dom.js` and `shared/text.js`.
- [ ] Skip these contexts when collecting targets:
  - [ ] `input`
  - [ ] `textarea`
  - [ ] `[contenteditable="true"]`
  - [ ] password fields
  - [ ] `code`, `pre`, `script`, `style`
  - [ ] long paragraphs above threshold
  - [ ] compose/editable document regions
- [ ] Add a max target count to avoid heavy pages, for example 100–150 nodes max.
- [ ] Implement the on-page restore pill:
  - [ ] scene name label
  - [ ] Restore button
  - [ ] optional minimize/close not required for MVP unless easy
- [ ] Wire service worker commands for:
  - [ ] `applySceneToActiveTab(sceneId)`
  - [ ] `restoreSceneInActiveTab()`
  - [ ] `getActiveSceneForTab()`
  - [ ] `reloadActiveTabViaScript()`
- [ ] Wire popup buttons to the service worker.
- [ ] Add a dummy scene implementation to prove the engine works:
  - [ ] change title
  - [ ] inject a tiny banner
  - [ ] mount restore pill
- [ ] Render popup `applying` and placeholder `applied` states from live action results.
- [ ] Disable repeat clicks while apply is in progress.

### Structured response contract
Every runtime action should return a structured object.

Example:

```js
{
  ok: true,
  sceneId: 'boardroom',
  reason: null,
  needsReload: false
}
```

Failure example:

```js
{
  ok: false,
  sceneId: null,
  reason: 'restore_failed',
  needsReload: true
}
```

### Expected files touched
- `content/runtime.js`
- `content/scene-engine.js`
- `content/restore-pill.js`
- `content/state-bridge.js`
- `shared/dom.js`
- `shared/text.js`
- `background/service-worker.js`
- `popup/popup.js`
- `content/styles/restore-pill.css`

### Acceptance criteria
- Dummy scene can be applied on a supported page.
- Dummy scene can be restored.
- Restore pill appears on page and works.
- Popup can query whether a scene is active.
- Multiple rapid clicks do not cause duplicate broken state.

### Manual checks
- [ ] Apply dummy scene on a normal site.
- [ ] Restore from popup.
- [ ] Apply again and restore from on-page pill.
- [ ] Close popup during apply and confirm scene still completes.
- [ ] Open popup after apply and confirm it knows a scene is active.
- [ ] Rapid-click a card and confirm only one action proceeds.

### Notes
Do not move to a real scene until this infrastructure is stable. The entire MVP depends on restore being trustworthy.

---

## Slice 04 — Boardroom Mode end to end

### Goal
Ship the first complete real scene from popup click to restore.

### PRD coverage
- Feature 2 — Boardroom Mode
- S2 Applying state
- S3 Scene applied state
- S7 Restore pill
- Flow A and C
- Boardroom acceptance criteria

### Tasks
- [ ] Create `content/scenes/boardroom.js`.
- [ ] Create `content/styles/boardroom.css`.
- [ ] Implement Boardroom title mapping with sensible fallbacks:
  - [ ] Reddit → Community Feedback Review
  - [ ] YouTube → Media Performance Dashboard
  - [ ] Amazon → Procurement Overview
  - [ ] LinkedIn → Talent Pipeline Console
  - [ ] generic fallback for unknown sites
- [ ] Add a slim top KPI ribbon using injected DOM.
- [ ] Add KPI chip examples:
  - [ ] Sync Health: 98%
  - [ ] Review Queue: 12
  - [ ] Focus Score: High
  - [ ] Risk Level: Low
- [ ] Add a light corporate rewrite dictionary for short visible labels:
  - [ ] Trending → Priority Signals
  - [ ] Recommended for you → Suggested Review Items
  - [ ] Comments → Feedback
  - [ ] Popular now → Current Activity
- [ ] Apply neutral corporate CSS treatment:
  - [ ] cleaner surfaces
  - [ ] subdued accents
  - [ ] optional mild desaturation of loud media blocks
- [ ] Keep page usable and clickable.
- [ ] Update popup `applied` state to show:
  - [ ] active scene badge
  - [ ] Restore button
  - [ ] scene switch buttons/cards
- [ ] Increment `usageCount` only after successful application.
- [ ] If `rememberLastUsedScene` is enabled, store Boardroom as the last used scene when applied.
- [ ] Mark `firstRunHintSeen` after first successful application.

### Expected files touched
- `content/scenes/boardroom.js`
- `content/styles/boardroom.css`
- `content/scene-engine.js`
- `popup/popup.js`
- `shared/scene-meta.js`
- `shared/storage.js`

### Acceptance criteria
- Boardroom Mode visibly transforms the page.
- The title changes and later restores.
- The KPI ribbon appears.
- The popup shows success state with restore.
- The page remains usable.
- Restore works from both popup and restore pill.

### Manual checks
Test on:
- [ ] Reddit thread or homepage
- [ ] YouTube homepage
- [ ] Amazon product page
- [ ] LinkedIn feed or profile
- [ ] Wikipedia article

For each site:
- [ ] Boardroom effect is obvious
- [ ] no form fields are altered
- [ ] restore works cleanly

### Notes
Boardroom is the first truly complete slice. Once this works, the extension already has a demoable core.

---

## Slice 05 — Melodrama Mode

### Goal
Add the second scene using deterministic theatrical text rewrites.

### PRD coverage
- Feature 3 — Melodrama Mode
- S2 / S3 / S7 scene flow
- Melodrama acceptance criteria

### Tasks
- [ ] Create `content/scenes/melodrama.js`.
- [ ] Reuse the shared safe target collector from Slice 03.
- [ ] Implement a deterministic phrase bank and replacer.
- [ ] Add exact or near-exact replacements for common UI text such as:
  - [ ] Search → Seek your destiny
  - [ ] Continue → Let the tale proceed
  - [ ] View all → Behold the full spectacle
  - [ ] Sign in → Reveal thy identity
  - [ ] Add to cart → Summon this treasure
  - [ ] Apply now → Step forth and test your fate
- [ ] Add generic tone filters for short labels when no exact replacement exists.
- [ ] Enforce strict safety limits:
  - [ ] skip long text above threshold
  - [ ] skip legal text
  - [ ] skip code blocks
  - [ ] skip forms and editors
  - [ ] do not rewrite input values
- [ ] Preserve layout as much as possible by:
  - [ ] limiting replacement length
  - [ ] capping transformed nodes
  - [ ] avoiding every single text node on the page
- [ ] Update popup scenes so Melodrama is a full live option.

### Recommended implementation pattern
Process text in this order:
1. exact phrase dictionary,
2. short-label pattern rewrite,
3. skip if replacement becomes too long,
4. save original before changing.

### Expected files touched
- `content/scenes/melodrama.js`
- `content/scene-engine.js`
- `shared/text.js`
- `popup/popup.js`

### Acceptance criteria
- Melodrama Mode produces clearly dramatic copy.
- It feels funny, not unreadable.
- Layout stays usable on tested pages.
- Restore works cleanly.

### Manual checks
Test on:
- [ ] LinkedIn
- [ ] Amazon
- [ ] Wikipedia
- [ ] Reddit

For each site:
- [ ] key visible labels are transformed
- [ ] long paragraphs are mostly untouched
- [ ] buttons still work
- [ ] restore works

### Notes
Do not try to dramatize the entire page. Selective transformation is funnier and safer.

---

## Slice 06 — Cursed Mode

### Goal
Add the third scene with eerie visuals and ominous label changes.

### PRD coverage
- Feature 4 — Cursed Mode
- S2 / S3 / S7 scene flow
- Cursed acceptance criteria

### Tasks
- [ ] Create `content/scenes/cursed.js`.
- [ ] Create `content/styles/cursed.css`.
- [ ] Add a dark visual treatment that keeps the site recognizable.
- [ ] Add subtle atmospheric styling only:
  - [ ] darker surfaces
  - [ ] eerie shadows
  - [ ] restrained glow or vignette if tasteful
  - [ ] no strong flashing
- [ ] Add label rewrites such as:
  - [ ] Buy now → Claim before it vanishes
  - [ ] Deal → Forbidden bargain
  - [ ] Recommended → Whispered suggestion
- [ ] Change the title to a cursed version with a generic fallback.
- [ ] Ensure contrast stays readable enough.
- [ ] Ensure motion remains minimal.
- [ ] Update popup so Cursed is a full live option.

### Expected files touched
- `content/scenes/cursed.js`
- `content/styles/cursed.css`
- `content/scene-engine.js`
- `popup/popup.js`

### Acceptance criteria
- The page becomes visibly haunted but still recognizable.
- The text tone shifts in selected areas.
- The page remains usable.
- Restore works cleanly.

### Manual checks
Test on:
- [ ] Amazon
- [ ] news site
- [ ] Reddit
- [ ] blog/article page

For each site:
- [ ] visual mood clearly changes
- [ ] no flashing or accessibility-hostile effects
- [ ] restore works

### Notes
Cursed Mode should feel screenshotable. Keep it visually distinct from Boardroom.

---

## Slice 07 — Scene switching, recovery paths, unsupported contexts, and error hardening

### Goal
Make the core interaction robust enough for real users.

### PRD coverage
- US-B2
- US-B3
- US-C3
- US-E1
- US-E2
- FR-09
- FR-26
- FR-27
- FR-28
- S5 Unsupported state
- S6 Error state
- Flow B, C, and E

### Tasks
- [ ] Ensure switching scenes always follows this order:
  - [ ] detect existing scene
  - [ ] restore existing scene
  - [ ] apply new scene
- [ ] If restore is incomplete, return a failure with reload fallback.
- [ ] Add popup `error` state with:
  - [ ] Retry button
  - [ ] Reload tab button
  - [ ] About / Settings link
- [ ] Add clearer `unsupported` state copy based on structured reason.
- [ ] Improve blocked context checks with a second layer:
  - [ ] DOM check for contenteditable-heavy pages
  - [ ] obvious compose areas
  - [ ] obvious payment form signals
- [ ] Ensure popup reflects current active scene when reopened.
- [ ] Ensure scene buttons are disabled while applying.
- [ ] Ensure popup handles user closing mid-apply without leaving state broken.
- [ ] Add a clean `reloadActiveTabViaScript()` path rather than adding extra permissions.
- [ ] Verify restore pill disappears on restore.
- [ ] Verify switching scenes updates restore pill label.

### Expected files touched
- `popup/popup.js`
- `content/runtime.js`
- `content/scene-engine.js`
- `shared/urls.js`
- `shared/dom.js`
- `background/service-worker.js`
- `content/restore-pill.js`

### Acceptance criteria
- Switching from one scene to another works without manual refresh.
- Unsupported pages show explanation instead of attempting injection.
- Error state gives the user a recovery path.
- Reload fallback works when needed.

### Manual checks
- [ ] Apply Boardroom, then switch to Melodrama.
- [ ] Apply Melodrama, then switch to Cursed.
- [ ] Restore after each switch.
- [ ] Trigger unsupported state on blocked pages.
- [ ] Simulate a partial failure and confirm reload fallback appears.
- [ ] Confirm restore pill updates correctly when switching scenes.

### Notes
This slice is about trust. The product must feel reversible and safe before monetization is added.

---

## Slice 08 — Coffee support flow and PayPal integration

### Goal
Implement the optional support experience without making the extension feel needy.

### PRD coverage
- Feature 6 — Coffee support flow
- S4 Support card expanded state
- S10 External support destination
- FR-17 to FR-22
- Flow D

### Tasks
- [ ] Finalize support copy in `shared/copy.js`.
- [ ] Add subtle support footer to popup default and applied states:
  - [ ] “Made you laugh? Buy me a coffee.”
- [ ] Add support card eligibility logic:
  - [ ] show only if `usageCount >= 3`
  - [ ] only if `supportPromptsEnabled === true`
  - [ ] only if `Date.now() > supportPromptCooldownUntil`
- [ ] Build expanded support card with:
  - [ ] title
  - [ ] short founder note
  - [ ] 3 support amount buttons
  - [ ] Not now
  - [ ] Hide support prompts
- [ ] Add preset PayPal.Me links for:
  - [ ] Coffee — $3
  - [ ] Double Coffee — $5
  - [ ] Sponsor Chaos — $8
- [ ] Open PayPal links in a new tab.
- [ ] Implement “Not now” cooldown, for example 7 days.
- [ ] Implement “Hide support prompts” by setting `supportPromptsEnabled = false`.
- [ ] Keep the extension fully usable whether or not the user interacts with support UI.
- [ ] Ensure support card does not hide restore and scene actions.

### UX rules
- Do not auto-open PayPal.
- Do not show a blocking modal.
- Do not show the expanded card before the user has gotten value.
- Do not require payment to unlock anything in MVP.

### Expected files touched
- `popup/popup.js`
- `popup/popup.css`
- `shared/copy.js`
- `shared/storage.js`
- `background/service-worker.js`
- `options/options.js`

### Acceptance criteria
- Support footer is subtle and always secondary.
- Expanded support card appears only after the threshold is reached.
- All CTAs open the correct PayPal.Me URLs.
- User can dismiss or disable future support prompts.

### Manual checks
- [ ] Set `usageCount` below threshold and confirm no expanded card.
- [ ] Set `usageCount` to 3 and confirm expanded card appears.
- [ ] Click each support amount and confirm correct URL opens.
- [ ] Click “Not now” and confirm cooldown is stored.
- [ ] Click “Hide support prompts” and confirm card no longer appears.
- [ ] Confirm default footer still remains subtle.

### Notes
Keep this slice emotionally light. The donation flow should feel like a bonus, not a funnel.

---

## Slice 09 — About / Settings page

### Goal
Implement the permanent settings and trust page.

### PRD coverage
- S8 About / Settings page
- FR-23
- FR-24
- FR-25
- Privacy and trust sections of the PRD

### Tasks
- [ ] Build `options.html` and `options.css` into a real page.
- [ ] Add the following sections:
  - [ ] What Scene Switch does
  - [ ] Supported page examples
  - [ ] Unsupported / blocked page examples
  - [ ] Privacy summary
  - [ ] Settings controls
  - [ ] Support the creator
  - [ ] Version label
- [ ] Add settings controls:
  - [ ] show support prompts
  - [ ] remember last used scene
  - [ ] show on-page restore pill
  - [ ] reset local data button
- [ ] Implement all settings persistence in `chrome.storage.local`.
- [ ] Add support buttons/links using the same PayPal config.
- [ ] Add a founder note and thank-you copy.
- [ ] Add a visible plain-language privacy summary:
  - [ ] no browsing history collection
  - [ ] no account
  - [ ] no cloud sync
  - [ ] local settings only
- [ ] Wire “Reset local data” to clear storage keys used by the extension.

### Expected files touched
- `options/options.html`
- `options/options.css`
- `options/options.js`
- `shared/storage.js`
- `shared/copy.js`

### Acceptance criteria
- Settings page reflects current saved values.
- Toggling settings persists correctly.
- Reset local data works.
- Privacy summary is clear and visible.
- Support section exists but is not aggressive.

### Manual checks
- [ ] Open settings page from popup.
- [ ] Toggle support prompts off and reopen popup.
- [ ] Toggle restore pill off and apply a scene.
- [ ] Toggle remember last used scene on/off.
- [ ] Reset local data and confirm state returns to defaults.

### Notes
This page is part of the trust story. Keep it calm and plain, not over-designed.

---

## Slice 10 — Full QA, polish, and launch prep

### Goal
Turn the built MVP into a release candidate and verify that it matches the PRD.

### PRD coverage
- QA checklist
- Launch requirements
- Success criteria
- Store positioning
- All screens and flows

### Part A — Functional regression
- [ ] Install extension in a clean Chrome profile.
- [ ] Verify first-use hint.
- [ ] Apply Boardroom.
- [ ] Apply Melodrama.
- [ ] Apply Cursed.
- [ ] Restore from popup.
- [ ] Restore from on-page pill.
- [ ] Switch between all scene pairs.
- [ ] Confirm `usageCount` increments only on success.
- [ ] Confirm support card threshold behavior.
- [ ] Confirm support prompt dismissal behavior.
- [ ] Confirm settings page toggles work.
- [ ] Confirm reset local data works.

### Part B — Cross-site QA
Test each scene on these pages:
- [ ] Reddit
- [ ] LinkedIn
- [ ] Amazon
- [ ] Wikipedia
- [ ] YouTube homepage
- [ ] one news site
- [ ] one blog/article page

For each page confirm:
- [ ] scene applies
- [ ] result is obvious
- [ ] page still functions normally enough
- [ ] restore works

### Part C — Negative QA
Confirm unsupported behavior on:
- [ ] Chrome Web Store
- [ ] `chrome://extensions`
- [ ] Gmail
- [ ] Google Docs
- [ ] payment / checkout page

### Part D — Recovery QA
- [ ] Rapid repeated click on scene card
- [ ] Close popup during apply
- [ ] Switch scenes repeatedly
- [ ] Attempt restore twice
- [ ] Trigger reload fallback path
- [ ] Confirm no leftover pill after restore

### Part E — Accessibility / UX QA
- [ ] Popup keyboard navigation
- [ ] visible focus states
- [ ] readable contrast
- [ ] no aggressive flashing in Cursed Mode
- [ ] support UI remains secondary

### Part F — Code cleanup
- [ ] remove debug console noise
- [ ] remove dead code and placeholder copy
- [ ] centralize thresholds and labels
- [ ] confirm no duplicate scene metadata
- [ ] confirm no accidental network requests

### Part G — Chrome Web Store prep
- [ ] finalize extension name
- [ ] finalize short description
- [ ] finalize single-purpose statement
- [ ] finalize privacy copy
- [ ] finalize support email/contact
- [ ] finalize icons
- [ ] capture screenshots
- [ ] record 3 short demo clips:
  - [ ] LinkedIn → Melodrama
  - [ ] Amazon → Cursed
  - [ ] YouTube or Reddit → Boardroom
- [ ] confirm PayPal.Me links are production-ready

### Release acceptance criteria
- The extension matches the PRD scope.
- All 3 scenes work.
- Restore works reliably enough for MVP.
- Donation flow is optional and non-blocking.
- Unsupported and error states are understandable.
- Settings page is complete.
- The extension is ready for store submission.

### Manual sign-off checklist
- [ ] Product feels understandable in under 5 seconds.
- [ ] Transformation feels immediate.
- [ ] Trust story feels clean.
- [ ] At least one scene feels slightly useful.
- [ ] At least two scenes feel screenshot-worthy.
- [ ] Support ask feels earned.

---

# 9. Cross-slice implementation details

These are shared rules that should be followed throughout the build.

---

## 9.1 Popup state machine

Use a small explicit popup state machine rather than ad hoc booleans.

Suggested states:
- `default`
- `applying`
- `applied`
- `unsupported`
- `error`
- `supportExpanded`

Suggested popup context:

```js
{
  popupState: 'default',
  currentScene: null,
  activeTabId: null,
  unsupportedReason: null,
  canShowSupportCard: false,
  isFirstRun: false
}
```

This keeps screen rendering predictable.

---

## 9.2 Scene runtime contract

Each scene implementation should expose the same shape.

Suggested shape:

```js
{
  id: 'boardroom',
  apply(context) {},
  restore(context) {}
}
```

Where `context` may include:
- root/document refs
- helper functions
- shared text target collector
- functions to inject styles and register cleanup

Every scene should rely on shared helpers for:
- saving original title
- saving original text
- marking touched nodes
- injecting scene style tags
- mounting and unmounting restore pill

---

## 9.3 Safe DOM targeting rules

These rules apply to all scenes:

### Allowed target priority
Prefer these first:
- headings
- buttons
- short labels
- chips
- nav labels
- short card titles

### Avoid these always
- `input`, `textarea`, `select`
- password fields
- contenteditable regions
- large article paragraphs
- code blocks
- markdown editors
- compose windows
- payment forms
- hidden nodes

### Practical thresholds
Use conservative defaults and keep them centralized:
- minimum trimmed text length: 2
- maximum text length for rewrite: 60 or 80
- maximum number of transformed nodes per scene: 120
- skip if replacement grows text too much

---

## 9.4 Restore strategy

Restore must work even if the popup is closed.

Recommended approach:
- store original text in `data-scene-switch-original-text`
- store original title in a runtime marker or root dataset
- remove injected style tags by known IDs
- remove injected top bars / ribbons / restore pill by known IDs
- clear active-scene marker
- if anything fails or markers remain, return `needsReload: true`

Do not rely only on in-memory variables for restore.

---

## 9.5 Error handling strategy

Never show raw thrown errors to the user.

Map internal errors into a small set of UI-safe reasons:
- `unsupported_page`
- `apply_failed`
- `restore_failed`
- `scene_not_found`
- `page_context_error`

Then map those to user copy in `shared/copy.js`.

---

## 9.6 Support flow behavior

Use this logic:

```js
canShowSupportCard = (
  usageCount >= 3 &&
  supportPromptsEnabled === true &&
  Date.now() > supportPromptCooldownUntil
)
```

Behavior rules:
- “Not now” sets a cooldown timestamp
- “Hide support prompts” disables future expanded prompts
- subtle footer remains secondary and non-blocking
- About page support section is always allowed

---

## 9.7 Last used scene behavior

If `rememberLastUsedScene` is enabled:
- store the last successfully applied scene ID
- optionally mark it in the popup UI with a small “Last used” indicator
- do not auto-apply it on new pages in MVP

Remembering is allowed. Auto-running is not.

---

## 9.8 Restore pill behavior

Default:
- enabled
- small
- bottom-right
- scene label + Restore action

Rules:
- should not block important page controls
- should disappear on restore
- should update when switching scenes
- should not appear when the setting is disabled

---

# 10. PRD traceability map

Use this section to confirm nothing important was dropped.

| PRD area | Covered in slice(s) |
|---|---|
| Extension skeleton / MV3 / permissions | 00, 01 |
| Popup default state (S1) | 02 |
| Applying state (S2) | 03, 04 |
| Scene applied state (S3) | 04, 05, 06, 07 |
| Support card (S4) | 08 |
| Unsupported state (S5) | 02, 07 |
| Error state (S6) | 02, 07 |
| On-page restore pill (S7) | 03, 04, 07 |
| About / Settings (S8) | 09 |
| First-use hint (S9) | 02, 04 |
| External PayPal destination (S10) | 08, 09 |
| Boardroom Mode | 04 |
| Melodrama Mode | 05 |
| Cursed Mode | 06 |
| Restore system | 03, 04, 07 |
| Support flow | 08, 09 |
| Privacy / local-only storage | 01, 09 |
| QA checklist | 10 |
| Launch requirements | 10 |

---

# 11. Suggested working order inside each day

If this is built quickly, use this pattern:

### Start of session
- reload extension
- open service worker console
- open 2–3 test tabs
- pick one slice only

### During slice
- implement smallest working version first
- verify on one site
- then harden
- then clean up

### End of session
- run the manual checks for that slice
- update any constants or copy centrally
- leave the extension in a working state

---

# 12. Final exit criteria for MVP

The MVP is done when all of the following are true:

- [ ] Extension loads and works as unpacked.
- [ ] Popup explains the product in one glance.
- [ ] Boardroom Mode works on supported pages.
- [ ] Melodrama Mode works on supported pages.
- [ ] Cursed Mode works on supported pages.
- [ ] Restore works from popup.
- [ ] Restore works from on-page pill.
- [ ] Scene switching works.
- [ ] Unsupported pages show a clean explanation.
- [ ] Error state offers retry or reload fallback.
- [ ] Support footer exists.
- [ ] Support card appears after 3 successful uses.
- [ ] PayPal.Me donation links open correctly.
- [ ] Settings page is complete.
- [ ] Privacy language is present and accurate.
- [ ] Manual QA pass is complete.
- [ ] Store assets are ready.

When all boxes are checked, the PRD is implemented closely enough to call the MVP complete.

---

# 13. One-line implementation summary

Build Scene Switch in this order:

> **shell → shared rules → popup → restore engine → Boardroom → Melodrama → Cursed → hardening → coffee flow → settings → QA → launch**

