# ARCHITECTURE — STRATOS FARM: My Dream Village (Phase 0, draft for approval)

## What exists
- **Site repo** `Stratos-Technologies-fzco/stratos-games-site`: a STATIC site (Vercel, no build command, no server). One folder per game under `games/`. A GitHub Action (`tools/build.py`) builds front page, play page, sitemap from each `game.json`. Publishing = push to `staging`; live at the Saturday release.
- **Our box (claimed, on staging):** `games/nikhatenglish89-stratos-farm/` with a placeholder `index.html` and `game.json` (`category: kids`, `status: coming_soon`).
- **Assets v1** (this folder): 9 Phaser atlases, logo + PWA icons, 18 music / 64 SFX files. ~6.6 MB total; atlases 1.3 MB, audio 5.2 MB (lazy-load). Fits the 5 MB first-load budget if audio loads after the first frame.
- **Site rules that the master prompt did not know about** (from the repo's CLAUDE.md): no backend, no sign-up forms or passwords, no scripts from other sites, folder-only edits (`games/nikhatenglish89-*`), game must fit the screen without scrolling and work in portrait on a phone, Stratos splash is added by the site, analytics via `Stratos.track` (NOT for `kids`), Stratos Coins wallet, `Stratos.resume`, hover clip, thumbnail 800x500, 150+ word description, works offline once loaded.

## Conflicts with the master prompt and my proposed resolution
| Master prompt | Repo reality | Proposal |
|---|---|---|
| FastAPI + PostgreSQL, JWT login, Alembic | Static hosting, no servers, "no sign-up forms" | **No backend in MVP.** Put all rules behind a `FarmService` interface with a local implementation (localStorage/IndexedDB). It keeps the server-style rules: lazy time evaluation (`planted_at`/`ready_at`), atomic ledger writes, idempotency keys, master data in JSON. A real API can replace it later when Stratos central accounts exist. |
| "Server is source of truth", never trust browser clock | No server | Local authority only. Honest limit: players can change their device clock. Fine for a single-player game; anything competitive (leaderboards, gifts, visits) waits for a backend. |
| Phase 2 register/login | Forbidden by site rules | Dropped. Single local profile; Stratos central accounts later. |
| Phase 5 Social, Phase 7 admin dashboard | Needs backend | Out of scope until a backend exists. |
| Landscape-first | Must play in portrait phone, no zoom | **Portrait and landscape both**, HUD reflows; pinch-zoom is optional, never required. |
| Own PWA/service worker | Site-level; "works offline once loaded" | Skip custom PWA; keep everything inside the folder so it works offline. |
| Currency "Coins/Gems" | Own coin must not share a name with Stratos Coins | Farm-local currencies named **Farm Coins** and **Gems**, kept separate. Adapter to `Stratos.coins` only for one-use help (`boost`, `continue`) and for earning via `level_start`/`level_complete` events. A new Stratos item (e.g. "speed up crop") needs Sarfaraj/Sahil/Sahariar to add it to `assets/coins-config.json`. |
| Branch `feature/stratos-farm` | Repo hooks publish `staging` every turn; only `games/nikhatenglish89-*` is editable | Work on `staging` inside our folder. While `status: coming_soon` the unfinished game is not launched. |
| Repo-root `public/`, `docs/`, `tools/` | Root files are off limits | Everything lives inside `games/nikhatenglish89-stratos-farm/` (`assets/farm/...`, `docs/`, `src/`). |

## Stack (proposed)
TypeScript + Vite + Phaser 3 (canvas), React + Zustand (HUD/menus), Tailwind (built at dev time), Vitest + Playwright (dev only). Phaser/React are bundled locally, no CDN. Vite `base: './'`; the **built output is committed** into the game folder (same as Unity/Godot builds are welcome). `node_modules` is not committed; sources go in `src/`, build in `dist` served as the folder's `index.html`. Alternative if you prefer lighter: drop React, build HUD in Phaser DOM elements (smaller, fewer moving parts).

## Assets loading
Vite copies `assets/farm/` as-is. Phaser loader reads `assets/farm/asset-manifest.json` (relative URL, so it works inside the site's play-page iframe); atlases first, music after first frame; OGG with MP3 fallback. Frame names read from the atlas JSON. Audio is off by default with a mute button (site rule: soothing, never auto-loud).

## Site integration checklist (needed before launch, not in the prompt)
Home screen + short first-session tutorial; **Continue** + `Stratos.resume` (or `"resume":{"native":true}`); `localStorage` save; `game.json` description/controls/tips/story/how_to_play; 800x500 `thumbnail.png`; hover clip via `tools/make_clip.py`; no console errors; `Stratos.coins` adapter that no-ops when `SC()` is null. Kids category: no analytics calls, no ads.
