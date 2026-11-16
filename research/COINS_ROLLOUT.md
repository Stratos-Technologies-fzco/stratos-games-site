# Stratos Coins roll-out (phase 6), 2026-11-16

Every game on stratos.games is covered. Two layers do the work:

1. **Automatic (all games, no edits to the game).** `assets/stratos.js` turns the events a game already sends into coins:
   - `level_start` / `game_start` pays **first play** (+20, once per game). Games that send no start event get it after 15 seconds on the play page.
   - `level_complete` with a `level`, `stage`, `round` or `depot` number pays the **level** rule (10 / 15 / 20 by level, once per level). Without a number, or on a repeat, it pays a **replay** (+2, up to 5 a day per game).
   - `game_over` pays a **win** (+5) only when the game says `won:true`. A plain `game_over` is a loss and pays nothing.
   - If the site's **daily challenge** is this game, any of the above also pays +30 once that day. The **streak bonus** is added on the first earn of a day.
   - Caps always apply: 100 coins a day per game, 200 a day in total.
2. **Spend prompt (games with a free-help moment).** The game calls `Stratos.coins.offer('hint' | 'continue' | 'undo', onDone)`. The site shows the price and the balance, one tap spends, and `onDone` runs only after payment. With no coins around it behaves like the old free reward.

Kids-section games get coins too (owner decision, 2026-11-16). Analytics stay off there, so no coin event leaves the device. One line turns it off: `"kidsCoins": false` in `assets/coins-config.json`.

Games with their own coin (Wordbloom, Crystal Quest, Moto Rush, Cargo Climb, Island Match Quest) keep it. Stratos Coins are separate and never exchanged.

| Game (folder) | Earn | Spend Stratos Coins on | Notes |
| --- | --- | --- | --- |
| Domino Classic (`sksarfarajali-domino-classic`) | Native: first play, match wins by computer level, daily | Hint, undo (native sheet) | Phase 4 pilot. Excluded from automatic earn. |
| Stratos 29 Card Game (`sksarfarajali-stratos-29-card-game`) | Native: first play, match wins by AI level, daily deal | Hint after the free one (native sheet) | Phase 4 pilot. Excluded from automatic earn. |
| Moto Rush (`sksarfarajali-moto-rush`) | Auto: first play; km milestones pay replay coins | Second chance (continue) | Keeps its own coin. |
| Plot Twist (`im-mohua-liza-plot-twist`) | Auto: first play, levels | Hint after the free ones, second chance after losing | Message "Free hint!" reworded to "Hint!". |
| Aetherhold (`im-mohua-liza-aetherhold`) | Auto: first play, stages | Rally (revive fallen troops) as continue | |
| Cargo Climb (`im-mohua-liza-cargo-climb`) | Auto: first play, depots | Second chance (revive) | Keeps its own coin. |
| Skyfall Armada (`shoaibul0926`) | Auto: first play, waves | Second chance | |
| Island Match Quest (`sumaiyahsultana821-sys`) | Auto: first play, levels | Second chance, and a power-up when out | The once-per-island free power-up stays free; Stratos Coins appear as an extra button. Keeps its own coin. |
| Toot Raft (`tamannamody`) | Auto: first play only (sends `level_start` only) | Continue the run | Add `level_complete` tracking to pay more. |
| Wordbloom (`im-mohua-liza-wordbloom`) | Auto: first play, levels | Hint, Spark and Bloom when out of its own coins: 20 Stratos Coins (power-up) or 10 (hint) | Own coin economy kept. Stratos Coins replace the free "watch an ad" for help only; the "double coins" ad slot stays. |
| Crystal Quest (`nikhatenglish89-crystal-quest`) | Auto: first play, levels | Second chance, and boosters when out | Own coin economy kept. The "+100 coins for a video" gift stays a free ad slot (it is currency). |
| Ink Velocity (`im-mohua-liza-ink-velocity`) | Auto: first play, levels | More ink (+30%) when out of ink, once per attempt | Not exercised end to end (the game does not accept automated drawing). |
| Momo Run (`im-mohua-liza-momo-run`) | Auto: first play, levels | Keep going after a crash (once per run) | Clears what is ahead, 2.5 s protection. Single player only. |
| Mega Ramp (`Mdsadee527-mega-ramp-stunt-racer`) | Auto: first play, levels | None yet | Hidden on live until its issue is fixed. |
| Chroma Clash (`im-mohua-liza-chroma-clash`) | Auto: first play, replays | None yet | Events carry no level number. |
| Ashgrove Extraction (`im-mohua-liza-ashgrove-extraction`) | Auto: first play, replays | None yet | Hidden on live until its issue is fixed. |
| Brain Rush (`sksarfarajali-brainrush`) | Auto: first play, replays (daily and practice finishes) | A hint after the free one (every puzzle), and 5 more moves in Gem Match | Source project is outside the repo (`C:\Users\Public\Sarfaraj\BrainRushDaily\brainrush-daily`); the repo holds its build. Gem Match path covered by unit tests only. |
| Racing Mania (`Mdsadee527`) | Auto: first play | Keep driving after a crash (once per run) | The game loop waits while the prompt is open. Hidden on live until its issue is fixed. |
| Zest Strike (`im-mohua-liza-zest-strike`) | Auto: first play | None yet | Sends `level_start` only. |
| Skyforge (`saiqulmodi-skyforge`) | Auto: first play | None yet | Sends `level_start` only. |
| Poker Arena (`saiqulmodi-stratos-poker`) | Auto: first play | None | Online rebuy left alone. Hidden on live (sign-up removal pending). |
| Dino Frontier (`sksarfarajali-dino-frontier`) | Auto: first play | Keep exploring after a defeat (once per expedition) | Half health and 2 s protection; the run waits while the prompt is open. Not offered in the tutorial or demo. |
| Stratos Drop Zone (`sksarfarajali-stratos-drop-zone`) | Auto: first play (15 s timer) | Drop back in after elimination (once per solo match) | On the spot, half health, 3 s protection; the death crate with the old loot is at your feet. Source in `source/`, rebuilt with `npx vite build`. |
| Babel Harbour (`sksarfarajali-babel-harbour`) | Auto: first play (15 s timer) | One more hint when the daily hints run out | Checks that a hint is actually available before charging. |
| Magic Shot (`im-mohua-liza`) | Auto: first play (15 s timer) | Hint and extra bottle | Was the free "FREE HINT" overlay; reward text reworded. Minified code, one function changed. |
| Fighter (`saiqulmodi`) | Auto: first play (15 s timer) | None yet | Compiled bundle, sends no events. |
| Arrow Rush (`mody-sahariar1`) | Auto: first play (15 s timer) | None yet | Compiled bundle, sends no events. |
| Failspan (`saiqulmodi-failspan`), Kids | Auto: first play, levels | Hint | |
| Bridge Genius (`saiqulmodi-bridge-genius`), Kids | Auto: first play, levels | Hint | |
| Ecos-Synthetica (`saiqulmodi-ecos-synthetica`), Kids | Auto: first play, levels and modules | Second chance (continue) | Hidden on live until its issue is fixed. |
| Domino Wonder Dash (`saiqulmodi-domino-wonder-dash`), Kids | Auto: first play (15 s timer) | None yet | Sends no events. |
| Echo Island (`sksarfarajali`), Kids | Auto: first play (15 s timer) | None yet | Compiled bundle, sends no events. |
| Mystery Island (`nikhatenglish89`), Kids | Auto: first play (15 s timer) | None yet | Sends no events. |
| The Missing Minute (`sumaiyahsultana821-sys-the-missing-minute`) | Not shown yet (coming soon) | None | Covered automatically once it goes live. |
| Arrow Puzzle, Bloxplode, House Mafia, Word Quest | Not applicable | None | Store apps with info pages, not playable on the site. |

**Games with no spend moment yet, and why**

| Game | Why |
| --- | --- |
| Skyforge | A flight sim where a crash is the lesson and it already restarts you at the runway. |
| Ashgrove Extraction | Already has its own checkpoint retry. A revive needs health, ammo and enemy state restored. |
| Zest Strike | Shooter with its own respawn rules. A paid revive needs the maker's design (see COINS_SPEND_PROPOSALS.md). |
| Mega Ramp | The maker is still fixing restart and flip bugs (issue #34). |
| Chroma Clash | Party game with no hint, retry or help moment. |
| Poker Arena | Online rebuy against a server, hidden on live. |
| Mystery Island (Kids) | Its hint button is a free, unlimited learning aid for children by design. |
| Echo Island (Kids), Domino Wonder Dash (Kids), Fighter, Arrow Rush | Compiled or Python-in-browser builds with no editable source in the repo. They earn automatically. |

**Next steps (not done in this phase):** add `level_complete` events to games that send none (they currently earn only first play); design spend moments for the games listed above (the makers know their games best); decide premium games and prices (none yet); add the chip to the hand-written About/Press/Terms pages.
