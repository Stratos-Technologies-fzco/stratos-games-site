# Crystal Sets: findings and plan

Written before the change. Status at the end of each section is updated when the step is done.

## 1. How the game draws crystals today (findings)

The game is one static folder (`games/nikhatenglish89-crystal-quest/`), plain HTML, CSS and JavaScript. There is no Phaser, no build step and no atlas.

| Where | What it does today |
|---|---|
| `js/engine.js` | The rules. A crystal is `{id, color 0-5, sp}`. It knows six colours as numbers and never mentions pictures. **This stays as it is.** |
| `js/levels.js` | 100 levels built from rules (`build(world, lv)`), plus `daily(date)`. Levels are plain JSON objects. |
| `js/game.js` `crystalSrc(n)` | One function maps a colour number to `assets/crystals/crystal_0X_<name>.svg`. It is used in: `look()` (every tile on the board), `objInfo()` (goal chips on the level intro and in the HUD), the win screen goal chips (none yet), and the splash preload. |
| `js/game.js` `look()` | Sets the tile image and, for specials, the glow colour. |
| Menus, map, shop, collection | Use the UI icons (`icon_*.svg`), not gems. |
| Saves | `localStorage` key `cq_save_v1` (`save` object). Old saves must keep working. |

Deployed staging page: https://stratos-family-staging.vercel.app/games/nikhatenglish89-crystal-quest/

## 2. What the brief asks for, and how it fits this game

| Brief | In this game |
|---|---|
| Engine knows colours only; `textureKey(gemType, setId)` in the render layer | The engine is untouched. New `js/sets.js` holds `textureKey` and `gemSrc`. A test proves the engine file never mentions sets and gives identical results with every set id. |
| `crystalSet` on the level JSON; validator; defaults | `levels.js` writes `crystalSet` on every level. `validateLevel()` in `sets.js` accepts levels without it and rejects unknown ids. `LEVEL_SET_OVERRIDES` in `levels.js` overrides one level. |
| Variety rules | Levels 1-4 and 6-9, 11-14, 16-19: the world's set. Levels 5, 10, 15: guest set (previous world's set, world 1 uses Forest Leaves) with a "Guest gems!" banner. Boss levels: the world's set plus a boss-colour glow around the board. Daily Puzzle: a set chosen from the date. No set changes mid-level. |
| WebP atlas per set, built at build time | **Not possible here.** `tools/` is shared and nobody runs a build for a game folder. Each set is six small SVGs (about 80 KB). They are loaded the first time a level or its intro needs them and cached. The next level's set is preloaded while the intro is open. Only the classic set is loaded at the start. |
| Specials keep their art; thin rim in the set's rim colour | Rim colours come from the generator script (they are not in `crystal_sets.json`), so they are kept in `sets.js`. A thin ring in that colour is drawn around special crystals. |
| HUD and screens show the active set's gems | Goal chips (intro, HUD, win screen) and the starter-booster picker use the active set. Menus, map and shop keep classic icons. |
| Readability | Silhouette test (rendered alpha masks) for every set. Settings option "Gem style": Themed or Classic. |
| Gem Collection screen | Reachable from Profile. A set unlocks when the player first starts a level in its world. Saved in the progress. |
| Fallback | If a set fails to load, the tile falls back to the classic gem and a warning is logged. |
| Do not change rules, boards, goals, economy | Not changed. |

## 3. Things that do not apply, and why

- **Phaser textures and "destroy unused textures":** the game uses image elements. The browser frees them. We check that only the needed set is requested.
- **Playwright:** not installed here. The same checks run in headless Chrome through a small script (`tests/` documents them).
- **Server-side replay verification:** there is no server.

## 4. Step list (small commits)

1. Schema and data: `sets.js`, `crystalSet` on levels, validator, tests.
2. Texture loading and rendering: lazy loading, preload, fallback, tiles, goal chips, specials rim, boss glow, guest banner.
3. Settings (Gem style) and the Gem Collection screen, Hindi text.
4. Tests: silhouettes, one board per set in screenshots, per-world checks, setting persistence, network requests.
5. Docs: inventory, how to add a set, level schema.
