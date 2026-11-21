# Review note: STRATOS FARM — MY DREAM VILLAGE

Maker: Nikhat Sultana (`nikhatenglish89`). Folder: `games/nikhatenglish89-stratos-farm/`. Branch: `staging`. Category: `adventure`.

## What it is
A cosy single-player farming game: plant and harvest crops (16), keep animals (9 kinds), run factories (8) that turn produce into goods, deliver neighbour orders, finish quests, buy land (27 lots), clear and move rocks and trees, decorate. Phaser 3 + React + TypeScript; the whole farm saves on the device (no server, no accounts).

## Site rules, and where each is met
- Stratos Coins: `Stratos.track` with `level_start` / `level_complete` (levels), `Stratos.coins.offer` for the paid speed-up (20) and hint (10). The literal call text the site build looks for is in `src/game/stratos.ts`; a test (`tests/perf.test.ts`) copies the build's rule so it cannot silently break.
- Resume: native (saved after every action, Continue button; crops, animals and factories carry on while closed).
- Sound is off by default and not downloaded until turned on. First load 2.9 MB raw.
- About, How to play, Tips, controls and FAQ are in `game.json` and in the game.
- Cover (`thumbnail.png`) and 6 s hover clip (`preview.mp4`) are recorded from the real game.

## How to try it (5 minutes)
1. Play, tap a brown field, pick wheat, tap fields to plant, wait about two minutes, then tap the ripe crops.
2. Shop > Animals: build a Chicken Coop on a spot you tapped first (double-click it), feed it (Feed Mill makes feed).
3. Market: deliver an order. Items: sell some goods.
4. Move things: tap a lamp post > Move it, or hold on anything for half a second and drag.
5. Pop-ups open on the left so the farm stays visible; none of them scroll.

## Tests
Vitest 144 (rules, economy, saves, layout, site-rule copy) and Playwright 34 (full play-through, pop-ups at five screen sizes, moving things, Stratos wallet inside the real site wrapper). `python tools/check_games.py nikhatenglish89-stratos-farm` says "goes live".

## Known limits (honest list)
- Single-player only; saved data can be edited by the player on their own device (see `docs/SECURITY_REVIEW.md`). The social screens say plainly that neighbours need Stratos accounts.
- Touch (finger, pinch) is covered by desktop emulation only; no real-phone test yet.
- No sound files are shipped until the player turns sound on; sound effects are minimal.
- Smallest screens (about 360 px wide) shrink pop-ups to fit, so text there is small.

## Not done on purpose
- Farmhouse/barn upgrades and storage limits (removed the "soon" button rather than leave a fake one).
- Nothing was pushed to `main`.
