# Scene Switch — MVP Product Requirements Document

**Document status:** Draft  
**Version:** 0.1  
**Date:** 2026-04-18  
**Product owner:** Founder  
**Platform:** Chrome extension (desktop, Manifest V3)  
**Document purpose:** Define the MVP of Scene Switch in enough detail to design, build, test, launch, and submit it to the Chrome Web Store.

---

## 1. Executive summary

Scene Switch is a lightweight Chrome extension that transforms the **current webpage** into a different themed "scene" with one click.

The MVP ships with **three handcrafted scenes**:

1. **Boardroom Mode** — makes the current page look like a serious corporate dashboard or work surface.
2. **Melodrama Mode** — rewrites visible page copy into exaggerated dramatic language.
3. **Cursed Mode** — gives the page a dark, eerie, absurd vibe.

The product is intentionally:
- fast,
- funny,
- local-first,
- reversible,
- low-permission,
- and simple enough to spread through short demos and screenshots.

The business model for MVP is **free to use**, with an optional **"Buy me a coffee"** donation flow that opens the founder's PayPal.Me link **after the user has already experienced value**.

This is **not** an AI productivity tool, not a history-tracking behavior engine, and not a broad browser customization suite. It is a compact, delightful extension built around a single promise:

> **Turn this tab into a different scene right now.**

---

## 2. Problem statement

Most browser novelty products fall into one of these buckets:

- one-joke text changers,
- privacy-sketchy browsing analyzers,
- tab hiders / panic buttons,
- or bloated browser companions.

These products often have one or more of the following weaknesses:
- they ask for broad permissions,
- they are not clearly reversible,
- they become annoying after one use,
- they are funny but not shareable,
- or they feel too gimmicky to support financially.

There is room for a product that is:
- **visually immediate**, so it works well in short clips,
- **safe-feeling**, because it only acts on the current tab after a click,
- **harmless**, because it does not collect browsing data,
- **funny**, because the transformations are obvious and absurd,
- and **supportable**, because users may voluntarily tip the creator after enjoying it.

---

## 3. Product vision

Create the most delightful one-click page transformation extension for Chrome.

The extension should feel like:
- a **magic button**,
- not a startup,
- not a dashboard,
- not a subscription funnel.

Users should be able to:
- click the extension,
- pick a scene,
- watch the page instantly transform,
- restore it just as easily,
- and optionally support the creator.

---

## 4. Goals

### 4.1 Primary goals

1. **Instant delight**
   - A user should understand the product in under 5 seconds.
   - The transformation should feel immediate.

2. **One-click usability**
   - The main action should be available directly from the extension popup.
   - No onboarding maze.

3. **Reversible experience**
   - Users must be able to undo the scene easily.

4. **Low trust barrier**
   - Minimal permissions.
   - No account.
   - No sign-in.
   - No browsing history collection.

5. **Viral-friendly output**
   - Scenes should be visually obvious and screenshot/video friendly.

6. **Donation support without friction**
   - "Buy me a coffee" should be present, but secondary.
   - The product must feel valuable even if the user never donates.

### 4.2 Success criteria for MVP

The MVP will be considered successful if it achieves most of the following:

- Users can apply a scene in **2 clicks or fewer** from the popup.
- Users can restore the original page in **1 click** from either popup or on-page restore pill.
- Scene application succeeds on supported sites in at least **90% of tested cases**.
- Support CTA appears only after delight and does not block usage.
- Extension can be submitted to the Chrome Web Store with a clear single-purpose positioning.
- Founder can ship without backend infrastructure.

---

## 5. Non-goals

The following are explicitly **out of scope for MVP**:

- AI-generated rewrites
- Chat features
- User accounts
- Cloud sync
- Cross-device sync
- Browser history analysis
- Full website-specific templates for dozens of sites
- Mobile browser support
- Firefox / Safari ports
- Team collaboration
- Payments inside the extension
- Subscriptions
- Social sharing tools inside the extension
- User-generated themes
- Theme marketplace
- Audio narration
- Automatic always-on mode
- Operating as a general panic button replacement
- Any product behavior that requires broad surveillance-style permissions

---

## 6. Target users

### 6.1 Primary audience

**Internet-native users who enjoy playful tools and browser customization**
- people who like tiny software
- meme-friendly users
- tinkerers
- students
- professionals who enjoy novelty during browsing breaks

### 6.2 Secondary audience

**Users who want a humorous "save me" layer for awkward browsing moments**
- remote workers
- students in class
- people who want to quickly make a page look less obviously distracting

### 6.3 Tertiary audience

**Creators and demo-watchers**
- people who discover products through short clips
- users who like "wait, how did you do that?" moments

---

## 7. Jobs to be done

### Functional JTBD
- When I am on a webpage, I want to transform it into a themed version instantly so I can enjoy a different experience without installing something invasive.

### Emotional JTBD
- I want a browser tool that feels clever and funny, not creepy or needy.

### Social JTBD
- I want to show someone a surprising transformation and get a reaction quickly.

### Support JTBD
- If the extension genuinely made me laugh or helped me in a funny way, I want an easy way to tip the creator.

---

## 8. Product principles

1. **One click before anything else**
   - The user should never be more than one interaction away from a scene.

2. **Runs only when invited**
   - The extension acts only on the active tab after explicit user action.

3. **Local, harmless, reversible**
   - No cloud required.
   - No hidden tracking.
   - Easy restore.

4. **Funny first, useful second**
   - The product is primarily delight software.
   - Utility is a bonus, especially in Boardroom Mode.

5. **Minimal creepiness**
   - No permission bloat.
   - No history scanning.
   - No reading email or personal documents.

6. **Ask for support after delight**
   - The coffee ask must never come before the payoff.

---

## 9. Scope of the MVP

### 9.1 In scope

- Chrome extension using Manifest V3
- Browser action popup
- 3 scenes:
  - Boardroom Mode
  - Melodrama Mode
  - Cursed Mode
- On-click injection into active tab
- Restore original page
- Switch between scenes
- Usage counter stored locally
- Subtle support link in popup
- Expanded support card after repeated successful usage
- Options / About page
- Unsupported-site detection
- Error handling for failed injection
- Local settings storage
- Clear privacy language

### 9.2 Out of scope for MVP

- AI writing or inference
- Accounts or sign-in
- Browser-wide overlays
- Always-on page mutation
- Remote configuration
- Analytics dashboards
- Multiple language support
- Community theme packs
- Payment processing inside the extension
- A standalone web app version

---

## 10. MVP definition

The MVP is complete when a user can:

1. install the extension,
2. click the extension on a supported webpage,
3. choose one of 3 scenes,
4. see the page transform immediately,
5. restore the page,
6. understand that the extension is local and safe,
7. optionally donate via PayPal.Me after using it.

---

## 11. Core user stories

### Epic A — Apply a scene

**US-A1**  
As a user, I want to open the extension popup and immediately understand what the extension does.

**US-A2**  
As a user, I want to apply Boardroom Mode to the current tab with one click.

**US-A3**  
As a user, I want to apply Melodrama Mode to the current tab with one click.

**US-A4**  
As a user, I want to apply Cursed Mode to the current tab with one click.

**US-A5**  
As a user, I want the transformation to feel instant and obvious.

### Epic B — Restore and switch

**US-B1**  
As a user, I want to restore the page after applying a scene.

**US-B2**  
As a user, I want to switch from one scene to another without manually refreshing.

**US-B3**  
As a user, I want the original page to be recoverable even if a scene partly fails.

### Epic C — Trust and safety

**US-C1**  
As a privacy-conscious user, I want to know that the extension does not collect my browsing history.

**US-C2**  
As a user, I want the extension to run only on the current page when I click it.

**US-C3**  
As a user, I want clear messaging when the extension cannot run on a page.

### Epic D — Support the creator

**US-D1**  
As a satisfied user, I want a simple way to buy the creator a coffee.

**US-D2**  
As a user, I do not want the donation ask to block my experience.

**US-D3**  
As a user, I want to dismiss support prompts if I am not interested.

### Epic E — Reliability

**US-E1**  
As a user, I want the extension to avoid breaking forms, editors, or checkout flows.

**US-E2**  
As a user, I want clear error handling if scene application fails.

**US-E3**  
As a user, I want the popup to remain fast and understandable even on repeated use.

---

## 12. Functional requirements

### 12.1 Core extension behavior

**FR-01**  
The extension shall provide a browser action popup as the main interaction surface.

**FR-02**  
The popup shall present exactly 3 scene choices in MVP.

**FR-03**  
The extension shall apply a selected scene only to the currently active tab.

**FR-04**  
The extension shall require explicit user action before modifying a tab.

**FR-05**  
The extension shall use only local storage for settings and counters in MVP.

**FR-06**  
The extension shall not require account creation or sign-in.

**FR-07**  
The extension shall support scene restore from popup.

**FR-08**  
The extension shall support scene restore from an on-page restore pill.

**FR-09**  
If a new scene is selected while another scene is active, the extension shall first restore the page state, then apply the new scene.

**FR-10**  
The extension shall detect restricted or unsupported pages and show an explanatory state instead of attempting injection.

### 12.2 Scene engine

**FR-11**  
Each scene shall be applied by injecting CSS and/or JavaScript into the current tab.

**FR-12**  
Each scene shall mark injected elements in a way that enables removal or restore.

**FR-13**  
The page title may be transformed and later restored.

**FR-14**  
Scene logic shall not modify input values, textareas, contenteditable regions, or password fields.

**FR-15**  
Scene logic shall avoid interacting with payment forms, email composition areas, or documents/editors in MVP.

**FR-16**  
Scene logic shall prioritize visible, low-risk content nodes such as headings, buttons, labels, and short text blocks.

### 12.3 Support / donation

**FR-17**  
The popup shall include a subtle, always-available support link or microcopy.

**FR-18**  
After 3 successful scene applications, the popup shall show an expanded support card.

**FR-19**  
The expanded support card shall contain at least one "Buy me a coffee" CTA that opens PayPal.Me in a new tab.

**FR-20**  
The support card shall be dismissible.

**FR-21**  
The user shall be able to hide support prompts from the options page.

**FR-22**  
The product shall remain fully functional regardless of whether the user donates.

### 12.4 Options and settings

**FR-23**  
The extension shall provide an About / Settings page.

**FR-24**  
The settings page shall include:
- support prompt toggle,
- reset local data,
- privacy summary,
- support links.

**FR-25**  
The extension may remember the last used scene locally.

### 12.5 Error handling

**FR-26**  
If injection fails, the popup shall show an error state with retry and restore/reload guidance.

**FR-27**  
If a page is unsupported, the popup shall explain why.

**FR-28**  
If restore cannot be completed cleanly, the extension shall provide a fallback action: reload the current page.

---

## 13. Non-functional requirements

### 13.1 Performance
- Popup should open quickly.
- Scene application should feel near-instant on normal pages.
- The extension should not run expensive background observers in MVP.

### 13.2 Privacy
- No browsing history collection.
- No account.
- No remote storage.
- No analytics required for MVP.

### 13.3 Security / trust
- Minimal permissions only.
- No hidden network calls except opening external support links.
- Clear privacy language in store listing and About page.

### 13.4 Reliability
- Restore should work in the majority of tested cases.
- Scene code should avoid broad DOM rewrites that destabilize pages.

### 13.5 Accessibility
- Popup must be keyboard navigable.
- Buttons must have clear labels.
- Motion should be minimal and avoid strong flashing effects.

---

## 14. Permissions and architecture constraints

### 14.1 Required permissions
- `activeTab`
- `scripting`
- `storage`

### 14.2 Not allowed in MVP
- `history`
- broad host permissions beyond what is required
- persistent all-site monitoring
- invasive content collection

### 14.3 Technical approach
- Manifest V3
- popup UI for scene selection
- scripting injection into active tab
- local storage for counters and preferences
- no backend

---

## 15. Feature breakdown

## 15.1 Feature 1 — Scene picker popup

The popup is the primary product screen.

It must:
- explain the product in one glance,
- show the 3 scene choices,
- communicate trust,
- expose restore when relevant,
- and lightly surface support.

### Required content
- product name / icon
- short subheading
- 3 scene cards
- privacy/trust note
- support footer

---

## 15.2 Feature 2 — Boardroom Mode

### Purpose
Turn the page into a fake serious work surface.

### Desired emotional result
- "This looks like work now."
- "This is ridiculous but oddly useful."

### Transformation rules
- inject a slim top bar with fake KPI chips
- swap page title to a corporate-style title
- restyle page toward neutral / dashboard-like tones
- reduce visual chaos where possible
- add tiny badges such as:
  - Review
  - Active
  - Synced
- optionally relabel selected visible phrases into corporate language

### Safe limits
- do not alter forms
- do not intercept clicks
- do not break navigation
- do not fake actual browser chrome

### Example title transformations
- YouTube → "Media Performance Dashboard"
- Reddit → "Community Feedback Review"
- Amazon → "Procurement Overview"
- LinkedIn → "Talent Pipeline Console"

---

## 15.3 Feature 3 — Melodrama Mode

### Purpose
Turn visible page text into dramatic, theatrical language.

### Desired emotional result
- "This page is suddenly absurd."
- "I need to screenshot this."

### Transformation rules
- rewrite visible short text nodes only
- rewrite headings, selected buttons, labels, page title
- use deterministic phrase rules, not AI
- preserve layout as much as possible

### Examples
- "Add to cart" → "Summon this treasure"
- "Apply now" → "Step forth and test your fate"
- "Your profile" → "The saga of your ambition"

### Safe limits
- do not rewrite text inside input fields
- do not rewrite long paragraphs above a defined length threshold
- do not modify editable documents or compose areas

---

## 15.4 Feature 4 — Cursed Mode

### Purpose
Give the page a spooky, eerie, weird atmosphere.

### Desired emotional result
- "This website became haunted."
- "This is visually funny enough to share."

### Transformation rules
- apply dark / eerie CSS treatment
- add subtle atmospheric UI elements
- rewrite selected visible labels with ominous tone
- adjust page title to a cursed version

### Safe limits
- keep motion subtle
- avoid accessibility-hostile flashing
- do not obscure critical browser interactions

---

## 15.5 Feature 5 — Restore system

### Purpose
Allow users to undo the transformation quickly and confidently.

### Requirements
- restore via popup
- restore via on-page restore pill
- reload fallback if perfect restore fails
- if switching scenes, old scene should be removed before new one is applied

### Restore design principle
Users should never feel trapped in the transformed state.

---

## 15.6 Feature 6 — Coffee support flow

### Purpose
Let satisfied users voluntarily support the creator.

### Design principle
Support follows delight.

### Rules
- no paywall
- no required signup
- no blocking modal before first use
- support CTA remains optional and lightweight

### Donation destinations
- PayPal.Me link(s)
- can include preset amounts

### Placement
1. subtle footer in popup
2. expanded support card after repeated successful use
3. About / Settings page

### Suggested copy
- "Made you laugh? Buy me a coffee."
- "If Scene Switch made this tab better, fund the next scene."
- "Built by one person. Sponsor more chaos."

---

## 16. Screen inventory

This section defines every MVP screen or user-visible state.

### Screen S1 — Popup / Default state

**Purpose:**  
Let the user understand the product and choose a scene immediately.

**Entry points:**  
- user clicks extension icon on a supported page with no active scene
- user clicks extension icon after previous usage, but current tab is not transformed

**Layout:**
- header: logo + "Scene Switch"
- subheading: short promise
- 3 scene cards
- trust note
- subtle support footer

**Core components:**
- product icon
- title
- description: "Turn this page into a different scene."
- scene card 1: Boardroom Mode
- scene card 2: Melodrama Mode
- scene card 3: Cursed Mode
- footer link: Buy me a coffee

**Primary actions:**
- Apply Boardroom
- Apply Melodrama
- Apply Cursed

**Secondary actions:**
- Open About / Settings
- Open support link

**Suggested microcopy:**
- Header: "Scene Switch"
- Subheading: "Turn this tab into something else."
- Trust note: "Runs only on this page when you click. No history tracking."

**Acceptance criteria:**
- user can identify 3 scene options instantly
- popup fits within standard extension popup size
- support CTA is visible but not dominant

---

### Screen S2 — Popup / Applying state

**Purpose:**  
Give immediate feedback after a scene is selected.

**Entry point:**  
- user clicks any scene card

**Layout:**
- header
- loading indicator
- short status line

**Suggested copy:**
- "Applying Boardroom Mode..."
- "Rewriting the drama..."
- "Summoning the cursed version..."

**Acceptance criteria:**
- visible within 100 ms of click
- transitions automatically to success, unsupported, or error state

---

### Screen S3 — Popup / Scene applied state

**Purpose:**  
Confirm success and give restore / switch actions.

**Entry point:**  
- selected scene applied successfully

**Layout:**
- success header
- active scene badge
- restore button
- switch scene list or buttons
- support footer
- maybe "Last used" marker for current scene

**Primary actions:**
- Restore page
- Apply another scene

**Suggested copy:**
- "Boardroom Mode is live"
- "This tab has been switched"
- "Restore the original page anytime"

**Acceptance criteria:**
- restore action visible without scrolling
- user can switch to another scene from same popup

---

### Screen S4 — Popup / Support card expanded state

**Purpose:**  
Ask for support after repeated delight.

**Entry point:**  
- after 3 successful scene applications total
- or from an explicit support click

**Layout:**
- support card within popup
- small founder note
- coffee buttons
- dismiss / hide action

**Content:**
- title: "Buy me a coffee"
- body: "If Scene Switch made you laugh or saved your vibe, support the next scene."
- buttons:
  - Coffee ($3)
  - Double Coffee ($5)
  - Sponsor Chaos ($8)

**Secondary actions:**
- Not now
- Hide support prompts

**Acceptance criteria:**
- support card does not block restore or scene actions
- dismissal is remembered locally
- extension remains fully usable

---

### Screen S5 — Popup / Unsupported site state

**Purpose:**  
Explain why the extension cannot run here.

**Entry points:**
- user clicks extension on unsupported URL
- current tab is a restricted page

**Examples of unsupported pages:**
- Chrome Web Store
- `chrome://` pages
- browser internal pages
- optionally Gmail / Docs / banking sites in MVP

**Layout:**
- icon
- headline
- reason
- supported examples
- link to About / Settings

**Suggested copy:**
- "Scene Switch can't run on this page."
- "Try it on normal websites like news, shopping, social, wiki, or video pages."

**Acceptance criteria:**
- no injection attempt is made
- user understands why it is blocked

---

### Screen S6 — Popup / Error state

**Purpose:**  
Handle failures gracefully.

**Entry point:**  
- injection failed
- restore failed
- content script error

**Layout:**
- error icon
- explanation
- Retry button
- Reload page button
- About link

**Suggested copy:**
- "Something went weird while switching this page."
- "Try again, or reload the tab to restore everything."

**Acceptance criteria:**
- user has a path to recover
- technical errors are not exposed in raw form

---

### Screen S7 — On-page restore pill

**Purpose:**  
Provide an always-available escape hatch from the transformed page.

**Entry point:**  
- a scene is active

**Placement:**  
- bottom-right or top-right corner, small and unobtrusive

**Content:**
- scene name
- Restore button
- optional close/minimize icon

**Rules:**
- should not block major page controls
- should not visually dominate the page
- should be removable on restore

**Acceptance criteria:**
- visible enough to find
- small enough to avoid annoyance

---

### Screen S8 — About / Settings page

**Purpose:**  
Give users control, trust details, and a permanent support path.

**Entry points:**
- popup "About / Settings"
- extension details page link

**Sections:**
1. What Scene Switch does
2. Supported / unsupported page types
3. Privacy summary
4. Settings
5. Support the creator
6. Version / changelog note

**Settings included in MVP:**
- toggle: show support prompts
- button: reset local data
- optional toggle: remember last used scene
- optional toggle: show on-page restore pill

**Support section:**
- Buy me a coffee links
- founder note

**Acceptance criteria:**
- settings persist locally
- reset works
- support section is accessible but not aggressive

---

### Screen S9 — First-use hint state (inside popup)

**Purpose:**  
Help new users understand the interaction immediately without a separate onboarding flow.

**Entry point:**  
- first time popup is opened after install

**Behavior:**
- lightweight hint banner above scene cards
- disappears after first successful scene application or dismissal

**Suggested copy:**
- "Pick a scene to transform this tab. It only runs on the page you're viewing."

**Acceptance criteria:**
- no separate onboarding page required
- hint never blocks usage

---

### Screen S10 — External support destination

**Purpose:**  
Complete the donation flow.

**MVP behavior:**  
- clicking a support CTA opens PayPal.Me in a new tab

**Notes:**
- not owned by the extension UI, but part of the product flow
- should use founder's finalized payment URL
- can use preset amounts

---

## 17. Detailed screen requirements by screen

## 17.1 S1 Popup / Default state requirements

- Must load even when no scene is active.
- Must show all 3 scenes without scrolling on common viewport size if possible.
- Each scene card must include:
  - name
  - one-line descriptor
  - CTA button or clickable card
- Footer must contain:
  - support link
  - privacy reassurance or tiny trust message

### Example content
- Boardroom Mode — "Make this page look like serious work."
- Melodrama Mode — "Rewrite the page like a theatrical villain."
- Cursed Mode — "Give this tab a haunted makeover."

---

## 17.2 S3 Popup / Scene applied state requirements

- Must clearly show the active scene.
- Must provide a primary Restore action.
- Must allow scene switching without closing popup.
- Must keep support secondary.

---

## 17.3 S4 Support card requirements

- Show only after the threshold of successful usage has been met.
- Threshold for MVP: 3 successful scene applications total.
- If dismissed, do not reopen on every session.
- If hidden in settings, never show again until re-enabled.

---

## 17.4 S8 About / Settings requirements

Must include the following content blocks:

### About
- "Scene Switch transforms the current page into playful themed scenes."
- "It runs only when you click it on a page."

### Privacy
- "No browsing history collection."
- "No account."
- "No cloud sync."
- "Settings stored locally in your browser."

### Support
- founder note
- PayPal.Me links
- optional "thank you" message

### Controls
- show support prompts: on/off
- reset local data
- version label

---

## 18. Core interaction flows

## 18.1 Flow A — First successful use

1. User installs extension.
2. User opens a normal website.
3. User clicks Scene Switch icon.
4. Popup shows default state with hint.
5. User clicks a scene.
6. Popup shows applying state.
7. Page transforms.
8. Popup updates to scene applied state.
9. On-page restore pill appears.
10. Support footer remains subtle.
11. Usage count increments by 1.

### Success condition
User experiences the transformation within seconds and can restore easily.

---

## 18.2 Flow B — Switch scenes

1. User already has Boardroom Mode active.
2. User opens popup.
3. Popup shows scene applied state.
4. User clicks Melodrama Mode.
5. Extension restores Boardroom modifications.
6. Extension applies Melodrama Mode.
7. Popup updates active scene label.

### Success condition
User switches scenes without confusion or page breakage.

---

## 18.3 Flow C — Restore page

1. User has a scene active.
2. User clicks Restore in popup or on-page pill.
3. Extension removes injected styles/elements and restores stored text/title.
4. If restore fails partially, extension offers reload fallback.

### Success condition
User can get back to original page safely.

---

## 18.4 Flow D — Support after delight

1. User has successfully applied scenes 3 times across sessions.
2. On next popup open after success, support card appears.
3. User sees optional "Buy me a coffee" message.
4. User may:
   - click a donation amount,
   - dismiss,
   - hide future prompts.
5. Donation link opens PayPal.Me in new tab.

### Success condition
The ask feels earned and non-intrusive.

---

## 18.5 Flow E — Unsupported page

1. User clicks extension on unsupported page.
2. Popup shows unsupported state.
3. User understands why it is blocked.
4. User can exit or open About.

### Success condition
No confusion, no broken injection attempt.

---

## 19. Scene design details

## 19.1 Boardroom Mode spec

### Objective
Make entertainment or general websites feel like a sober dashboard.

### Visual changes
- neutral panel styling
- top KPI ribbon
- more muted accent colors
- optional light desaturation of media-heavy elements
- compact labels / status badges

### Text transformations
Use light corporate phrasing on selected nodes only.

Examples:
- "Trending" → "Priority Signals"
- "Recommended for you" → "Suggested Review Items"
- "Comments" → "Feedback"
- "Popular now" → "Current Activity"

### Fake KPI examples
- Sync Health: 98%
- Review Queue: 12
- Focus Score: High
- Risk Level: Low

### Constraints
- page must remain usable
- no fake browser UI
- no spoofing of system notifications
- no automatic screenshot tools

---

## 19.2 Melodrama Mode spec

### Objective
Turn a normal page into exaggerated theatrical copy.

### Tone
- over-the-top
- villainous
- poetic
- absurd, but readable

### Transformation rules
- only transform visible text nodes under a length threshold
- preserve punctuation where possible
- avoid touching legal text, code blocks, long paragraphs, or input values

### Phrase bank examples
- "Search" → "Seek your destiny"
- "Continue" → "Let the tale proceed"
- "View all" → "Behold the full spectacle"
- "Sign in" → "Reveal thy identity"

### Constraints
- do not transform every single node
- avoid layout blowups from long replacements
- should feel funny, not unreadable

---

## 19.3 Cursed Mode spec

### Objective
Make the page feel haunted but still recognizable.

### Visual treatment
- darkened theme overlay
- eerie shadows / filters
- altered buttons and labels
- subtle decoration only

### Text transformation examples
- "Buy now" → "Claim before it vanishes"
- "Deal" → "Forbidden bargain"
- "Recommended" → "Whispered suggestion"

### Constraints
- minimal animation
- no flashing
- keep contrast readable enough

---

## 20. Content and microcopy

## 20.1 Brand voice
- playful
- slightly chaotic
- not cringe
- not spammy
- not "growth hack" sounding

## 20.2 UI tone rules
- short sentences
- obvious humor
- avoid begging language
- trust statements should be plain and direct

## 20.3 Support copy
Preferred:
- "Made you laugh? Buy me a coffee."
- "Fund the next scene."
- "Built by one person."

Avoid:
- "Donate now"
- "Support urgently"
- guilt-based copy
- dark patterns

---

## 21. Donation design requirements

### 21.1 Core donation rule
The product must stand alone without payment.

### 21.2 Placement rules
- footer support link always visible but subtle
- expanded support card after repeated successful use
- permanent support block in About / Settings

### 21.3 Threshold
- trigger expanded support prompt after 3 successful scene applications

### 21.4 Dismissal behavior
- "Not now" hides the expanded card for a cooldown period in local state
- "Hide support prompts" disables it until re-enabled in settings

### 21.5 Suggested amount options
- Coffee — $3
- Double Coffee — $5
- Sponsor Chaos — $8

### 21.6 Payment URL behavior
- opens external PayPal.Me URL in a new tab
- no iframe, no embedded checkout
- no gating

---

## 22. Data model (local only)

Use local storage for MVP.

### Stored values
- `usageCount`
- `supportPromptDismissed`
- `supportPromptsEnabled`
- `lastUsedScene`
- `showRestorePill`
- `firstRunHintSeen`

### Not stored
- URLs visited
- browsing history
- page content
- personal data
- payment data

---

## 23. Unsupported and blocked contexts

The extension must not attempt full scene injection on:

- Chrome Web Store
- `chrome://` pages
- browser internal pages
- extension pages
- highly sensitive pages flagged in MVP:
  - email compose views
  - document editors
  - banking/payment checkout pages

The MVP may detect and block by URL pattern or domain allow/deny logic where needed.

---

## 24. Edge cases and failure handling

### Edge case 1 — Page updates after scene application
If a dynamic page re-renders after the scene is applied, the MVP does not need to continuously re-transform new nodes. The scene may become partially inconsistent. This is acceptable for MVP.

### Edge case 2 — Long text causing layout breakage
Text replacement should skip nodes above a set character threshold.

### Edge case 3 — Restore misses some changes
If a clean restore cannot be guaranteed, show reload fallback.

### Edge case 4 — User closes popup while applying
Application should continue and on-page restore pill should still appear if successful.

### Edge case 5 — Multiple rapid clicks
Scene buttons should be temporarily disabled while applying.

### Edge case 6 — Unsupported page opens popup
Unsupported state should appear immediately.

### Edge case 7 — Donation disabled
If support prompts are disabled, only About page may retain static support section, depending on implementation choice.

---

## 25. Acceptance criteria

## 25.1 Global acceptance criteria
- The extension functions without any backend.
- All core functionality works with only local storage and injected scripts.
- A user can apply, switch, and restore scenes.
- The donation flow is optional and non-blocking.

## 25.2 Feature acceptance criteria
### Scene picker
- all 3 scenes are visible
- each scene has clear copy
- first-use hint is non-blocking

### Boardroom
- page visibly changes to a corporate feel
- top KPI bar appears
- page title changes
- restore works

### Melodrama
- at least selected visible page text is rewritten
- the result is obviously dramatic
- layout remains usable

### Cursed
- page visually darkens / shifts
- selected labels change tone
- page remains recognizable

### Support flow
- support footer exists in popup
- support card appears after usage threshold
- CTA opens PayPal.Me in new tab
- user can dismiss or disable prompts

### Trust
- About page clearly says no history tracking
- settings are local only

---

## 26. QA checklist

### Functional QA
- install / launch
- first-use popup
- apply each scene
- switch between scenes
- restore from popup
- restore from on-page pill
- support card threshold
- dismiss prompt
- disable support prompts
- reset local data

### Site QA
Test on:
- Reddit
- LinkedIn
- Amazon
- Wikipedia
- YouTube home
- a news site
- a blog/article page

### Negative QA
- Chrome Web Store
- chrome://extensions
- Gmail
- Google Docs
- payment checkout page

### Recovery QA
- partial restore
- reload fallback
- popup close during apply
- rapid repeated clicks

---

## 27. Launch requirements

These are required to launch, even if they are not extension screens.

### 27.1 Chrome Web Store assets
- name
- short description
- single-purpose statement
- icons
- screenshots
- privacy copy
- support email / contact
- category selection
- optional promo tile

### 27.2 Demo assets
At least 3 short demo clips:
1. LinkedIn → Melodrama
2. Amazon → Cursed
3. YouTube or Reddit → Boardroom

### 27.3 Public support link
- finalized PayPal.Me URL
- tested preset amounts

---

## 28. Recommended store positioning

### Product one-liner
Turn the current tab into a different scene with one click.

### Short description
Transform any webpage into a Boardroom, Melodrama, or Cursed version. Runs only when you click it. No history tracking.

### Single-purpose statement
Scene Switch transforms the active webpage into playful themed scenes and lets the user restore it at any time.

---

## 29. Risks and mitigations

### Risk 1 — Feels like a one-joke extension
**Mitigation:** ship one useful-ish mode (Boardroom) plus two viral modes.

### Risk 2 — Users fear permissions
**Mitigation:** use minimal permissions and communicate clearly.

### Risk 3 — Restore is unreliable on dynamic pages
**Mitigation:** keep transformations shallow and provide reload fallback.

### Risk 4 — Donation ask feels needy
**Mitigation:** support appears only after repeated usage and remains dismissible.

### Risk 5 — Page breakage
**Mitigation:** skip risky elements and sensitive contexts.

### Risk 6 — Not enough repeat usage
**Mitigation:** make Boardroom Mode semi-practical and keep scenes highly visual.

---

## 30. Post-MVP ideas (not part of current build)

- additional scenes:
  - Royal Mode
  - Pirate Mode
  - NPC Commentary Mode
  - Fake Productivity Layer+
- scene presets per site
- keyboard shortcuts
- custom scene intensity
- share screenshot card
- rotating seasonal scenes
- Firefox port
- web demo page

---

## 31. Final MVP decision summary

For MVP, Scene Switch is:

- a **Chrome extension**,
- with a **single popup**,
- **3 scenes**,
- **restore**,
- **minimal permissions**,
- **no backend**,
- and an optional **Buy me a coffee** flow via PayPal.Me.

The MVP should optimize for:
- instant transformation,
- low trust friction,
- shareable outputs,
- and a support flow that feels earned.

If a product decision is unclear, default to this rule:

> **Make it simpler, safer, and more immediately funny.**

---

## 32. Implementation-ready checklist

### Must-have before development starts
- final extension name
- logo/icon direction
- final PayPal.Me URL
- exact blocked domains list
- final microcopy for 3 scene cards

### Must-have before store submission
- screenshots
- privacy copy
- support email
- About / Settings page complete
- tested restore behavior
- tested donation links

---

## 33. Appendix — suggested initial copy

### Popup header
**Scene Switch**  
Turn this tab into something else.

### Scene cards
**Boardroom Mode**  
Make this page look like serious work.

**Melodrama Mode**  
Rewrite this page like a theatrical villain got involved.

**Cursed Mode**  
Give this tab a haunted makeover.

### Trust line
Runs only on this page when you click. No history tracking.

### Support footer
Made you laugh? Buy me a coffee.

### Support card
**Buy me a coffee**  
If Scene Switch made your tab better, fund the next scene.

Buttons:
- Coffee — $3
- Double Coffee — $5
- Sponsor Chaos — $8

### Unsupported state
Scene Switch can't run on this page.  
Try it on normal websites like articles, shopping pages, social feeds, and video pages.

### Error state
Something went weird while switching this page.  
Try again, or reload this tab to restore everything.

### About page privacy block
Scene Switch does not collect your browsing history.  
It runs only when you click it on the current page.  
Settings are stored locally in your browser.

