# Stratos Coins: Architecture Document

Date: 2026-11-16 · Site: https://stratos.games

> **Instructions for Claude Code.** Build the Stratos Coins economy described below, one phase at a time (section 11), and stop for review at the end of each phase. Before writing code, read the existing `assets/stratos.js` and follow its style and its `track()` usage. Do not add frameworks or dependencies. Do not start phase 7 (accounts, buying coins, trading); only keep the design hooks in section 10.

## 1. Purpose, goals and scope

Stratos Coins is one shared currency for every game on stratos.games: players earn coins in any game and spend them in any game. Phases 1 to 6 build a device-only economy; accounts, purchases and trading come later and must not require a redesign.

**Goals**

- One wallet and one ledger shared by all games on the site.
- One small API (`Stratos.coins.*`) that every game uses, so no game stores currency itself.
- Earn rules, daily caps and the spend catalogue live in config, so they can change without editing games.
- Coin balance visible in the site's top bar, plus a coins page with history.
- Every new game is built with the economy in mind (rule for makers in `CLAUDE.md`).

**In scope now (phases 1 to 6)**

- Earn by playing: coins per level, daily challenge, streaks, daily caps.
- Spend inside Stratos: unlock levels, unlock hints, play premium games.
- Tradable within the Stratos ecosystem only (design hook; see section 10).
- Device-only storage, no login.
- Coin events in Stratos analytics.

**Out of scope now (phase 7, a separate project)**

- Buying coins with rupees or dollars, priced per country.
- Trading coins with the outside world.
- Server-side accounts and server-verified balances.
- Live rewarded ads (the slot is reserved, disabled until ads exist).

**Done when (phases 1 to 6)**

A player can earn coins in one game and spend them in another, and every game is built with the economy in mind.

## 2. Design principles and system overview

The whole economy sits behind one module, `Stratos.coins` in `assets/stratos.js`; games call it and never touch storage, so storage can move to a server later without changing any game.

**Principles**

1. **Single owner.** Only `stratos.js` reads or writes coin storage. Games, the top bar and the coins page all go through the API.
2. **Ledger first.** Every change is a ledger entry. The balance is derived from the ledger; the stored balance is a cache that can be rebuilt.
3. **Rules, not numbers.** Games request an earn *rule ID* (`level_complete`), not an arbitrary amount. Amounts, caps and prices live in config.
4. **Server-shaped API.** Each call is something a server could validate later (rule ID, game ID, context), so moving to accounts changes the backend, not the callers.
5. **Fail safe.** If storage is unavailable or corrupt, the game still runs; coins just don't persist. Never throw into game code.
6. **Versioned data.** Every stored object carries a `v` field with a migration path.
7. **Small and dependency-free.** Plain JavaScript, no framework, works on mobile browsers.

**Components**

| Layer | What it is | Where |
| --- | --- | --- |
| Game API | `Stratos.coins.balance / earn / spend / can / has / onChange` | `assets/stratos.js` |
| Rules engine | Validates earn rules, caps, streaks; checks spend items and prices | `assets/stratos.js` |
| Config | `assets/coins-config.json`: earn rules, caps, catalogue | new file |
| Ledger | Append-only list of earn and spend entries | browser storage |
| Wallet | Cached balance, device ID, unlocks, streak and daily counters | browser storage |
| Analytics bridge | Sends `coin_earn`, `coin_spend` through the existing `track()` | `assets/stratos.js` |
| Site UI | Top bar coin chip, coins page, toasts | site header and `/coins` page |
| Backend (later) | Accounts, server ledger, validation, purchases | phase 7 |

**Data flow for an earn**

1. Game calls `Stratos.coins.earn('level_complete', {game, level})`.
2. Rules engine looks up the rule, checks the per-game and per-day caps and any one-time keys (for example, each level pays once).
3. It writes a ledger entry, updates the wallet cache, then fires `onChange` and an analytics event.
4. It returns `{ok, amount, balance}` to the game; the top bar updates from `onChange`.

A spend follows the same path in reverse: look up the catalogue item, check the balance, write a ledger entry, record the unlock, notify.

## 3. Wallet

The wallet is one JSON object in `localStorage` under the key `stratos.wallet.v1`, shared by every game because all games run on the same origin (stratos.games).

```json
{
  "v": 1,
  "deviceId": "d_k3j9x2...",
  "balance": 240,
  "lifetimeEarned": 610,
  "lifetimeSpent": 370,
  "unlocks": { "moto-rush:level:5": 1731700000000, "dino-frontier:hint:lvl3": 1731700500000 },
  "streak": { "count": 4, "lastDay": "2026-11-16" },
  "counters": { "2026-11-16": { "total": 85, "byGame": { "moto-rush": 40 }, "byRule": { "daily_challenge": 1 } } },
  "onceKeys": { "moto-rush:level:1": 1 },
  "checksum": "...",
  "createdAt": 1731600000000
}
```

**Fields**

| Field | Purpose |
| --- | --- |
| `deviceId` | Random ID made on first use; used later to migrate the balance to an account. Never derived from personal data. |
| `balance` | Cached sum of the ledger. Rebuilt from the ledger if the two disagree. |
| `unlocks` | Items the player has bought (level, hint, premium game), keyed by item ID. |
| `streak` | Consecutive days with at least one earn, using the player's local date. |
| `counters` | Per-day totals used to enforce daily caps. Keep only the last 7 days. |
| `onceKeys` | One-time earn keys (for example, first completion of a level) so a level cannot be farmed. |
| `checksum` | Light tamper signal (see section 8); never treated as security. |

**Rules**

- Read and write only through helper functions in `stratos.js`; wrap every storage call in try/catch.
- Write synchronously after every change, and keep the object small (target under 20 KB).
- If `localStorage` is blocked (private mode, storage full), fall back to an in-memory wallet for the session and mark `Stratos.coins.persistent === false`.
- Cross-tab sync: listen to the `storage` event so a balance changed in one tab updates the others.
- Include `v` in every object; add a `migrate(wallet)` function from day one.
- Never store personal information in the wallet.
- Games hosted on other subdomains or in iframes cannot read this storage. If any exist, they use the `postMessage` bridge described in section 5, with the parent page as the only writer.

## 4. Ledger

The ledger is the source of truth: every earn and spend is one append-only entry, stored under `stratos.ledger.v1`. Balances can be checked and corrected by replaying it.

```json
{ "id": "e_000123", "ts": 1731700000000, "type": "earn", "amount": 20, "game": "moto-rush", "reason": "level_complete", "ref": "level:5", "balanceAfter": 260, "src": "device" }
```

| Field | Meaning |
| --- | --- |
| `id` | Sequential per device (`e_` + counter), unique, never reused. |
| `ts` | Epoch milliseconds when the entry was written. |
| `type` | `earn`, `spend`, or `adjust` (admin or repair entries only). |
| `amount` | Positive integer. The sign comes from `type`. |
| `game` | Game ID that triggered it, or `site` for site-level events. |
| `reason` | Earn rule ID, or spend item ID. |
| `ref` | Optional context, such as `level:5`, kept short. |
| `balanceAfter` | Balance right after this entry; lets us spot gaps or edits. |
| `src` | `device` now; `server` later. Used when merging. |

**Rules**

- Append only. No code path edits or deletes an entry; a correction is a new `adjust` entry.
- Integer coins only. Reject floats, negatives, `NaN` and amounts over a sanity limit (for example, 10,000 per call).
- Keep the last 500 entries on the device. When trimming, fold the dropped entries into a `summary` object (totals per game and per reason) so lifetime numbers stay correct.
- Reconcile on load: replay the entries, compare with `wallet.balance`, and if they differ write an `adjust` entry and log a `coin_reconcile` analytics event.
- Two writes in the same tick must not interleave: use a simple in-module lock, and re-read the wallet before every write because another tab may have changed it.
- The coins page reads the ledger for its history list through `history(limit)`; nothing else reads it directly.

## 5. Game API

Every game uses the same `Stratos.coins` object from `assets/stratos.js`, next to the existing `track()`. All methods are safe to call at any time and never throw.

| Method | Returns | Behaviour |
| --- | --- | --- |
| `balance()` | number | Current coins (integer). |
| `earn(ruleId, ctx)` | `{ok, amount, balance, reason?}` | Pays the amount defined by the rule, after cap and once-only checks. `ctx` = `{game, level?, ref?, multiplier?}`. `ok:false` carries a `reason` such as `capped`, `already_earned`, `unknown_rule`, `disabled`. |
| `spend(itemId, ctx)` | `{ok, balance, reason?}` | Looks up the price in the catalogue and deducts it. `reason` can be `insufficient`, `unknown_item`, `already_owned`. |
| `can(itemId)` | `{affordable, owned, price}` | Check without spending, for greying out buttons. |
| `has(itemId)` | boolean | True if the item is already unlocked on this device. |
| `price(itemId)` | number or null | Price from the catalogue. |
| `onChange(cb)` | unsubscribe function | Fires after any balance or unlock change, in this tab or another. |
| `rules()` / `catalogue()` | object | Read-only copies of the config, for UI. |
| `history(limit)` | array | Latest ledger entries, newest first. Read-only, for the coins page. |
| `ready()` | Promise | Resolves when config is loaded. Games may await it before first use. |
| `persistent` | boolean | False if storage is blocked and the wallet is in memory only. |

The original brief lists `earn(amount, reason)` and `spend(amount, item)`. This design takes a rule ID and an item ID instead of a raw amount, so a game cannot invent prices or payouts and the same call can later be validated by a server. If a game truly needs a custom amount, add a rule with `"amount": "dynamic"`, a `min` and a `max`, and pass `ctx.amount`.

**Examples**

```js
// level finished
const r = Stratos.coins.earn('level_complete', { game: 'moto-rush', level: 5 });
if (r.ok) showToast('+' + r.amount + ' coins');

// hint button
if (Stratos.coins.can('hint').affordable) {
  const s = Stratos.coins.spend('hint', { game: 'dino-frontier', ref: 'lvl3' });
  if (s.ok) revealHint();
}

// locked level
if (!Stratos.coins.has('moto-rush:level:6')) promptUnlock('moto-rush:level:6');

// keep the HUD in sync
Stratos.coins.onChange(({balance}) => hud.setCoins(balance));
```

**Rules for the API**

- Synchronous for device mode. Keep the same return shape if it becomes async later; callers that `await` it keep working.
- `ctx.game` is required; missing game ID returns `ok:false, reason:'no_game'`.
- Calls are idempotent where a `ref` is given: earning `level_complete` for the same `ref` twice pays once.
- Reading `balance()` before config has loaded returns the stored balance; earn and spend wait for config or return `reason:'not_ready'`.
- Every call that changes state also calls `track('coin_earn' | 'coin_spend', {...})`.

**Cross-origin games.** If a game runs in an iframe or on another subdomain, it uses `postMessage` with `{type:'stratos.coins', call, args, id}` and the parent page (which owns storage) replies. Verify `event.origin` against an allow-list. Same-origin games do not need this.

## 6. Earn rules

Earn rules live in `assets/coins-config.json`, not in games. The numbers below are starting values to tune after the pilot; they are chosen so a casual player earns roughly 50 to 100 coins a day.

| Rule ID | Trigger | Coins | Limit |
| --- | --- | --- | --- |
| `level_complete` | First completion of a level | 10 (levels 1 to 10), 15 (11 to 30), 20 (31+) | Once per level per game (`onceKeys`) |
| `level_replay` | Replay of an already-completed level | 2 | Max 5 per game per day |
| `daily_challenge` | Complete the day's challenge | 30 | Once per day |
| `streak_bonus` | First earn of a day while on a streak | 5 per streak day, up to 25 | Once per day |
| `game_first_play` | First time playing a given game | 20 | Once per game |
| `rewarded_ad` | Watch a rewarded ad (disabled until ads are live) | 15 | Max 3 per day |

**Caps**

- Daily total cap across all games: 200 coins (earn from `rewarded_ad` counts toward it).
- Daily cap per game: 100 coins, so one game cannot be farmed for the whole allowance.
- When a cap is hit, `earn` returns `ok:false, reason:'capped'`; games should hide "+coins" UI rather than show an error.
- The day boundary is the player's local midnight; store the date string in `counters`.

**Streaks**

- Streak counts consecutive local days with at least one successful earn.
- Missing a day resets to 1. (Optional later: one free "streak freeze" per week.)
- Streak bonus is paid by the first earn of the day, not by a separate call.

**Daily challenge**

- One challenge per day, same for all players, picked from a list in the config by date (day-of-year modulo list length), so it needs no server.
- The game reports completion with `earn('daily_challenge', {game, ref: 'YYYY-MM-DD'})`; the `ref` makes it idempotent.

**Config shape**

```json
{
  "version": 1,
  "caps": { "daily_total": 200, "daily_per_game": 100 },
  "rules": {
    "level_complete": { "amount": [{"maxLevel":10,"coins":10},{"maxLevel":30,"coins":15},{"maxLevel":9999,"coins":20}], "once": "game+level", "enabled": true },
    "daily_challenge": { "amount": 30, "once": "day", "enabled": true },
    "rewarded_ad": { "amount": 15, "perDay": 3, "enabled": false }
  }
}
```

The config is fetched once, cached in memory, and falls back to a built-in default copy if the fetch fails, so earning never breaks offline.

## 7. Spend catalogue

Every spendable item has an ID, a type and a price in the same config file. Games ask for items by ID; they never pass a price.

| Type | Item ID pattern | Example | Starting price | Behaviour |
| --- | --- | --- | --- | --- |
| Level unlock | `<game>:level:<n>` | `moto-rush:level:6` | 50 | Permanent unlock, stored in `wallet.unlocks`. |
| Hint | `hint` (consumable) | `hint` | 10 | Each spend grants one use; not stored as an unlock. |
| Premium game | `<game>:premium` | `dino-frontier:premium` | 500 | Permanent unlock of the whole game. |
| Pass (optional, later) | `<game>:pass:<days>` | `battle-royale:pass:7` | 150 | Time-limited unlock; store the expiry timestamp. |

**Config shape**

```json
{
  "catalogue": {
    "hint": { "type": "consumable", "price": 10 },
    "moto-rush:level:*": { "type": "unlock", "price": 50, "freeUpTo": 5 },
    "dino-frontier:premium": { "type": "unlock", "price": 500, "label": "Dino Frontier" }
  }
}
```

A `*` pattern covers a family of items so a game does not need one entry per level; `freeUpTo` marks levels that are always unlocked. Exact IDs override patterns.

**Rules**

- `spend` of an owned permanent unlock returns `ok:false, reason:'already_owned'` and charges nothing.
- Price changes apply to future spends only; past ledger entries are never rewritten.
- Premium games check `Stratos.coins.has('<game>:premium')` on load and show an unlock screen with price and balance if false.
- Show the price and the player's balance on every unlock prompt, and confirm with a tap before spending, so there are no accidental spends.
- The coins page lists everything the player has unlocked, built from `wallet.unlocks`.
- Spending is the main reason to earn: tune prices so a typical player can afford one unlock after about two days of play.

## 8. Integrity, rewarded ads and analytics

**Integrity.** On a device with no login, a determined player can edit storage; this phase makes that hard and cheap to detect, and does not claim to stop it. Real protection arrives with server-side accounts in phase 7.

- Rule-ID API, once-keys, caps and idempotent `ref` values stop accidental double-pay and casual farming.
- The wallet carries a checksum over `balance`, `deviceId` and the last ledger ID. On load, a mismatch triggers a reconcile and a `coin_tamper_suspected` analytics event. It is a signal for us, not a lock.
- Do not block or punish on a mismatch in this phase: repair from the ledger and carry on.
- Because nothing bought with coins costs real money yet, the risk of device-side tampering is low. **Before coins can be bought with money, or traded outside Stratos, balances must be validated on a server.**
- Design for that now: every ledger entry has `src`, the `deviceId` and a `ref`, so a later server can accept, replay or reject device entries.
- Never put secrets, keys or admin switches in client code.

**Rewarded ads.** The `rewarded_ad` earn rule exists in config but stays `enabled:false`.

- When ads go live, the ad SDK's "reward granted" callback is the only place that calls `earn('rewarded_ad', {game, ref: adSessionId})`.
- Daily cap of 3 ads and the global daily cap still apply.
- Show "watch an ad for coins" only when `rules().rewarded_ad.enabled` is true and an ad is ready.

**Analytics.** All events go through the existing `track()`, called from inside `stratos.js` so games do not need to.

| Event | When | Properties |
| --- | --- | --- |
| `coin_earn` | Successful earn | `game`, `rule`, `amount`, `balance`, `streak` |
| `coin_earn_blocked` | Earn refused (cap, once, disabled) | `game`, `rule`, `reason` |
| `coin_spend` | Successful spend | `game`, `item`, `price`, `balance` |
| `coin_spend_blocked` | Spend refused (insufficient funds) | `game`, `item`, `price`, `balance` |
| `coin_reconcile` | Ledger and balance disagreed | `delta` |
| `coin_tamper_suspected` | Checksum mismatch | none |
| `coins_page_view` | Coins page opened | `balance` |

Useful questions these answer: coins earned per game, which items players buy, where players run out of coins, and whether day-2 and day-7 return rate rises for players who spent coins.

## 9. Site UI

**Top bar coin chip**

- A small chip in the site header on every page, showing a coin icon and the balance (for example, 240), linking to `/coins`.
- Updates live through `Stratos.coins.onChange`, including changes from other tabs.
- Short count-up animation when coins are earned, and a brief `+20` toast near the chip.
- Large numbers shorten (1.2K); the full number shows on the coins page.
- Hidden or shown as 0 until the first earn is acceptable; do not show an error if storage is blocked.
- Works at 360 px width on mobile; tap target at least 44 px.

**Coins page (`/coins`)**

| Section | Content |
| --- | --- |
| Balance | Big balance, lifetime earned and spent, current streak. |
| Today | Coins earned today against the daily cap, and today's daily challenge with a link to the game. |
| Ways to earn | Short list built from `rules()`: levels, daily challenge, streak, first play. |
| Spend | Catalogue items grouped by game (premium games, level unlocks, hints) with price and an Unlock button where it makes sense. |
| Unlocked | Everything the player has unlocked. |
| History | Last 50 ledger entries: time, game, reason, +/- amount. |

**Rules**

- Built with the site's existing styles and plain JavaScript; no new framework.
- The page reads only through the public API (`balance`, `rules`, `catalogue`, `has`, `onChange`, `history`).
- Show a clear note that coins are only for use inside Stratos and have no cash value.
- If there is no wallet yet, show an empty state: "Play a game to earn your first coins."
- Accessibility: balance is announced with `aria-live="polite"`, colours meet contrast guidelines, and nothing relies on colour alone.

## 10. Future: accounts, purchases and trading (design hooks only)

Nothing in this section is built in phases 1 to 6. It lists what the device-only design must keep possible, so phase 7 does not need a rewrite.

**Accounts and moving device balances over**

- Accounts come from a central service. When a player signs in, the site sends the device `deviceId`, wallet and ledger to the server in one `claim` call.
- The server checks the ledger (sequential IDs, `balanceAfter` chain, caps), accepts a validated amount, and returns the account's authoritative balance. A device can be claimed once; a second device's ledger is merged by entry ID.
- After a claim, `src` on new entries becomes `server`, and `earn` and `spend` call the server first, with the local wallet as a cache. Because the API already uses rule IDs and item IDs and can return a Promise, callers do not change.
- Offline play stays possible: queue entries locally and sync when online.

**Buying coins (later, only when games are sticky)**

- Prices per country and currency, set in a server-side price table; payment provider and receipts handled only on the server.
- Purchased coins arrive as ledger entries with `reason: 'purchase'` and a receipt reference.
- Gate: do not start until day-after-day return rates show the games are sticky. Needs server validation first (section 8).
- Check store, tax and payment rules for India, the Middle East and Asia-Pacific before launch.

**Trading**

- Within Stratos only: a transfer is a pair of ledger entries (`transfer_out`, `transfer_in`) created by the server between two accounts. It needs accounts and cannot be done on devices.
- Trading with the outside world is a separate legal and product project, not part of this design.

**Hooks to keep now**

| Hook | Why |
| --- | --- |
| `deviceId` in wallet and every ledger entry | Lets the server link device history to an account. |
| Sequential `id` and `balanceAfter` in the ledger | Lets the server detect gaps and edits. |
| `src` field | Separates device entries from server entries. |
| Rule-ID and item-ID API | Server can validate the same calls. |
| Versioned storage (`v`) and `migrate()` | Safe format changes. |
| Config in a JSON file | Can later be served per country or per account. |

## 11. Build phases and acceptance criteria

Phase 1 is this document, reviewed by Sahil and Sahariar. Phases 2 to 6 below are the build. Claude Code should do one phase at a time and stop for review at the end of each. Before starting, read the existing `assets/stratos.js` and follow its style and its `track()` usage.

**Phase 2: wallet, ledger and game API (device only)**

- [ ] Add `assets/coins-config.json` with caps, earn rules and a starter catalogue (sections 6 and 7), plus a built-in default copy inside `stratos.js`.
- [ ] Add `Stratos.coins` to `assets/stratos.js`: wallet, ledger, rules engine, `balance, earn, spend, can, has, price, onChange, rules, catalogue, history, ready, persistent`.
- [ ] Storage helpers with try/catch, in-memory fallback, `migrate()`, cross-tab `storage` listener, reconcile on load.
- [ ] Analytics through `track()` for all events in section 8.
- [ ] A test page `coins-test.html` (not linked from the site) with buttons to earn, spend, reset and dump wallet and ledger.

*Done when:* earning pays the right amount once per `ref`; caps and once-keys refuse correctly; spend deducts and records unlocks; deleting the stored balance restores it from the ledger; two tabs stay in sync; a blocked-storage run does not throw.

**Phase 3: coin balance on the site**

- [ ] Top bar chip on every page, live updates, toast on earn.
- [ ] `/coins` page with the sections in section 9.

*Done when:* the balance shows on every page and on a 360 px screen, updates without reload, and the coins page matches the ledger.

**Phase 4: one pilot game earns and spends**

- [ ] Choose one simple, level-based game. Ask the owner which if unclear.
- [ ] Earn `level_complete` and `level_replay`; spend on hints and on locking later levels.
- [ ] Unlock prompt shows price and balance, with a confirm tap.

*Done when:* a player can earn coins in the pilot game, see the balance in the top bar, and spend coins in the same game; and a second game (even a stub) can read the same balance and spend coins on its own item.

**Phase 5: rule for makers (`CLAUDE.md`)**

- [ ] Add the section from section 12 to `CLAUDE.md`, plus a short "economy checklist" for new games.

*Done when:* a new game started from `CLAUDE.md` alone includes earn and spend calls and no home-made currency.

**Phase 6: roll out to every game**

- [ ] List all games; for each, decide earn rules, hint and unlock items, and any premium status; record in a table in the repo.
- [ ] Retrofit one game at a time, test, and ship.
- [ ] Remove any per-game coin or points storage that duplicates the shared wallet.

*Done when (phases 1 to 6):* a player can earn coins in one game and spend them in another, and every game follows the maker rule.

**Phase 7 (later, separate project):** accounts, buying coins, trading; see section 10.

## 12. Maker rules, test checklist and open questions

**Text to add to `CLAUDE.md` (phase 5)**

```markdown
## Stratos Coins: how every game plugs into the economy

- All Stratos games share one currency, Stratos Coins, through `Stratos.coins` in `assets/stratos.js`.
- Never store coins, points-as-currency, unlocks or prices in your own game. Never read or write `localStorage` keys that start with `stratos.`.
- Earn with a rule ID, never a raw number: `Stratos.coins.earn('level_complete', { game: '<game-id>', level: n })`.
- Spend with an item ID from the catalogue: `Stratos.coins.spend('hint', { game: '<game-id>' })`. Check `can()` and `has()` before showing buttons.
- Pass a stable `ref` (level number, date, ad session) so repeated calls pay once.
- If a game needs a new rule or a new item, add it to `assets/coins-config.json`; do not hard-code amounts or prices in the game.
- Handle `ok:false` quietly: hide the reward UI when capped, show price and balance when short of coins.
- Show the player what they earned (+N toast) and what a spend costs before they confirm.
- Subscribe to `Stratos.coins.onChange` to keep your HUD in sync.
- Every new game must define: its earn points, one or more spend items (hints, levels or premium), and a pilot test that earns in this game and spends in another.
```

**Test checklist**

- [ ] Earn pays once per `ref`; a repeat returns `already_earned`.
- [ ] Per-game and per-day caps stop the payout and return `capped`.
- [ ] Spend with too few coins returns `insufficient` and changes nothing.
- [ ] Owned unlock cannot be bought twice.
- [ ] Clearing `balance` from storage restores it from the ledger; clearing the ledger keeps the wallet and logs a reconcile.
- [ ] Two tabs open: earn in one, balance and chip update in the other.
- [ ] Storage blocked or full: no exceptions, games keep running, `persistent` is false.
- [ ] Earn in game A, spend in game B, same browser: balance carries over.
- [ ] Day rollover at local midnight resets counters and updates the streak (test with a mocked date).
- [ ] Offline load: config falls back to the built-in default.
- [ ] Mobile 360 px: chip, toasts and coins page are usable.
- [ ] Analytics events fire with the properties in section 8.

**Risks**

| Risk | Mitigation |
| --- | --- |
| Players edit storage to grant coins | Ledger, checksum and reconcile now; server validation before any real-money feature. |
| Economy too generous or too stingy | All numbers in config; tune after the pilot using analytics. |
| A game bypasses the API | `CLAUDE.md` rule; review checklist; search for `stratos.` storage keys outside `stratos.js` during rollout. |
| Storage cleared by the browser | Balance lost; tell players on the coins page; accounts fix this later. |
| Different games on different origins | Same origin is assumed; otherwise use the `postMessage` bridge. |

**Open questions for Sahil and Sahariar**

1. Which game is the pilot (phase 4)?
2. Are all games on stratos.games on one origin, or do any run in iframes or on subdomains?
3. Which games are premium, and what should they cost?
4. Are the starting earn amounts, caps and prices in sections 6 and 7 acceptable for tuning?
5. Which analytics system does `track()` send to, and can it take the properties in section 8?
6. Should coin amounts shown in the UI be localised (for example, number format for India and the Middle East)?

## 13. Build notes (added during the build, 2026-11-16)

Decisions and differences from the sections above, so the document matches what shipped.

- **Two coins, no exchange (owner decision).** A game may keep its own in-game coin (skins, upgrades). Stratos Coins stay the one universal coin. The two are never exchanged. Section 1's "no game stores currency itself" now means: no game stores *Stratos Coins* itself. The maker rule in `CLAUDE.md` says this.
- **Where the code lives.** `assets/stratos.js` is generated by `tools/build.py` from `tools/coins.js` and `assets/coins-config.json` (the config is also baked in as the offline default). Never edit `stratos.js` by hand.
- **Game IDs** are the site folder names (for example `sksarfarajali-moto-rush`), because `stratos.js` takes the game ID from the page URL.
- **Config is ready at once.** Earning works from the built-in copy straight away; the JSON file replaces it once fetched, so `not_ready` is never returned.
- **Caps clamp.** When a payout would pass a daily cap, it pays what is left, then returns `capped`.
- **Extra API methods** for the coins page: `stats()`, `unlocks()`, `dailyChallenge()`.
- **No `postMessage` bridge.** Games run in the play page's frame and reuse the parent's `Stratos`, so they are same-origin.
- **New rule and item.** `match_win` (5/8/12/15 coins for Easy/Medium/Hard/Expert, up to 5 paid wins per game per day) for round-based games, and the `undo` item (5 coins). `level` in the config means "tier" for this rule.
- **Phase 3.** The chip is in the home top bar and in the logo/search card on other pages; `/coins/` is generated by `tools/build.py` and filled in by `assets/coins-page.js`. The bot's `git add` list in `.github/workflows/build.yml` and `sync-staging.yml` includes `coins`.
- **Phase 4 pilots.** Domino Classic and Stratos 29 Card Game. They earn on first play and match wins and the daily challenge, and spend on hints (and undos in Domino). Online matches pay nothing, to stop farming between friends.
- **Open for later.** Premium games and prices, Moto Rush (endless runner with its own coin), Brain Rush (compiled bundle, earn-only by watching its saves), kids-section games (no analytics, so no coin events), and the hand-written static pages (About, Press) that do not show the chip yet.
