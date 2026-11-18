# DEVELOPMENT LOG

## 2026-11-18 — Box claim + Phase 0
- Claimed box `games/nikhatenglish89-stratos-farm/` (placeholder page + game.json, category kids, coming_soon), pushed to `staging` as commit ef1a9ac "claim box: nikhatenglish89-stratos-farm".
- Phase 0 assessment: read repo README/CLAUDE.md, assets manifest. Wrote ARCHITECTURE.md, IMPLEMENTATION_PLAN.md (this folder). No code written, no tests run, nothing else pushed.
- Next: owner answers the 5 open decisions, then say "go" for Phase 1.

## 2026-11-18 — Phase 1 (foundation)
Done: Vite + TS + Phaser 3 + React + Zustand app in this folder. Reusable iso module (`src/iso/`), layout-driven world (`src/data/farm_layout.json`), manifest-driven loader (atlases first, music queued after first frame), camera (drag pan, wheel + pinch zoom, clamped, resize-safe, portrait + landscape), hover/tile selection, pixel-accurate click on farmhouse/barn opening info panels, HUD (top bar, bottom nav, toast, recenter) built from the provided atlas frames. Unbuilt nav buttons and Settings show a "coming soon" toast and look disabled. `?debug=1` enables a green/red 2x2 placement preview under the pointer and `window.__farm` for tests.
Decisions: Tailwind skipped (plain CSS is enough for the HUD). Source entry is `app.html`; `npm run build` writes `build/` and a root `index.html` (committed, the site plays index.html). Assets live once, in `assets/farm/`.
Files: package.json, vite.config.ts, tsconfig.json, scripts/finalize.mjs, app.html, src/{iso,game,state,ui,data}/*, tests/*.test.ts, e2e/farm.spec.ts, assets/farm/*, docs/*.
Tests: see the result recorded in the Phase 1 report (vitest 17 passed, Playwright 4 passed).
Outstanding: crops/fields are visual only; no persistence; no audio playback; placement preview is debug-only until Phase 4; no home screen, Continue, thumbnail, hover clip or Stratos integration yet.

## 2026-11-18 — Phase 2 (core farming loop)
Done: `src/services/` (FarmService contract + LocalFarmService), `src/data/crops.json` (12 crops, seed values from the brief, the rest balanced), `src/game/controller.ts` (UI/world glue, no React or Phaser), crops drawn from farm state (stage from time, ready bubble, pop-in, pooled floating text), seed picker, inventory with sell, "Harvest all" button, level-up toast.
Rules kept from the server design: lazy time (`plantedAt`/`readyAt`, nothing ticks), one atomic transaction per action (a failed action changes nothing), ledger rows for coins/xp/items, Idempotency keys (replay returns the original result, nothing charged twice), calls queued one at a time (stands in for row locks), clock can never run backwards, corrupt save starts a fresh farm with a notice. Save key `stratos_farm_save_v1` (not a `stratos.` key).
Changes vs the brief: no registration/login (site rule: no sign-up forms); selling lives in the inventory panel (coins have to come from somewhere before the Phase 4 market); coins are "Farm Coins" and not wired to Stratos Coins yet. Field tiles are plots; crop art is no longer in the layout file.
Debug (`?debug=1` only): `window.__farm.advance(ms)` fast-forwards service time.
Tests: vitest 34 passed (iso 12, layout 5, farm service 17: plant, ledger, invalid tile/crop/locked/occupied, insufficient coins, growth by time, offline progress via reload, clock rollback, harvest, duplicate harvest, idempotency replay, concurrent harvest, harvest-all, level-up, sell, persistence, corrupt save). Playwright 5 passed (adds: plant, fast-forward, harvest, reload, sell).
Outstanding: honest limit, a player can still edit the saved file or change the device clock before it is first seen (single-player only); no sound; seed purchase is charged at planting (no seed inventory); no home screen/thumbnail/hover clip/Stratos link yet; touch and pinch not tried on a real device.
