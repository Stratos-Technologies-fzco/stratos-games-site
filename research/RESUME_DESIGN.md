# Stratos Resume: continue where you left off (design, 2026-11-17)

## Goal
A player who leaves a game (closes the tab, locks the phone, loses the connection) and comes back sees one question: **"Continue where you left off?"** with **Continue** and **Start new**. It must work the same way in every game that can resume, and cost a maker a few lines.

## Principles
1. **One owner.** Only `tools/resume.js` (built into `assets/stratos.js`) reads or writes the `stratos.resume.*` storage keys. Games call it through the page, like `Stratos.coins`. Storage can move to a server later without changing any game.
2. **The game decides what to save.** A page cannot snapshot a canvas or a Unity build. Each game gives a small plain-data state and knows how to restore it.
3. **Fail safe.** Blocked or full storage, a corrupt snapshot, a snapshot from an older format, a restore that throws: the game just starts new. Nothing ever throws into game code.
4. **Never lose a save by accident.** Escape or a stray tap on the prompt means Continue. Only the "Start new" button deletes.
5. **Small and local.** Plain JavaScript, no dependencies. On the device only for now (accounts and cross-device sync are phase 7).

## The API (`Stratos.resume`)
| Call | What it does |
| --- | --- |
| `save(state, {ver, label})` | Stores a snapshot for the page's game. Plain data only, under 100 KB. Writes are coalesced to one per half second (the last state wins) and always flushed when the page is hidden or closed. |
| `load({ver, ttlDays})` | Returns `{state, ts, ver, label, ageMs}` or `null` (none, too old, other version, corrupt). |
| `offer(onResume, onNew, opts)` | With a snapshot: asks "Continue where you left off?" and calls `onResume(state)` or `onNew()` (which also forgets the snapshot). Without one: calls `onNew()` at once. |
| `has()`, `clear()`, `list()` | Is there one; forget it; the games with a snapshot, newest first (for a "Continue playing" tile). |

Rules: one snapshot per game; a snapshot lives 30 days; `ver` is the game's own save-format number (bump it when the state changes shape and old saves are quietly dropped); when storage is full the oldest other snapshots are dropped first; works the same in the Kids section (on the device only, nothing is sent anywhere). Events `resume_offered`, `resume_taken` and `resume_new` go through the normal analytics.

## What "resume" means by game type
- **Match** (cards, dominoes): the match in progress.
- **Board / level** (puzzle, word, match-3): the board where the player stopped.
- **Level start / checkpoint** (platform, shooter with checkpoints): the level start or the last checkpoint, not the exact frame.
- **None**: endless runs and online games. Do not fake it; set `"resume": {"supported": false, "why": "..."}` in `game.json`.

## Coins and resume
Restoring a game must never pay coins twice. Coin rules already pay once per level or per unique reference, and a game must not call `earn()` while restoring. A resumed level pays when it is finished, as usual.

## Enforcement
The staging report (issue #33) gets a **resume** column: a game added from 2026-11-17 on that neither uses `Stratos.resume` nor opts out in `game.json` gets a ⚠️. It never blocks going live, and existing games show – until they are rolled out.

## Rollout
See `research/RESUME_INVENTORY.md`: what every game saves today and the suggested order. Phase 1 is the shared module and the check (done). Phase 2 is a pilot in two games. Phase 3 is the rest by game type, then cross-device sync with accounts.
