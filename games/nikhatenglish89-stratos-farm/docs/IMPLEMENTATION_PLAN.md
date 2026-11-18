# IMPLEMENTATION PLAN

Status: **Phases 0-3 done. Waiting for "go" on Phase 4 (completes the MVP).** Decisions approved 2026-11-18: no backend (local FarmService), keep React, build in the Desktop clone, category `kids`, currencies Farm Coins + Gems.

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
## Phase 4 — Orders, market, building shop, expansion, quests, tutorial (MVP complete).
## Site-launch pass — home screen, Continue/resume, thumbnail, clip, description, Stratos Coins adapter, quality bar.
## Later (needs backend + Stratos central accounts): social, leaderboards, admin dashboard, real purchases.

## Decisions (all answered: recommendations accepted)
1. No backend for MVP (local FarmService)? **Recommended.**
2. Keep React, or lighter Phaser-only UI?
3. Work location: clone the site repo to ~/Desktop/stratos-games-site and build in `games/nikhatenglish89-stratos-farm/`. OK?
4. Category stays `kids` (no analytics/ads) or switch to a non-kids category?
5. Currency names Farm Coins + Gems; which Stratos Coins items to request.

## Next steps (exact)
1. Phase 4: NPC customer orders (old_joe, priya, chef_marco, lily, omar, nana_rose, portraits in `atlas_characters`), market selling with prices from `items.json`, building move/rotate/remove, farm expansion (the `locked_land` patch and `expand` icon), data-driven quests (tutorial, daily, farming, animal, production), idempotent reward claiming, achievements, ~5-step first-session tutorial, MVP acceptance check against CLAUDE.md.
2. Before launch: home screen, Continue/resume (`"resume": {"native": true}` fits, the farm always carries on), thumbnail, hover clip, 150+ word description, Stratos Coins adapter, publish to `staging`.
