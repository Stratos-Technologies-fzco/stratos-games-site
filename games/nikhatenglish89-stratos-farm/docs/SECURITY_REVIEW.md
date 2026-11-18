# SECURITY_REVIEW (2026-11-18)

Scope: the game as shipped in `games/nikhatenglish89-stratos-farm/`: a static, single-player browser game with a local save. There is no server, no login and no personal data. The master prompt's backend rules (JWT, argon2, rate limiting, audit log, row locking) apply when a server exists; the game was built so they can move there (see `FarmService`).

## Findings and status
| # | Area | Finding | Status |
|---|---|---|---|
| 1 | Trust | The save and the clock live in the player's browser, so a player can edit coins, XP or the clock. Acceptable for single-player; **not acceptable for anything competitive** (leaderboards, gifts, real purchases). | Accepted, documented. Server needed for any competitive feature |
| 2 | Clock | Turning the device clock back gains nothing (service time never goes backwards). Turning it forward is possible. | Mitigated (back), accepted (forward) |
| 3 | Save integrity | Saves carry a checksum and the previous save is kept. A save that fails the checksum is replaced by the previous one; if there is none it is still loaded (a checksum must never destroy a farm). The checksum catches damage and casual edits, it is not security. | Done, tested |
| 4 | Economy atomicity | Every action is all-or-nothing, queued one at a time, writes a ledger row and accepts an idempotency key (replays change nothing). Concurrency tests cover harvest, collect and queue. | Done, tested |
| 5 | Input validation | Plot/building/item ids, quantities (whole numbers >= 1), coordinates and recipe ids are validated in the service; unknown values return an error and change nothing. Imported backups are parsed and shape-checked (size limit 2 MB) before they replace a save. | Done, tested |
| 6 | Stratos Coins | The wallet belongs to the site. The game never reads or writes `stratos.` storage keys, never stores coins, and asks the wallet before a paid boost or hint. The payment is made on the page and applied by the local service, so a player who edits the page can skip it. | Accepted for single player; ask the site owners before making boosts matter competitively |
| 5b | Wallet fraud | Earning is done by the site from `level_start` and `level_complete` events with caps (per day, once per level). The game cannot mint coins itself. | By design |
| 6 | Injection | No `dangerouslySetInnerHTML`, no `eval`, no HTML built from player input; the only player-typed value is a number box. | Done |
| 7 | Third parties | No outside scripts, styles, fonts or analytics (checked by `tests/perf.test.ts` on every build). Kids category: no analytics, no ads. | Done, tested |
| 8 | Secrets | None in the code. No `.env`. No mobile ad IDs (`ca-app-pub-` is scanned for). | Done, tested |
| 9 | Storage | Keys: `stratos_farm_save_v1`, `stratos_farm_save_prev_v1`, `sf_prefs_v1`. Failures to write (private mode, full storage) are caught and the game keeps playing without saving. | Done |
| 10 | Payments / ads | Only mock providers exist (`src/providers/`). A mock receipt never grants gems; a real receipt must be verified by a backend and unused. Nothing is wired to the UI. | Done, tested |
| 11 | Dependencies | `npm audit` reports advisories in dev tooling only (Vite/Vitest/Playwright, not shipped). The shipped bundle contains Phaser, React and Zustand. | Review before each release |

## Before any server is added
Password hashing (argon2/bcrypt), JWT access + refresh, ownership check on every farm object, rate limits on auth and mutations, audit log for economy changes, server-side validation of every action that the local service already validates, receipt verification, CSRF/CORS review.
