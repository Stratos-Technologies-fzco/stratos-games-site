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
