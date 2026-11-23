# SlotForge website

Local implementation of the approved SlotForge design. Nothing is published or pushed by these scripts.

## Review locally

Requires Node.js 22 or newer. No dependency installation is needed.

Double-click **Start Preview.cmd**, or run:

```powershell
npm run dev
```

Open **http://127.0.0.1:4173/**. The server binds only to this computer. Keep it running during review and press Ctrl+C to stop it. If the preview is already running, open the URL directly. Rebuild with `npm run build` and refresh the browser after editing.

## Included pages

- Homepage, with all six apps and Discover Circuit.
- `/timing/`, `/paddock/`, `/circuit/`, `/telemetry/`, `/livery/`, `/decals/`.
- `/circuit/online/`: browser-edition introduction and launch link.
- `/circuit/online/app/`: Circuit v0.3.26 using its existing browser storage mode.
- `/about/`: source, credit and data-storage information.

App pages contain only their own features, gallery, downloads and guidance. The shared template produces static HTML, so navigation and content work without JavaScript. JavaScript adds gallery controls, theme persistence, screenshot enlargement and platform selection.

## Editing

- `content/apps.json`: introductions, highlights, feature groups, screenshot lists and first-use guidance.
- `content/feature-presentation.json`: short topic labels, icons and benefit statements for the feature explorer.
- `scripts/feature-explorer.mjs`: shared feature explorer markup, including a usable HTML fallback.
- `content/releases.json`: verified GitHub release snapshot and exact download URLs, checked 15 November 2026.
- `scripts/build.mjs`: shared page templates and release-file classification.
- `src/design-reference.css`: styling retained from the approved design.
- `src/site.css`: full-site layout, responsive styles and accessibility.
- `src/enhancements.css` and `scripts/icons.mjs`: homepage showcase, feature cards and sharing sections.
- `content/feature-sources.json`: release documentation used for the expanded features and sharing instructions.
- `content/paddock-screenshot-import.json`: supplied screenshot filenames, checksums, pairing and recapture status. Since 23 November every gallery uses light/dark pairs captured from the current app builds (scripts in `.cache/shot-scripts`); supplied assets are preserved by `sync:assets`.
- `src/site.js` and `src/theme.js`: browser interactions.
- `public/assets/`: local logos, icons and screenshots. `content/asset-sources.json` records original URLs and revisions.
- `public/circuit/online/`: retained Circuit static release files, licences and documented hosting adapter.
- `dist/`: generated website; ignored by Git.

Run `npm run build` followed by `npm run check` before review. The check validates site links and anchors, gallery files, all six feature sets, release download URLs and Circuit entry assets.

## Download maintenance

The homepage showcase uses `showcase` entries in `content/apps.json`, with each app’s first gallery screenshot. It rotates every seven seconds, pauses on hover, keyboard focus and hidden tabs, and stops after manual slide selection. Play resumes rotation once focus/pointer leaves the controls. Reduced-motion preferences start it paused. Without JavaScript the first app remains visible and every app is available through the menu and cards.

Each app’s `features`, `highlightIcons` and `highlightLabels` define the three main cards. The `sharing` entries define its formats and export/send/import workflow. Detailed features use a topic explorer: Timing 42 across seven topics, Paddock 42 across seven, Circuit 41 across seven, Telemetry 33 across five, Livery 29 across five and Decals 36 across seven.

The explorer presents one topic at a time, with individual feature descriptions available through native disclosure controls. Desktop topic buttons become a labelled dropdown on small screens. Search matches feature titles, descriptions and their group headings across all topics, with a clear action and an empty-results message. With JavaScript unavailable, every topic remains in the page and disclosures still work. Timing’s coloured Race Systems remain visible separately. Compact sharing cards follow the explorer, with a short introduction and format badges; a native “How to share” disclosure opens the three-step walkthrough, supporting notes and documentation link.

The website uses a release snapshot rather than requesting the GitHub API from every visitor. Refresh `content/releases.json` from the official repositories and rebuild when a release changes. Do not invent missing platform packages. Paddock v1.5.1 currently has no Mac package, and Decals v0.2.20 currently has an Intel Mac package only. The release page links remain available for subsequently added files.

Feature descriptions were reviewed against each app's pinned release README, with the other five apps expanded on 16 November 2026. Source revisions are recorded in `content/feature-sources.json`. Paddock now uses ten supplied light/dark pairs: Showroom, Car collection, Parts catalogue, Wheels & tyres, Shopping lists, Build from Scratch, Workshop, Workshop job, Import & export and Appearance. Six replacement captures complete the set without screenshot notifications. The import manifest records the replaced filenames; the supplied originals are unchanged.

Other apps' existing screenshots may show older interfaces or names. Livery Studio/Welcome and Decals Editor have real paired theme captures. Other gallery entries retain their original image; capture matching themes before a fully paired gallery launch. Images are never recoloured to imitate the app.

## Circuit browser edition

The official complete v0.3.26 release is retained as static app/design/track-pack files. The hosting adapter explicitly selects its existing browser persistence, avoiding the installed helper's disk API. Changes are listed in `public/circuit/online/HOSTING-NOTES.txt`.

Browser storage belongs to the browser and URL origin. This localhost preview is separate from the installed disk workspace and any future GitHub Pages workspace. Export a workspace backup to transfer designs or before clearing browser data. The browser edition has no server or cloud-sync service.

`scripts/prepare-circuit.mjs` recreates the static copy from the official archive extracted into `.cache/circuit-v0.3.26/SlotForge Circuit/`. The public copy is already present; ordinary builds do not require that cache.

## GitHub Pages — after review

The generated `dist/` is suitable for static hosting; it includes `.nojekyll` and relative site URLs. The intended future destination is the `theDutchmanJames.github.io` repository. No remote, publishing workflow, push or Pages deployment has been configured. Review and approval come first.
