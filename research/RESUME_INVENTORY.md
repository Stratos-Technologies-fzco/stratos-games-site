# Resume inventory: what each game saves today (2026-11-17)

How to read this. A scan of every game's code for what it stores on the device (`localStorage`, `IndexedDB`) and for resume-like code, then a closer read of the save code of the games that looked most likely to resume. **Verified** = I read the save and the restore code. **Likely** = a storage key for progress exists but I did not read how far it goes. **Unknown** = not checked (minified, compiled or no source). Please correct any row; the makers know their games best.

The shared layer is `Stratos.resume` (see `research/RESUME_DESIGN.md`). "Aim" is the most useful thing to resume for that kind of game:

- **Match**: a game in progress (scores, hands, whose turn).
- **Board**: the current level or board, exactly where the player stopped.
- **Level start / checkpoint**: restart the current level or the last checkpoint, not the exact moment.
- **None**: not meaningful (a half-finished endless run, an online game).

| Game (folder) | Saves today | Resumes mid-play today? | Aim | Effort |
| --- | --- | --- | --- | --- |
| Domino Classic (`sksarfarajali-domino-classic`) | Name, stats, settings, **the match in progress** | **Yes, pilot 2026-11-17**: saved every turn and between rounds, offered when the game opens (offline matches only) | Match: done | Done |
| Stratos 29 Card Game (`sksarfarajali-stratos-29-card-game`) | Settings, stats, daily deal, online reconnect info | No mid-match (online has a reconnect path) | Match | Medium |
| Wordbloom (`im-mohua-liza-wordbloom`) | Whole progress, words found in the current level, **which level is open** | **Yes, pilot 2026-11-17**: the game's own save keeps the board, the shared layer remembers the open level or daily puzzle and offers to continue | Board: done | Done |
| Babel Harbour (`sksarfarajali-babel-harbour`) | Progress, round in progress | **Yes (verified)**: `persistRound` and `restoreRound` | Board: already done, add the shared prompt | Small |
| Ashgrove Extraction (`im-mohua-liza-ashgrove-extraction`) | Checkpoint, tutorial | **Yes (verified)**: checkpoint and a "Continue" button | Checkpoint: already done | Small |
| Aetherhold (`im-mohua-liza-aetherhold`) | The whole kingdom, saved on every action | **Yes (verified)**: the game state is the save | Match/board: already done | Small |
| BrainRush Daily (`sksarfarajali-brainrush`) | Sessions, practice, settings | **Yes (verified)**: a daily session resumes with its answered puzzles | Board: already done | Small |
| Dino Frontier (`sksarfarajali-dino-frontier`) | Whole save (IndexedDB with a localStorage backup) | Save game yes, a run in progress no | Level start: resume the expedition at its start | Medium |
| Echo Island (`sksarfarajali`, Kids) | Settings (IndexedDB) | Likely: resume and Continue code present | Checkpoint | Check first |
| Mystery Island (`nikhatenglish89`, Kids) | IndexedDB | Likely: resume code present in the mini-games | Board | Check first |
| Ecos-Synthetica (`saiqulmodi-ecos-synthetica`, Kids) | Profiles, progress, language | Likely: progress saved, mid-play unknown | Board | Check first |
| Crystal Quest (`nikhatenglish89-crystal-quest`) | Progress, boosters, coins, stats | Likely progress only | Board: board, moves left, goals | Medium |
| Island Match Quest (`sumaiyahsultana821-sys`) | Unlocked islands, stars, wallet | Progress only | Level start (a memory board is hard to resume exactly) | Medium |
| Plot Twist (`im-mohua-liza-plot-twist`) | Progress, streak | Likely progress only | Level start | Small |
| Magic Shot (`im-mohua-liza`) | Unknown (minified) | Unknown | Board: bottle state | Check first |
| Ink Velocity (`im-mohua-liza-ink-velocity`) | Progress | Likely progress only | Board: the strokes drawn in a level | Medium |
| Bridge Genius (`saiqulmodi-bridge-genius`, Kids), Failspan (`saiqulmodi-failspan`, Kids) | Level progress | Likely progress only | Board: the design in progress | Medium |
| Mega Ramp (`Mdsadee527-mega-ramp-stunt-racer`) | Stars and progress | Progress only | Level start | Small (after the open fixes) |
| Moto Rush (`sksarfarajali-moto-rush`) | Garage, progress, best | Progress only | None for a run; resume at the menu | Not needed |
| Toot Raft (`tamannamody`) | Progress | Progress only (a checkpoint exists inside a run) | Checkpoint | Medium |
| Fighter (`saiqulmodi`) | Mission progress, coach | Progress only | Level start (compiled build) | Needs source |
| SkyForge (`saiqulmodi-skyforge`) | Stars, missions, quality | Progress only | None (a flight) or the mission start | Not needed |
| Cargo Climb (`im-mohua-liza-cargo-climb`) | Bank, best, car, daily | Progress only | None (endless runs) | Not needed |
| Racing Mania (`Mdsadee527`), Momo Run (`im-mohua-liza-momo-run`), Skyfall Armada (`shoaibul0926`), Zest Strike (`im-mohua-liza-zest-strike`), Stratos Drop Zone (`sksarfarajali-stratos-drop-zone`) | Best score, name, settings | No | None: a half-finished run is not meaningful | Not needed |
| Chroma Clash (`im-mohua-liza-chroma-clash`) | Nothing found | No | Match: a round | Check first |
| Stratos Poker Arena (`saiqulmodi-stratos-poker`) | Nothing (server) | No | None: online | Not possible |
| Arrow Rush (`mody-sahariar1`), Domino Game (`saiqulmodi-domino-wonder-dash`, Kids) | Nothing found (compiled / Python) | Unknown | Board | Needs source |

**Summary.** 5 games already resume mid-play, verified in their code (Wordbloom, Babel Harbour, Ashgrove, Aetherhold, BrainRush), and 2 more look like it (Echo Island, Mystery Island). About 10 are good candidates for a board or match resume, 5 are endless runs where it is not meaningful, and a few need their source or a closer look first.

**Pilots done (2026-11-17):** Domino Classic (a match) and Wordbloom (a board that already saved). **Suggested order for the rest.** (1) The board games that save progress today. (2) Checkpoint games. (3) Source-less builds when the source arrives.

## Rollout status (2026-11-17, every game looked at)

**Resume added with the shared prompt, tested in a real browser (12 games):** Domino Classic, Wordbloom, Stratos 29 Card Game, Plot Twist, Ink Velocity, Crystal Quest, Chroma Clash, Island Match Quest, BridgeWorks Campus, Failspan, Moto Rush (the ride in progress, same road, standing start) and Stratos Drop Zone (the solo match after landing: island, loot and bots rebuilt from the seed, then positions, health, weapons, loot taken and storm clock applied; grenades, smoke and barriers in the air and the plane flight are not saved).

**Continue on their own, recorded in game.json as `"resume": {"native": true}` (8):** Babel Harbour, Ashgrove Extraction, Aetherhold, BrainRush Daily, Mystery Island, Ecos-Synthetica, Dino Frontier, Echo Island. The shared prompt would only duplicate their own Continue.

**Not meaningful, recorded as `"supported": false` with a reason (9):** Cargo Climb, Momo Run, Zest Strike, Racing Mania, Skyfall Armada, SkyForge, Mega Ramp, Stratos Poker Arena, The Missing Minute (a coming-soon page). (Moto Rush and Stratos Drop Zone were on this list first, and moved to the shared prompt on the maker's request; Drop Zone's first reason, an online match, was wrong: it is an offline solo game.)

**Cannot be done without the source (5):** Magic Shot and Toot Raft (minified), Fighter (compiled), Arrow Rush (compiled), Domino Game (zipped build). These stay unmarked; the check shows a dash for them. When the makers share the source, the pattern in `CLAUDE.md` applies.
