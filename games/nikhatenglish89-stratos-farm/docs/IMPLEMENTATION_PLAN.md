# IMPLEMENTATION PLAN

Status: **MVP built and the site-launch checklist done (2026-11-18). Waiting for the owner to say "publish" (push to staging).** Decisions approved: no backend (local FarmService), keep React, build in the Desktop clone, category `kids`, Farm Coins + Gems as the game's own currencies.

## Phase 1 — Foundation (DONE)  ~35 files, all under games/nikhatenglish89-stratos-farm/
- Tooling: package.json, vite.config.ts, tsconfig, tailwind config, vitest + playwright config.
- `src/iso/` grid.ts (grid<->screen, depth), occupancy.ts, placement.ts + tests.
- `src/game/` BootScene (manifest loader), FarmScene (layout-driven world, camera pan/zoom clamp, tile select, farmhouse/barn click), eventBus.ts, assets.ts.
- `src/state/` store.ts (Zustand). `src/ui/` TopBar, BottomNav, InfoPanel, ComingSoon.
- `data/farm_layout.json` (from previews/sample_farm_scene.png), copy `assets/farm/` + `docs/ASSET_MANIFEST.md`.
- Tests: iso math, occupancy, placement; one Playwright test (canvas renders, tile selectable).
- Done when: dev command runs, pan/zoom (mouse + touch), tile select, panels open, resize OK in portrait and landscape, tests pass with shown output, committed.

## Phase 2 — Farming loop (DONE): LocalFarmService, crops.json (12 crops), plant / harvest / harvest-all / sell, lazy timers, ledger, idempotency keys, serialized calls, seed picker, inventory with selling, harvest effects, save/load.
## Phase 3 — Animals + production (DONE): 6 animals, 6 habitats, 8 factories, 17 recipes, shop + placement, feeding, collection, happiness, upgrades, queues that finish offline.
## Phase 4 — Orders, market, building move/remove, expansion, quests, achievements, tutorial (DONE, MVP complete).
## Site-launch pass — home screen, Continue/resume, thumbnail, clip, description, Stratos Coins adapter, quality bar.
## Later (needs backend + Stratos central accounts): social, leaderboards, admin dashboard, real purchases.

## Decisions (all answered: recommendations accepted)
1. No backend for MVP (local FarmService)? **Recommended.**
2. Keep React, or lighter Phaser-only UI?
3. Work location: clone the site repo to ~/Desktop/stratos-games-site and build in `games/nikhatenglish89-stratos-farm/`. OK?
4. Category stays `kids` (no analytics/ads) or switch to a non-kids category?
5. Currency names Farm Coins + Gems; which Stratos Coins items to request.

## MVP acceptance check (against CLAUDE.md, 2026-11-18)
| MVP item | Status |
|---|---|
| Farm world (isometric, layout-driven, camera, selection) | Met. Mouse tested; touch/pinch coded but not tried on a real device |
| Planting / harvesting | Met |
| Animals | Met (6 types, feed, collect, happiness, capacity, upgrade) |
| Production | Met (8 factories, 17 recipes, queues, offline jobs) |
| NPC orders | Met (4 slots by level, 6 customers, cooldown refresh, skip, ledger-backed, idempotent) |
| Building placement | Met: place, move, remove (half refund), validation with green/red preview. **Not met: rotate** (the art has no rotated variants) |
| Expansion | Met: two locked patches cleared with coins + factory goods. Note: "land clearing" is the unlock step, there are no per-tile obstacles |
| Quests | Met: tutorial (5 steps), daily (3 a day, reset by service day), goals, achievements, idempotent claims |
| XP / levels / unlocks | Met (curve round(100 * level^1.5), unlock list in the level-up toast) |
| First-session tutorial (~5 steps) | Met |
| Server-authoritative rules | Met **locally only**: no real server (decision 1). A player can edit the save or set the device clock |
| Registration / login | Dropped on purpose (site rule: no sign-up forms) |

## Site launch checklist (CLAUDE.md of the site repo, checked 2026-11-18)
| Rule | Status |
|---|---|
| Stratos splash and loading screen | Added by the site on the play page (the game must not build its own). The game starts straight on its own logo + home screen |
| Home screen with a clear goal, logo, Play / Continue | Done (`Home.tsx`): logo, one-line goal, Play or Continue (+ level and coins), How to play, Tips, About, music/sound switches, rotating tip, "Start a new farm" (asks twice) |
| How to play, tips, about | Done, in the home screen and in Settings; text comes from `game.json`, so the page and the game never disagree |
| Fits the screen, no scrolling, phone portrait + landscape + computer | Checked at 390x844 phone, 1366x768 computer, 640x360 (screens only; panels scroll inside themselves) |
| First tap to fun under 10 s | Home -> Play -> farm, tutorial banner |
| Teaches while playing | 5-step tutorial banner, skippable |
| Sound off by default, mute | Music and effects both OFF, nothing downloaded until turned on, remembered; soft sounds only |
| No sign-up forms, no outside scripts, works offline once loaded | Met |
| No errors in the console | Met (every test fails on a console error) |
| Saved progress / Continue (#72) | `localStorage` save after every action; Continue on the home screen; `game.json` has `"resume": {"native": true}` |
| Full game page (#70) | `game.json`: 237-word description, controls, tips, story, 5 FAQ questions, how_to_play |
| Cover (800x500) | `thumbnail.png`, a real picture from the game |
| Hover clip (#71) | `preview.mp4`, 6 s, 480x300, silent, real play (harvest, pan, zoom). Made with the Playwright + ffmpeg-static equivalent of `tools/make_clip.py` because Python Playwright and ffmpeg are not installed here |
| Analytics | Not needed: `kids` category (no analytics, no ads) |
| Stratos Coins: earn | `level_start` on Play (first-play coins), `level_complete` with a level number when the player levels up (new-level coins). Both sent through `Stratos.track`, paid by the site |
| Stratos Coins: spend | Items `boost` (Speed-up for a crop, an animal product or a factory job) and `hint` (how to get an order item), through `Stratos.coins.offer`. The site shows price and balance and spends on one tap |
| Own coin kept separate | Farm Coins and Gems stay in the game; the Stratos balance is shown separately (top bar chip, home screen, Settings) |
| Plays when Stratos is absent | Yes: boosts and hints are then free, nothing breaks (tested) |
| Never touches `stratos.` storage keys | Save key is `stratos_farm_save_v1`, preferences `sf_prefs_v1` |
| Real wallet test | `e2e/stratos-site.spec.ts` runs the game in a copy of the play page with the real `assets/stratos.js` and `coins-config.json`: +20 first play, +10 new level, -20 speed-up, -10 hint, a refused spend changes nothing |
| `tools/check_games.py` | cover, clip, details, files, coins, resume all pass ("goes live"); analytics is a dash (kids). The phone/computer rows were skipped by the tool (no Python Playwright) and were checked with an equivalent script: no scrolling, no crash |

## Needs a human or the admins
- **Say "publish"** to push to `staging` (removing `coming_soon` puts the game on the staging play page; it goes live at the Saturday release if issue #33 shows it ready, and @Mohua tests it).
- Anything in `assets/coins-config.json` (new rules or items, e.g. a "daily_challenge" for this game, a bigger price for boost) belongs to Sarfaraj, Sahil or Sahariar.
- Kids category means no ads and no analytics on this game (read the three questions in the commit). If the owner wants ads or analytics, change `category` to a general one and add `track()` events + a rewarded-ad `offerReward`.
- Pinch zoom and touch were never tried on a real phone; hover sound and music were checked for loading, not by ear.

## Next steps (exact)
1. Publish to `staging` when the owner says so; check https://stratos-family-staging.vercel.app and issue #33.
2. Real-phone test (touch, pinch, portrait), listen to the sounds.
3. Balance pass with real play numbers; polish animations; `construction_2x2` build animation.
4. Later, needs a backend + Stratos central accounts: social, leaderboards, admin dashboard, real purchases.
