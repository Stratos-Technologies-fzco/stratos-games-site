# Stratos Coins: admin guide (2026-11-16)

For Sahil and Sahariar. How to set the coin rules for the whole site and for one game, and how new games get included.

## 1. Where the rules live

One file: `assets/coins-config.json`. Only the admin accounts can edit it (the repo guard blocks makers from shared files). Edit it, push to `staging`, and it goes live at the Saturday release together with everything else. No game code changes.

What happens when you push a change to this file:

1. The site rebuilds (the file is in the build workflow's trigger paths), and the new numbers are baked into `assets/stratos.js` as the offline default. The JSON file itself is also served, and the site fetches it, so players get new numbers right away on staging.
2. The staging report (issue #33) refreshes and shows **"Coins config: valid"** or lists the problems.
3. `tools/build.py` prints `COINS CONFIG WARNING` lines for the same problems. A bad config never stops the build, and the engine ignores a bad per-game value and uses the global rule instead.

**Always check before you push:** `python3 tools/check_coins_config.py` prints every problem (wrong type, a zero or negative amount, a game name with no folder, a misspelt rule or item name) and exits 1 if there is one.

## 2. Site-wide rules (apply to every game)

| What | Where | Today |
| --- | --- | --- |
| Earn rules (amount, limit, on/off) | `rules` | first play 20; new level 10/15/20; replay 2; win 5/8/12/15; daily challenge 30; streak bonus |
| Daily caps | `caps` | 200 a day in total, 100 a day per game |
| One-use help prices | `catalogue` | hint 10, undo 5, continue 15, boost 20 |
| Games that earn by themselves (no automatic earn) | `auto.exclude` | Domino Classic, Stratos 29 Card Game |
| Daily challenge list | `dailyChallenges` | 8 games |
| Coins in the Kids section | `kidsCoins` | `true` (set `false` to switch off) |

## 3. Rules for one game: the `games` section

A game listed in `games` has its own settings on top of the global ones. A game that is not listed uses the global rules unchanged.

```json
"games": {
  "sksarfarajali-moto-rush": {
    "earn":     { "level_complete": 20, "level_replay": false, "match_win": { "amount": 7, "perGamePerDay": 3 } },
    "dailyCap": 60,
    "items":    { "continue": 25, "hint": false }
  },
  "sksarfarajali-brainrush": { "coins": false }
}
```

| Field | What it does |
| --- | --- |
| `coins: false` | Switches Stratos Coins off for this game. It earns nothing and nothing can be spent. Where the game asked for coins it behaves like before (the old free reward). |
| `earn.<rule>: 20` | This rule pays 20 in this game (a flat amount, replacing tiers). |
| `earn.<rule>: false` | This rule is off in this game. |
| `earn.<rule>: { ... }` | Replace fields of the rule: `amount`, `once`, `perDay`, `perGamePerDay`, `enabled`. |
| `dailyCap: 60` | This game can pay at most 60 coins a day (the global per-game cap is 100). It can never be above the daily total. |
| `items.<item>: 25` | This item costs 25 in this game. Use the exact catalogue name. |
| `items.<item>: false` | This item is off in this game (the game's help becomes free as before). |

Notes:

- A game's earnings still count toward the site-wide daily total (200).
- The streak bonus and the daily challenge follow the same override rules.
- `Stratos.coins.rulesFor('<game>')` returns a game's effective rules (used by tests and by the coins page later). `Stratos.coins.rules()` stays global.
- Prices for a premium game or level unlocks still go in `catalogue` with the game name in the key, for example `my-game:premium`.

## 4. How a new game gets coins

1. The maker builds the game with Claude Code. `CLAUDE.md` tells it about Stratos Coins.
2. **Earning is automatic** for a game that sends `level_start` and `level_complete` or `game_over` (an existing site rule). Send a real level number in `level_complete` and `won: true` in a winning `game_over`.
3. **Spending is one call:** `Stratos.coins.offer('hint' | 'continue' | 'boost' | 'undo', onDone)` where the game gave a free hint, second chance or power-up.
4. A new price, premium game or level unlocks: the maker asks an admin, who edits the config (section 2) and runs `check_coins_config.py`.
5. **The staging check (issue #33)** now has a `coins` column:
   - ✅ the game calls the coin wallet to spend,
   - ⚠️ no way to spend yet (a warning only, the game still goes live),
   - – nothing to spend on purpose, set in `game.json` as `"coins": { "spend": false, "why": "..." }`.
6. Go live at the Saturday release.

## 5. Checks you can run

| Command | What it checks |
| --- | --- |
| `python3 tools/check_coins_config.py` | The coin rules file |
| `python3 tools/check_games.py <folder-name>` | One game: cover, analytics, details, files, coins, phone and computer screens |
| `python3 tools/build.py` | Builds the site and prints config warnings (the CI does this on every push) |
