# Category: Adventure (done)

**Status (2026-11-19): DONE.** Sarfaraj added the Adventure category to the site (commit `23a5631`, "Add Adventure game category"). This file is kept as the record of what was asked and what the game side changed.

# Original request: add an "Adventure" category to stratos.games

**For: Sahil, Sahariar or Sarfaraj** (only they may change `site.json` and `tools/build.py`).
**From: Nikhat Sultana (@nikhatenglish89), maker of STRATOS FARM - MY DREAM VILLAGE**

`games/nikhatenglish89-stratos-farm/game.json` now says `"category": "adventure"`, but the site has no such category yet. Until it exists,
`tools/build.py` (line 138) quietly files the game under **Arcade**. Please add the category, then the game appears on its own shelf.

## 1. `site.json`, new entry in `categories` (suggested values)
```json
{
  "id": "adventure",
  "label": "Adventure",
  "icon": "star",
  "mood": "Explore, build, discover",
  "color": "#2FB36B",
  "emoji": "\ud83e\udded",
  "hue": 150,
  "intro": "Games with a world to explore and grow: build, collect, meet characters and unlock something new every time you play. Every game runs in your browser and fits a phone screen."
}
```
`icon` falls back to a star if the name is unknown, so nothing breaks. Optional: add a compass drawing to the `ICONS` list in `tools/build.py`
and use `"icon": "compass"`:
`"compass": '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/>'`

## 2. What changes for this game (already done on the game side)
- A non-kids game needs Stratos analytics: it already reports `level_start` and `level_complete` (with the level number), plus `reward_offered`,
  `reward_taken`, `order_delivered`, `building_placed`, `land_cleared`, `quest_claimed`, `tutorial_done`.
- The site stops treating it as a kids game: analytics are on, ads can be switched on later (none exist now, and the game has no ad code).
- Stratos Coins are unchanged (earn on first play and each new level; spend on Speed-up and Hint).
- The game page text does not make any "no tracking" promise.

## 3. Check after the change
`python tools/check_games.py nikhatenglish89-stratos-farm` (set `PYTHONUTF8=1` on Windows): the "analytics" column should show a tick, and the
game should be on `/c/adventure/`.
