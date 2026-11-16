# Screenshot plan

Drafted 16 November 2026. Tick items off as captures arrive. Drop new files into `incoming-screenshots/<app>/` and I'll wire them into `content/apps.json`.

## Capture rules (all apps)

- **Both themes**: one light and one dark capture per shot, same view, same data. The site switches with its theme toggle. Name them `<name>-light.png` / `<name>-dark.png`.
- **One window size for every app**: 1280 × 770 app window at 200% display scaling (→ 2560 × 1540 files), same as the new Paddock set. Consistent size makes the gallery look like one product family.
- **App only**: no browser tabs, address bar, bookmarks, taskbar, file paths or user names. Circuit/Livery/Decals in a browser → use the browser's full-screen (F11) or app/kiosk window.
- **Demo data that tells a story**: the same club, drivers (Alex, Jamie, Morgan, Sam), cars and track across all six apps, so screenshots cross-reference each other (e.g. "Club Circuit" in Circuit, Timing, Telemetry; car "No. 27" in Paddock, Livery, Decals).
- **Current release & name**: latest version, current app name (no "Track Builder", no old version numbers), no notifications, toasts or error banners.
- **Fill the frame**: a meaningful, busy-but-tidy state; no empty lists, no half-open menus unless the menu is the point.

## Priority overview

| App | Now | Target | Status | Priority |
|---|---|---|---|---|
| Circuit | 4 (dark, browser chrome) | 9 | Unusable: shows browser, bookmarks, your file path, old name "Track Builder" v0.2.5 | **1 – urgent** |
| Livery | 2 (paired) | 7 | Good quality, far too few for 29 features | **2** |
| Decals | 2 (1 paired) | 7 | Good quality, far too few for 36 features | **3** |
| Timing | 7 (dark only, mixed sizes) | 10 | Missing the most important shot: a live race | **4** |
| Telemetry | 8 (dark only, mixed sizes) | 9 | Decent coverage, needs light versions + 1–2 gaps | 5 |
| Paddock | 10 (paired, done) | 12 | Complete; 2 optional additions | 6 |

Total new captures: about **38 views × 2 themes**.

---

## 1. Circuit: replace all (9)

Gallery order = story order. Current 4 files are retired.

- [ ] **Track builder**: a finished, attractive multi-lane layout (not a simple oval) on the canvas, pieces panel open, track overview on the right. *Hero/showcase shot.*
- [ ] **Live Preview**: cars running on the layout (Preview, export and share).
- [ ] **Track packs**: pack list with several manufacturer packs and piece artwork visible.
- [ ] **Measure & check**: footprint, lane lengths and a gap/clearance warning or curvature check visible.
- [ ] **Stock & shopping list**: parts list of the layout against owned stock.
- [ ] **Routed track**: a routed/continuous tabletop design with dimensions.
- [ ] **FreeForm**: drawn lane with generated lanes, point editing handles visible.
- [ ] **Table Designer**: table with panel splits and transport sizes.
- [ ] **Export**: PDF/PNG/SVG/DXF options or a parts-list export preview.

Optional: Track Library (saved designs grid); Custom piece editor.

## 2. Livery: add 5 (7 total)

Keep: Design studio, Welcome.

- [ ] **Template preparation**: an imported car view with paintable areas and labels (Turn a car view into a template).
- [ ] **Six car views**: one car painted, view strip showing several filled views (front/top/left/right/rear/angled).
- [ ] **Gradients & stripes**: multi-stop gradient editor or racing-stripe tool in use.
- [ ] **Decals & race numbers**: text/number tool, or artwork brought in from Decals, perspective-fitted onto the body.
- [ ] **User Library**: searchable library of artwork groups and liveries.
- [ ] **Workshop PDF export**: export dialog/preview.

(That's 6 candidates; pick the best 5, or keep all 6 for 8 total.)

## 3. Decals: add 5–6 (7–8 total)

Keep: Sheet editor (paired). Recapture **Car preview** in light too.

- [ ] **Car preview (light)**: matching light version of the existing shot.
- [ ] **Vector tracing**: an imported logo traced to flat-colour shapes (Prepare the artwork).
- [ ] **Racing graphics**: curved lettering, number plate, checkerboard or stripe being edited.
- [ ] **Multi-page sheet & layers**: full A4 sheet with many decals, layers panel open, rulers/margins visible.
- [ ] **Slice & export**: a slice selection with PDF/SVG/white-ink options.
- [ ] **Decal library**: .sfdecal/.sfsheet library view.
- [ ] **Scale conversion**: model-scale conversion (1:32 ↔ 1:24) or plain-paper sizing proof.

## 4. Timing: recapture 7 in both themes + add 3 (10 total)

Recapture at the standard size, light + dark:

- [ ] Race setup (home)
- [ ] Fuel
- [ ] Tyre wear
- [ ] Weather
- [ ] Widget Builder
- [ ] Audio calls
- [ ] Help

Add:

- [ ] **Live race screen**: a race in progress, 4 lanes, leaderboard, lap times, fuel/tyre indicators. *Should be the first gallery image and the showcase shot.*
- [ ] **Championship standings / results**: points table or podium / Victory Spotlight.
- [ ] **Race control**: penalties, safety car or Director review.

Optional: second-display/remote director view; Live Track with a Circuit layout.

## 5. Telemetry: recapture 8 in both themes + add 1 (9 total)

Recapture light + dark at standard size: Workbench, Setup analysis, Compare setups, Library, Lap analysis, Progress, Balance, Clearance.

Add:

- [ ] **Guided Driver Feedback**: "how does the car feel" flow with suggested checks (first feature group, currently no picture).

Optional: Gear finder; motor torque/power curve chart.

## 6. Paddock: optional (12 total)

Gallery is complete and consistent. Possible additions for features without a picture:

- [ ] **Track tests & race history**: pace/consistency or lane records, ideally with results from Timing.
- [ ] **Setup snapshots & comparison**, or **Paddock Portal / sharing a car**.

Cleanup (no capture needed): `public/assets/apps/paddock/` has 10 older single-theme files no longer used by the gallery (`overview.png`, `review-hub.png`, `workshop-jobs.png`, etc.). Remove once you confirm.

---

## Homepage showcase

The rotating homepage showcase uses each app's **first** gallery image. Make sure each app's first shot is its strongest:
Timing → Live race · Paddock → Showroom · Circuit → Track builder · Telemetry → Workbench · Livery → Design studio · Decals → Sheet editor.
