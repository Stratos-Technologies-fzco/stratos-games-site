# PERFORMANCE (measured 2026-11-18)

## First load (built files, checked on every `vitest` run by `tests/perf.test.ts`)
| Part | Size |
|---|---|
| Whole first screen (page, scripts, css, 9 atlases, logo, manifest) | **2.94 MB raw** (budget 5 MB) |
| Scripts + css | 415 KB gzipped (Phaser 340 KB, React 45 KB, game 36 KB, css 4 KB) |
| Atlases | 9 files, largest 1024 x 1660 (budget 2048 x 2048) |
| Audio | **0 bytes on first load.** Music and effects only download when the player turns sound on (about 2.5 MB of OGG) |

Phaser and React are separate files so they stay cached when only the game code changes.

## Runtime
- Everything draws from 9 texture atlases (one request each); sprites are reused, floating text is pooled; only the plots/buildings that changed are updated after an action (no world reload).
- **Weak phones:** the game watches its own frame rate (`src/game/perf.ts`). If it stays under 35 fps for three samples in a row (6 s) it switches decorative effects off by itself (bobbing bubbles, wandering animals, pop-ins, water ripple, flying icons, dust) and says so. "Reduce effects" in Settings does the same by hand; `prefers-reduced-motion` is respected.
- Nothing runs on a server timer: growth, production and animal timers are computed from timestamps when needed (offline progress for free).

## Not measured (needs a real device)
- Frames per second on a mid-range Android phone (the 30 fps target). Headless test browsers use software rendering, so their fps numbers say nothing about phones. **Open `?debug=1` on a phone and watch for the "Switched off some effects" message as a quick check.**
- Battery use, long sessions (memory over hours).

## Balance simulation (bot plays, `tests/balance.test.ts`)
A simple bot keeps every system busy for 24 simulated hours: level 2 at about 30 min, 3 at 2 h, 4 at 4 h, 5 at 8 h, 6 at 12 h, 8 at 24 h; never below 0 coins; 14 buildings, 42 animals, 14 orders delivered. These are first-guess numbers for tuning with real players' data (the kids category sends no analytics, so tuning needs playtests).
