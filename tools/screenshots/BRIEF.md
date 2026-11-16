# Screenshot capture brief (shared by all capture scripts)

Goal: marketing-quality gallery screenshots for the SlotForge website (`../../SCREENSHOT-PLAN.md` lists what each app needs).

## Hard rules

1. **Never modify anything in the app folders** (`C:\Users\theDutchmanJames\Documents\CLAUDE\<App>`). They are read-only for us: no edits, no npm install, no git commands that write, no running the app's own test/qa scripts that write into its folder. Write only inside `Website/tools/screenshots/` and `Website/incoming-screenshots/`.
2. **Always launch through `lib.cjs` → `launch()`**. It redirects userData/appData/Documents to a throwaway profile in `.profiles/` and aborts if isolation fails. Never launch an app any other way: that would touch the user's real data.
3. Seed demo data either through the UI (Playwright clicks/fills), via `page.evaluate` on the app's own renderer state/functions, or by writing files into the isolated `profile` dir via the `seed` option. Never into the real profile.
4. Don't use file dialogs that need a human. Use `setInputFiles` on hidden inputs, or `page.evaluate`, or stub `dialog.showOpenDialog` via `app.evaluate` in the main process.

## Output

- Script: `Website/tools/screenshots/capture-<app>.cjs` (lowercase), runnable with `node capture-<app>.cjs` from that folder. Re-runnable end to end.
- Files: `lib.shot(page, '<App>', '<slug>-light')` and `'<slug>-dark'` → `Website/incoming-screenshots/<app>/<slug>-light.png` / `-dark.png`. Every view in both themes, same state, switched with the app's own theme setting.
- Size is fixed by lib (2560×1540). Don't change lib.cjs; if you truly need a lib change, describe it in your report instead.

## Quality bar

- Look at every PNG you produce (Read tool) and iterate until it looks like a polished product shot: busy but tidy, realistic data, nothing empty, no toasts/notifications/error banners/"browser mode" notices (wait for them to disappear or hide that one element), no open dropdowns unless that's the point, no scrollbars mid-scroll, nothing half-loaded.
- Shared demo universe across apps: club "Friday Night Club", track "Club Circuit", drivers Alex, Jamie, Morgan, Sam, cars like "NSR Porsche 997", "Slot.it Audi R8", "Scaleauto BMW M3", "NSR Corvette C7.R", hero livery/decal car "No. 27". Use these names where the app shows names.
- Current app name/branding only; no "Track Builder" as product name (the Circuit tab called "Track Builder" is fine).
- No personal data, file paths with user names, etc.

## Report back

For each screenshot: slug, a 2–4 word gallery label, one sentence on what it shows, and any problems. Also list plan items you could not capture and why.
