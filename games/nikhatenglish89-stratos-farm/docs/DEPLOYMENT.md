# DEPLOYMENT, MONITORING, BACKUPS, ADMIN

## How the game ships (no Docker, no server)
The game is a static folder in the Stratos Games site repo: `games/nikhatenglish89-stratos-farm/`.
1. Develop in the folder: `npm install`, `npm run dev` (open `/app.html`), `npm test`, `npm run e2e`.
2. `npm run build` writes `build/` and the folder's `index.html` (these built files ARE committed; `node_modules` is not).
3. Commit only this folder and push to `staging`. The site's Action rebuilds the front page and the play page (`/play/stratos-farm-my-dream-village/`); Vercel serves staging at https://stratos-family-staging.vercel.app.
4. Live: at the Saturday release (Sahil, Sahariar or Mohua press "release staging to live") if issue #33 shows the game ready; Mohua tests first.
5. Rollback: revert the commit on `staging` (or `git revert`) and push; the next release carries the old version. Players' saves are forward-compatible (see MIGRATIONS.md).

There is no `.env`, no database, no container image and no background worker. A "Docker production config" would only be needed once a backend exists.

## Pre-release checklist
- `npx tsc --noEmit`, `npx vitest run` (incl. first-load budget), `npx playwright test` all green.
- `python tools/check_games.py nikhatenglish89-stratos-farm` shows "goes live" (set `PYTHONUTF8=1` on Windows).
- Open the play page on a real phone: touch, pinch, portrait, sound by ear, no scrolling.
- Cover (`thumbnail.png`) and hover clip (`preview.mp4`) still show the current look; regenerate if the UI changed a lot.
- Read the 3 questions (retention, time well spent, money) into the commit message.

## Monitoring
- The game is in the **adventure** category (changed from kids on 2026-11-19, see `docs/CATEGORY_REQUEST.md`), so Stratos analytics apply. The game reports `level_start`, `level_complete`, `reward_offered`, `reward_taken`, `order_delivered`, `building_placed`, `land_cleared`, `quest_claimed` and `tutorial_done` through the site's `Stratos.track`. Builders and testers open `https://stratos.games/?builder=1` once in their browser so test visits are not counted. No ads exist in the game yet; adding them is for the site owners (one shared setup, rewarded first, never in the first session).
- Errors: the game never swallows an error silently in its own code; browser console errors fail every test.

## Backups
- Player side: Settings -> "Save a backup" downloads a file; "Restore a backup" loads it (validated first). The game also keeps the previous save and restores it automatically if the latest one is damaged.
- Project side: the repo is the backup of the code and master data. Players' saves live only on their devices until accounts exist.

## Admin dashboard for master data (not built)
An editable admin dashboard with an audit trail needs a backend and Stratos staff accounts. Today the master data is plain JSON (`src/data/*.json`) changed through reviewed commits, and the economy simulation (`tests/balance.test.ts`) plus the data-consistency tests catch broken references. When a backend exists: store master data in tables, keep an audit row per change, and keep these JSON files as the seed.
