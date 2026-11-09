# Level data (JSON)

Levels are built by rules in `js/levels.js` (`build(world, levelNumber)`) and are plain objects, so they can also be written by hand. `Sets.validateLevel(level)` in `js/sets.js` checks the gem set field.

```json
{
  "id": 21,
  "world": 2,
  "num": 1,
  "type": "collect",
  "rows": 8, "cols": 8,
  "colors": 5,
  "moves": 30,
  "holes": [[0, 0]],
  "blockers": [{ "r": 3, "c": 4, "kind": "ice", "hp": 2 }],
  "objectives": [{ "type": "collect", "color": 1, "n": 24 }],
  "stars": [0, 3100, 5300],
  "crystalSet": "set_02_frozen_shards",
  "guest": false,
  "tip": null
}
```

| Field | Meaning |
|---|---|
| `id`, `world`, `num` | level 1-100, world 1-5, number 1-20 inside the world |
| `type` | `collect`, `blockers`, `score`, `mixed`, `time`, `treasure`, `rescue`, `path`, `restore`, `energy`, `portal`, `boss` |
| `rows`, `cols`, `colors` | board size and how many of the six gem colours appear (4-6) |
| `moves` | moves allowed (a Time Challenge uses `time` instead) |
| `time` | optional, seconds, makes it a Time Challenge |
| `items` | optional, number of treasure chests that start at the top |
| `holes`, `blockers` | board shape and blockers (`kind` as in `engine.js`, optional `hp`) |
| `objectives` | goals: `collect {color, n}`, `blockers {kind, n}`, `score {n}`, `boss`, `treasure {n}`, `rescue {n}`, `path {n}`, `restore {n}`, `energy {n}`, `portal {n}` |
| `stars` | score needed for 1, 2 and 3 stars (`[0, two, three]`, measured by `tests/stars.js --write`) |
| `boss` | optional `{name, art, hp, every, count}` for boss levels |
| **`crystalSet`** | **optional.** One of the set ids in `js/sets.js`. If it is missing the default rules apply (world set, guest set on levels 5, 10, 15). Old level files without it stay valid. An unknown id is reported by `validateLevel` and the game falls back to the classic gems |
| `guest` | set by the rules on guest levels (5, 10, 15) so the intro shows the "Guest gems!" banner. Not set when a level has its own override |
| `tip` | key of a short lesson shown once |

The engine reads only the board, blockers, objectives, moves and time. `crystalSet`, `guest` and `stars` are never used for the rules (stars are only read after a win).
