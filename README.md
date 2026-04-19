# Scene Switch

Chrome extension (Manifest V3) that transforms the current tab into a themed
"scene" with one click. See [`prd.md`](./prd.md) for product scope and
[`slices.md`](./slices.md) for the build order.

This repository is currently at **Slice 00** — only the extension shell exists.

---

## Load as an unpacked extension

1. Open Chrome and visit `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this repository's root folder (the one containing `manifest.json`).
5. The Scene Switch icon should appear in the toolbar.

### Reload after code changes

- For HTML/CSS/JS under `popup/` or `options/`: close and reopen the popup /
  settings page.
- For `background/service-worker.js` or `manifest.json`: go to
  `chrome://extensions`, find **Scene Switch**, and click the reload icon on the
  card.
- To inspect the service worker, click **Service worker** on the extension
  card — it opens a DevTools console.

---

## Folder layout

```text
scene-switch/
├─ manifest.json           MV3 manifest
├─ background/             Service worker (orchestration layer)
├─ popup/                  Browser-action popup UI
├─ options/                About / Settings page
├─ shared/                 Constants, copy, storage, URL rules (added in later slices)
├─ content/                Injected page runtime and scenes (added in later slices)
│  ├─ scenes/              One file per scene (Boardroom, Melodrama, Cursed)
│  └─ styles/              Scene-specific CSS
├─ assets/
│  ├─ icons/               Extension icons (16/32/48/128)
│  └─ screenshots/         Store listing screenshots
└─ test-notes/             Manual smoke tests and release checklist
```

### Permissions

Only `activeTab`, `scripting`, and `storage`. No host permissions, no `history`,
no analytics. See `prd.md` section 14 for the full trust posture.
