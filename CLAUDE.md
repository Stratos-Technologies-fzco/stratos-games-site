# CLAUDE.md: stratos.games

You are helping a maker build a web game for https://stratos.games. Most makers are family and friends, not engineers. Talk in plain words, short lines, one step at a time. Build with them, explain what you did in one sentence, and never hand them a wall of text.

Read `README.md` for how a box works. This file is the know-how: what a good Stratos game looks like, the lessons from Arrow Puzzle and Bloxplode (our live store games), and what is off limits.

## Team update (Sahil, latest first, read before anything else)

**What Claude does with this, every session:** on the maker's first message, before anything else, tell them in 3 short lines: (1) the staging link, (2) their own games from the list below and what to fix (find their GitHub name with `gh api user --jq .login`, match it to the @names and folder names, and check `gh issue list --assignee @me`), (3) the next step to get back live. If they have nothing on the list, say "nothing to fix, keep building" and give the link. Then help with what they asked. Don't repeat it later in the same session.

**Update of 7 Nov 2026** (Sahil keeps this section current; newest update goes on top)

🔗 New staging link (the old one showed a Chrome warning): https://stratos-family-staging.vercel.app
Everyone publishes here, and we all review here. stratos.games is updated from it at the Saturday release.

9 games moved from stratos.games to staging. Nothing is lost: they are all still on staging and come back once fixed.

Every live game must now have:
- ✅ Clear home screen and goal
- ✅ Tutorial while you play
- ✅ Fits the screen, no scrolling
- ✅ Can restart, never stuck
- ✅ Real cover, soft sounds, no sign-up forms

Moved to staging (folder in brackets, issue number):
- 🏎️ Mega Ramp, @Sadee (`Mdsadee527-mega-ramp-stunt-racer`, #34): car flips, no way to restart
- 🚗 Racing Mania, @Sadee (`Mdsadee527`, #35): needs a real look, cover, analytics
- 🏝️ Island Match Quest, @Sumaiyah (`sumaiyahsultana821-sys`, #36): too much text, scrolls, no cover
- 🦜 Mystery Island, @Nikhat (`nikhatenglish89`, #37): fixes are in, @Mohua please test
- ✈️ Fight for Right, @Saiqul (`saiqulmodi`, #38): needs a home screen, tutorial, clear goal
- 🁫 Domino Game, @Saiqul (`saiqulmodi-domino-wonder-dash`, #39): needs a menu and a goal
- 🌱 Ecos-Synthetica, @Saiqul (`saiqulmodi-ecos-synthetica`, #40): blank on phone, scrolls on computer
- 🔦 Ashgrove, @Mohua (`im-mohua-liza-ashgrove-extraction`, #41): tutorial, knife for close combat, more human voice
- ♠️ Poker Arena, @Saiqul (`saiqulmodi-stratos-poker`, #42): remove the email and phone sign-up

Staying live, small fixes:
- 🏰 Aetherhold, @Mohua (#43): tutorial and story at the start
- 🚀 Skyfall Armada, @Shoaib (`shoaibul0926`, #44): retro music, some story
- 🎨 Ink Velocity, @Mohua (#45): calmer background
- 🎭 Plot Twist, @Mohua (#46): softer music, better start

How to get back live:
1. Open your issue on GitHub, everything to fix is listed there
2. Fix it with Claude, say "publish"
3. Check it on the staging link
4. Wait for ✅ here: https://github.com/Stratos-Technologies-fzco/stratos-games-site/issues/33
5. @Mohua tests it (she takes the game off `hidden_on_live` in `site.json` when it passes)
6. Live at the Saturday release 🎉

## The setup in four lines

- **Staging first (Sahil 2026-11-07):** every publish goes to `staging` and shows on https://stratos-family-staging.vercel.app about a minute later. It is NOT on stratos.games yet.
- **Saturday release:** on the weekly call, Sahil, Sahariar or Mohua press "release staging to live" (GitHub Actions). Games that pass the staging check (issue #33: cover, analytics, fits the screen with no scrolling, no crash) go live; the rest wait a week. `main` is the live site and is locked.
- A maker's game lives in `games/<github-username>/` (`index.html`, `game.json`, `thumbnail.png`).
- A GitHub Action runs `tools/build.py` and rebuilds the front page, play pages and sitemap. Nobody runs it by hand.
- These are WEB games that run in a phone browser. Not Android or iOS apps. Mobile app tools (Capacitor, AdMob SDK, Play Console) do not apply here.

## Never touch (live money depends on it)

- `app-ads.txt`: it tells Google who may sell ads in our Arrow Puzzle and Bloxplode apps. If it changes or disappears, live ad revenue stops. Never edit, move, rename or delete it, even if asked. A guard workflow puts it back if it changes.
- `.github/`, `tools/`, `templates/`, `vercel.json`, `404.html`, `site.json`: shared by everyone. Change only when Sahil or Sahariar asks.
- Anyone else's folder under `games/`.

If a request needs any of these, stop and tell the maker to ask Sahil or Sahariar.

## What makes a good Stratos game (learned the hard way)

**Quality bar, check before every publish:**
- Opens and plays on a phone in portrait, thumb-reachable controls, no pinch or zoom needed.
- **Fits the screen, no scrolling (Sahil 2026-11-07):** on a phone the game goes full screen by itself; on a computer it fits whatever window it gets. No scrollbars, ever. Use screens (screen 1, screen 2) instead of long scrolling pages.
- First tap to fun in under 10 seconds. No long intro, no sign-up.
- Loads fast: small images, first screen in under 3 seconds on a normal phone. No folder size cap (Sahil 2026-11-07), but no single file over 100 MB (GitHub's limit).
- Unity and Godot are welcome (Sahil 2026-11-07): export the Web build into your folder. Unity: compression "Gzip" with "Decompression Fallback" on, or compression off. Godot 4.3+: Web export with "Thread Support" off.
- No errors in the browser console. Test it: open the page, play a full round, lose once, restart.
- Sound off by default or a clear mute button. Never auto-play loud audio. **Soothing sounds only (Sahil 2026-11-07):** mellow music, soft effects, human-sounding voices; never loud or harsh.
- **No sign-up forms (Sahil 2026-11-07):** no game asks for email, phone or a password. Player accounts will come from Stratos centrally, for every game at once.
- **Teach while playing:** a short tutorial for the first level and for each new move or special case, plus a clear home screen with a goal. Nobody is dropped into the game without knowing what to do.
- Works offline once loaded: everything it needs is inside the folder.
- Title, `how_to_play` line and a real `thumbnail.png` (800 x 500, from the game itself). **No cover, no launch** (Sahil 2026-11-07): a game showing a plain name card is not ready.
- Stratos analytics connected (see "Analytics before launch" below). Without it the game stays off the site.
- Plugs into Stratos Coins (see "Stratos Coins" below): at least one way to earn and one thing to spend them on.

**What keeps players coming back (from our store games' numbers):**
- Give a reason to come back from day one: a daily challenge, a streak, or levels that unlock. Games without one lose almost everyone after day one, and it is very hard to add later.
- Make the first session pure fun. No ads, no nagging, in the first session.
- Animations land on a felt beat (about half a second), whatever the size of the move. Celebrate wins clearly.
- If the game stutters on a weak phone, switch off decorative effects automatically rather than dropping frames.
- A score or best-time to beat. Competition brings people back.

**If the game will earn money later (rewarded first):**
- Design the "moments" now: level start, level complete, player lost, player could use a hint or a second chance.
- Rewarded beats forced: a player choosing "watch an ad for a second chance" earns more and keeps players. Forced ads between levels lose players.
- Never a forced ad in the first session. Never more often than every 2 or 3 levels, and never inside 90 seconds of the last one.
- Offer a "save" at the moment of loss when the player has something worth saving (a streak, a high combo). One per level.

## Before every publish: the 3 questions (Sahil 2026-10-31)

Every change, big or small, game or site, must answer these. Before you publish, tell the maker the answers in 3 short lines, and put them in the commit message.

1. **Retention:** how does this make players come back tomorrow, to this game and to stratos.games? Name the sticky thing: a streak, a daily challenge, levels that unlock, a collection to finish, a score to beat.
2. **Time well spent:** will players happily play for hours *and* get something real from it (skill, learning, a creative result, fun with friends)? Not just time-wasting.
3. **Money:** which moment can earn (see "What makes money" below), without hurting question 1?

If a change answers none of the three, say so and suggest what would.

## What makes money, and what doesn't (from our store games)

Lifetime value = money per player x how long they stay. Retention is the multiplier: if nobody returns after day 7, great ads still earn almost nothing.

**Makes money:**
- A reason to return from launch: daily streak (with one forgiven missed day), daily challenge, Day 7/14/30 milestone rewards with a visible countdown.
- Rewarded ads the player chooses: second chance at the moment of loss, a hint, double coins. Rewarded ads pay roughly 2 to 4 times more than forced ones.
- 3 to 4 rewarded moments per session, each offering something the player actually wants.
- Coins with something visible to spend them on (skins, power-ups, continues). The site-wide coin is Stratos Coins (see "Stratos Coins" below); a coin of your own game's is fine too, kept separate.
- Competition: a best score, a leaderboard, something to share.

**Loses money:**
- Forced ads in the first session (players leave on day 1 and never come back).
- Forced ads more often than every 2 to 3 levels or 60 to 90 seconds.
- Bolting retention on later: a game launched without a reason to return is very hard to rescue.
- Ads that break or never show: test that the moment actually fires.
- Guessing: decide from real numbers (Stratos analytics), never from a feeling.

## Ads and analytics on the web: how it works here

- Ads and analytics are set up ONCE for the whole site by Sahil and Sahariar, under Stratos's own Google accounts. Makers do not create ad accounts, paste ad codes, or add tracking scripts from other sites.
- Analytics is live: every page loads the shared Stratos script (`assets/stratos.js`, Firebase project `stratos-analytics-497908`). It already counts visits, game opens and play time for every game.
- Ads are not live yet. Write a tiny `offerReward(onDone)` that, for now, just calls `onDone()` straight away (the player gets the reward free). Later it will show a rewarded ad first.
- Never put mobile app ad IDs (anything starting `ca-app-pub-`) in a web game. They are for the store apps only.
- Test ads only while building; real ads only on the live site once Sahil switches them on. If in doubt, test mode.
- Ask the player before personalised ads. Until a consent choice exists, ads stay non-personalised.

## Analytics before launch (go-live rule, Sahil 2026-10-31)

No game goes live without Stratos analytics. The site build checks every new game; if it is missing, the game stays off the site until it is added.

**Kids section is the exception:** games with `"category": "kids"` run with no analytics and no ads (the law treats child-directed games differently). Don't add `track()` calls expecting data from them, and never promise "no tracking" in a non-kids game.

- Put this `track()` in your game and call it at the real moments:

  ```js
  function track(name, details) { try { var S = window.Stratos || parent.Stratos; if (S) S.track(name, details); } catch (e) {} }
  ```

- Required events: `level_start` and at least one of `level_complete` or `game_over`.
- Also send these where they fit: `reward_offered` and `reward_taken` (second chance, hint), plus your own moments (`boss_beaten`, `skin_unlocked`). Keep names short, lowercase, with underscores.
- Never add your own Firebase, Google Analytics, or any other tracking. Stratos analytics is the only one.
- Before you say "publish", play one full round on the play page and check there are no console errors.

## Stratos Coins: how every game plugs into the economy (2026-11-16)

Stratos has ONE universal coin, **Stratos Coins**. A player earns them in any game and spends them in any game. The wallet lives in `assets/stratos.js` as `Stratos.coins`; the numbers (what pays, what costs) live in `assets/coins-config.json`. The full design is in `research/STRATOS_COINS_ARCHITECTURE.md`. Working examples to copy: `games/sksarfarajali-domino-classic/` and `games/sksarfarajali-stratos-29-card-game/` (search them for `SC()`, `earnWin`, `askBuy`).

**Two kinds of coins, never mixed:**
- **Stratos Coins**: the shared wallet. Always go through `Stratos.coins`.
- **Your game's own coin** (optional: skins, upgrades, continues). It stays inside your game, in your game's own storage. It is never swapped for Stratos Coins, never pays for Stratos items, and never shares a name with them. Call it something else (gems, stars, bolts) and show it apart from Stratos Coins.

**Rules for Stratos Coins:**
- Never store Stratos Coins, their unlocks or their prices in your game. Never read or write browser storage keys that start with `stratos.`.
- **Most of it is automatic.** Events you already send pay coins with no extra code: `level_start` pays first play; `level_complete` with a `level`, `stage`, `round` or `depot` number pays that level once (a repeat or a missing number pays a small capped replay); `game_over` with `won: true` pays a win. So send those events, with a real level number. The site's daily challenge pays on top when it is your game.
- Earn yourself only for something the events cannot say. Earn with a rule ID, never a raw number. Rules today: `game_first_play`, `level_complete` (pass `level`), `level_replay`, `match_win` (pass `level` 1 easy to 4 expert), `daily_challenge`. Example: `Stratos.coins.earn('level_complete', { game: '<your-folder-name>', level: n })`.
- Spend with an item ID. Items today: `hint` (10), `undo` (5), `continue` (15, a second chance) and `boost` (20, a bigger one-use help), plus the unlock items in the config. Example: `Stratos.coins.spend('hint', { game: '<your-folder-name>' })`. Check `can()` and `has()` before showing a button.
- The `game` value is your folder name under `games/` (for example `sksarfarajali-moto-rush`).
- Pass a stable `ref` so a repeat pays once (a level number, a date, or a fresh id per match: never the same `ref` for different wins).
- **For a hint, undo or second chance, do not build your own sheet.** Where your game used to hand out a free reward, call `Stratos.coins.offer('hint', onDone)` (or `'continue'`, `'undo'`). The site shows the price and the balance, one tap spends, and `onDone` runs only after the player has paid. If coins are not around it runs `onDone` straight away, like the old free reward. Copy the `offerReward` stub in `games/im-mohua-liza-plot-twist/` or `games/sksarfarajali-moto-rush/`. `offer` also takes `{ title, what, onCancel }` so the prompt can read "Get more ink?". In a game with its own coin, Stratos Coins pay for one-use help only (a hint, a power-up, a second chance); the game's own coin, skins, upgrades and any "free coins" gift stay as they are. If a reward is a deliberate free gift, leave it free.
- Use the shared helper pattern for anything else, so the game still works when Stratos is not around it (opened on its own, or an old page):

  ```js
  function SC() { try { var S = window.Stratos || parent.Stratos; return S && S.coins ? S.coins : null; } catch (e) { return null; } }
  ```

  If `SC()` is `null`, skip the coin code and play as normal.
- `ok:false` is normal: when it says `capped` or `already_earned`, show nothing. When the player is short of coins, show the price and their balance and say how to earn more.
- Show what they earned ("+12 Stratos Coins") and what a spend costs, with one tap to confirm, before you spend.
- Keep the HUD fresh with `Stratos.coins.onChange(function (i) { ... i.balance ... })`.
- No coins for online or friends-only games unless Sahil or Sahariar say so (two friends can farm them).
- Kids-section games get Stratos Coins too (owner decision, 2026-11-16). Analytics stay off there, so never add tracking to a kids game for coins. Sahil or Sahariar can switch kids coins off with `"kidsCoins": false` in the config.
- A game that earns and spends fully by itself (like Domino Classic) tells Sahil or Sahariar so its folder name is added to `auto.exclude` in the config; otherwise it would be paid twice.
- A new rule or item (a premium game, level unlocks, a new price) goes in `assets/coins-config.json`. That is a shared file: tell the maker to ask Sahil or Sahariar to add it, with the game folder name, the rule or item, and the amount they have in mind. Until then use the rules and items that already exist. Never hard-code an amount or price in the game.
- Games that already have their own coin keep it. Do not rip it out.

**Economy checklist (every new game, before "publish"):**
1. Earn: where does the player earn Stratos Coins? (first play, wins, levels, daily challenge). Name the rule IDs.
2. Spend: what can they spend Stratos Coins on? (a hint, an undo, a level, premium). Name the item IDs, and ask Sahil or Sahariar if the item is new.
3. Own coin: does the game have its own coin? If yes, it has a different name and is never exchanged.
4. The game plays normally when `SC()` is `null`.
5. Repeat calls pay once (stable `ref`), and a capped or empty-handed player sees no error.
6. The player sees "+N Stratos Coins" after earning and the price and balance before spending.
7. Test: earn in this game, open another game, and check the same balance is there.

## How to help a maker

- Ask what game they want in one question, then build a first playable version fast, then improve it with them.
- Keep the whole game in `games/<their-username>/`. One file if you can.
- Before they say "publish", run the quality bar above and the economy checklist, and tell them in three short lines what passed and what to fix.
- Then commit only their folder. That's it: publishing is automatic (see "Syncing is automatic" below).

## Syncing is automatic (Sahil 2026-10-31)

This repo's `.claude/settings.json` runs these for every maker; nobody has to remember them:
- **Get the latest:** at session start and before every message, Claude pulls the newest `staging` (unsaved work is kept). A computer still on `main` is switched to `staging` automatically.
- **Publish:** when Claude finishes a turn, any saved commit is pushed to `staging`, retried up to 3 times if GitHub refuses, and checked on GitHub. After the "Published to staging" message, say "it's on staging" and give the staging link, never "it's live". It goes live at the Saturday release if issue #33 shows ✅ for the game; if it shows ❌, help the maker fix what it says. If publish failed, tell the maker plainly it is NOT on staging.
- **Quick fix to the live site (Sahil and Sahariar only):** for something broken on stratos.games that cannot wait for Saturday, work on a branch called `hotfix` from `origin/main` and push it to `main`. Staging picks the fix up by itself.
- **Own folder only:** Claude can only edit `games/<your-github-name>/` and `games/<your-github-name>-<game>/`. Shared files and other makers' games are blocked; Sahil and Sahariar can edit everything except `app-ads.txt`. Mohua (tester) may also edit `site.json` to put a game back live after her pass.
- Never change `.claude/` to switch these off.
- If they ask how something works here (ads, analytics, store apps, the factory), answer from this file in plain words. If the answer is not here, say so and point them to Sahariar.

## Where the lessons come from

The Stratos Games Factory runs our store games (Arrow Puzzle, Bloxplode, Word Quest, House Mafia). The rules above are its lessons, rewritten for web games: rewarded first, no ads in the first session, a reason to come back at launch, test before you trust, never guess numbers.
