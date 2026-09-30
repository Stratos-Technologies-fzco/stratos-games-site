# Mystery_Island

Mystery_Island is a child-friendly HTML5 adventure game in which players explore islands, solve educational mini-games, collect rewards and unlock a treasure story. The game is designed as a browser application that can be hosted through an existing WordPress website. Core gameplay must not depend on a backend, database server or paid API.

This repository contains the complete MVP v1.0 described in `docs/` (PRD and App Flow, rev 1.1).

## What's in the game

| | |
|---|---|
| Worlds | Pirate Beach → Mystery Jungle → Crystal Cave → Ancient Temple → Treasure Island |
| Levels | 50 (10 per world), each with its own settings for 3 age bands = 150 question sets |
| Age bands | Explorer (6–7), Adventurer (8–9), Master Explorer (10–12) |
| Mini-game engines | Number Challenge, Word Builder, Memory Sequence, Pattern Puzzle, Object Hunt, Maze / Compass / Map-reading, Science Choice (quiz + put-in-order), Spot the Difference |
| Rewards | Stars (1–3 per level, based on mistakes + hints; replay to improve), coins (Camp items), gems (world completion + achievements), 4 map pieces |
| Explorer Camp | 41 cosmetic items: hats, outfits, pets, camp decorations |
| Achievements | 29 |
| Profiles | Up to 3 per device: nickname, age band and avatar only |
| Companion | Kiki the parrot (voice + question read-aloud) |
| Parent Area | Hold-button + number gate; per-explorer progress, challenge accuracy, play time; change difficulty; analytics switch; reset one explorer or everything |
| Saving | IndexedDB (falls back to localStorage; warns clearly if the browser blocks storage). Checkpoint after every challenge, so a refresh resumes the level |
| Offline (optional) | Service worker caches the game after the first online visit |
| Backend / API / cookies | None |

Worlds unlock in order: finishing all 10 levels of a world (any star count) awards its map piece and opens the next world. Treasure Island needs all four map pieces and adds geography: compass directions, map reading and world knowledge.

## Project layout

```
game/                     ← the whole game: static files, no build step
  index.html
  css/                    base, map, game, responsive
  js/
    app.js router.js state.js storage.js player.js rewards.js
    audio.js analytics.js content.js ui.js rng.js
    screens/              splash, profiles, setup, tutorial, map, world,
                          level, camp, achievements, settings, parent
    minigames/            framework (index.js) + the 8 engines
  data/                   ALL content and text (JSON)
    levels.json           generated from tools/generate-levels.mjs
    questions.json        word lists, quiz banks, word problems, hunt sets
    rewards.json          coin rules, avatars, Camp items
    achievements.json
    dialogue.json         every child-facing sentence (for translation)
    config.json           analytics + offline switches
  assets/                 icon; put recorded voice clips in assets/audio/voice/en/
  manifest.webmanifest
  service-worker.js
tools/
  generate-levels.mjs     edit level tables here, then `npm run generate`
  smoke-test.mjs          browser robot that plays all 50 levels
tests/content.test.mjs    checks every level builds valid rounds in all bands
docs/                     PRD + App Flow
```

## Run it locally

Any static web server works (the game loads JSON with `fetch`, so opening `index.html` straight from disk won't work).

```bash
npm start            # serves game/ at http://localhost:8080
# or: cd game && python3 -m http.server 8080
```

## Deploy on WordPress hosting

The game is a self-contained static folder. WordPress only needs to link to it; no plugin is involved and WordPress never runs game logic.

1. Upload the **contents** of `game/` to your hosting, e.g. into `public_html/games/mystery-island/` (via the host's File Manager, SFTP, or a zip: `npm run package` creates `dist/mystery-island.zip`).
2. Visit `https://yourdomain.com/games/mystery-island/` to check it loads.
3. In WordPress, add a **PLAY MYSTERY ISLAND** button (Button block) linking to that URL. Direct/full-screen navigation is preferred. If you'd rather embed it, use a Custom HTML block:
   ```html
   <iframe src="/games/mystery-island/" style="width:100%;height:90vh;border:0" allow="autoplay; fullscreen" title="Mystery Island"></iframe>
   ```
4. Make sure the server sends `.json` as `application/json` and `.webmanifest` as `application/manifest+json` (standard on Apache/Nginx hosts).
5. After updating game files, bump `VERSION` in `game/service-worker.js` so returning players get the new version.

### Optional: anonymous usage counts

Off by default. To measure the PRD success metrics, install Matomo on the same hosting in cookieless mode, then in `game/data/config.json` set `analytics.enabled` to `true` and `analytics.endpoint` to your `…/matomo.php` URL. Only event names and level/world ids are sent: no nickname, cookies or device id. The game respects Do Not Track, parents can switch it off in the Parent Area, and blocked or failed requests never affect play.

### Optional: recorded voice

Kiki and the question read-aloud use the device's built-in English voice. To use recorded clips, add MP3s to `game/assets/audio/voice/en/` and list them in `voiceFiles` in `game/data/dialogue.json` (e.g. `"tutorial-0": "assets/audio/voice/en/tutorial-0.mp3"`). Audio only starts after the first tap, as browsers require.

## Adding content

- **Questions/words**: edit `game/data/questions.json`.
- **Levels**: edit the tables in `tools/generate-levels.mjs`, then `npm run generate`.
- **Text / new language**: every child-facing string is in `game/data/dialogue.json` (plus names and questions in the other JSON files).
- Run `npm test` afterwards. It builds every level in every band with many random seeds and checks that the answers are valid.

## Tests

```bash
npm test                 # content tests (Node 18+)
npm run smoke            # plays all 50 levels in a real browser (needs Playwright + Chromium)
BAND=2 npm run smoke     # another age band
```

## Notes

- Game name is **Mystery Island**; the final world keeps the name **Treasure Island** from the PRD.
- All rewards are virtual and can never be bought.
- Profiles store only a nickname, age band and avatar. There are no external links, chat, ads or leaderboards.
