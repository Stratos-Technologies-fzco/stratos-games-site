# IMPLEMENTATION PLAN

Status: **MVP (Phases 1-4) built. Waiting for the owner on: push to staging, then the site-launch pass.** Decisions approved 2026-11-18: no backend (local FarmService), keep React, build in the Desktop clone, category `kids`, currencies Farm Coins + Gems.

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

## Next steps (exact)
1. Push Phases 2-4 to `staging` (owner's call) and check https://stratos-family-staging.vercel.app.
2. Site-launch pass (not in the master prompt, required by the repo): home screen with a clear goal and **Continue** (`"resume": {"native": true}` fits), thumbnail 800x500, hover clip (`tools/make_clip.py`), 150+ word description / controls / tips / story in `game.json`, `how_to_play`, Stratos Coins adapter (earn via `level_complete` events, spend on `hint`-style items; kids category = no analytics), no console errors, sound off by default.
3. Phase 6 (polish): audio, animations, accessibility, mobile pass on a real phone.
4. Later, needs a backend + Stratos central accounts: social, leaderboards, admin dashboard, real purchases.
