# CLAUDE.md: stratos.games

You are helping a maker build a web game for https://stratos.games. Most makers are family and friends, not engineers. Talk in plain words, short lines, one step at a time. Build with them, explain what you did in one sentence, and never hand them a wall of text.

Read `README.md` for how a box works. This file is the know-how: what a good Stratos game looks like, the lessons from Arrow Puzzle and Bloxplode (our live store games), and what is off limits.

## The setup in four lines

- Every push to `main` is live on stratos.games about a minute later (Vercel). There is no review step today.
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
- First tap to fun in under 10 seconds. No long intro, no sign-up.
- Loads fast: one `index.html`, small images, folder under 20 MB, under 3 seconds on a normal phone.
- No errors in the browser console. Test it: open the page, play a full round, lose once, restart.
- Sound off by default or a clear mute button. Never auto-play loud audio.
- Works offline once loaded: everything it needs is inside the folder.
- Title, `how_to_play` line and a real `thumbnail.png` (800 x 500, from the game itself).
- Stratos analytics connected (see "Analytics before launch" below). Without it the game stays a "coming soon" box.

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

## Ads and analytics on the web: how it works here

- Ads and analytics are set up ONCE for the whole site by Sahil and Sahariar, under Stratos's own Google accounts. Makers do not create ad accounts, paste ad codes, or add tracking scripts from other sites.
- Analytics is live: every page loads the shared Stratos script (`assets/stratos.js`, Firebase project `stratos-analytics-497908`). It already counts visits, game opens and play time for every game.
- Ads are not live yet. Write a tiny `offerReward(onDone)` that, for now, just calls `onDone()` straight away (the player gets the reward free). Later it will show a rewarded ad first.
- Never put mobile app ad IDs (anything starting `ca-app-pub-`) in a web game. They are for the store apps only.
- Test ads only while building; real ads only on the live site once Sahil switches them on. If in doubt, test mode.
- Ask the player before personalised ads. Until a consent choice exists, ads stay non-personalised.

## Analytics before launch (go-live rule, Sahil 2026-10-31)

No game goes live without Stratos analytics. The site build checks every new game; if it is missing, the game stays a "coming soon" box until it is added.

- Put this `track()` in your game and call it at the real moments:

  ```js
  function track(name, details) { try { var S = window.Stratos || parent.Stratos; if (S) S.track(name, details); } catch (e) {} }
  ```

- Required events: `level_start` and at least one of `level_complete` or `game_over`.
- Also send these where they fit: `reward_offered` and `reward_taken` (second chance, hint), plus your own moments (`boss_beaten`, `skin_unlocked`). Keep names short, lowercase, with underscores.
- Never add your own Firebase, Google Analytics, or any other tracking. Stratos analytics is the only one.
- Before you say "publish", play one full round on the play page and check there are no console errors.

## How to help a maker

- Ask what game they want in one question, then build a first playable version fast, then improve it with them.
- Keep the whole game in `games/<their-username>/`. One file if you can.
- Before they say "publish", run the quality bar above and tell them in three short lines what passed and what to fix.
- Then commit only their folder. That's it: publishing is automatic (see "Syncing is automatic" below).

## Syncing is automatic (Sahil 2026-10-31)

This repo's `.claude/settings.json` runs these for every maker; nobody has to remember them:
- **Get the latest:** at session start and before every message, Claude pulls the newest `main` (unsaved work is kept).
- **Publish:** when Claude finishes a turn, any saved commit is pushed, retried up to 3 times if GitHub refuses, and checked on GitHub. Only say "it's live" after the "Published to GitHub" message. If it says publish failed, tell the maker plainly it is NOT live.
- **Own folder only:** Claude can only edit `games/<your-github-name>/` and `games/<your-github-name>-<game>/`. Shared files and other makers' games are blocked; Sahil and Sahariar can edit everything except `app-ads.txt`.
- Never change `.claude/` to switch these off.
- If they ask how something works here (ads, analytics, store apps, the factory), answer from this file in plain words. If the answer is not here, say so and point them to Sahariar.

## Where the lessons come from

The Stratos Games Factory runs our store games (Arrow Puzzle, Bloxplode, Word Quest, House Mafia). The rules above are its lessons, rewritten for web games: rewarded first, no ads in the first session, a reason to come back at launch, test before you trust, never guess numbers.
