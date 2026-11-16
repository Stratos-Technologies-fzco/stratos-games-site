# Stratos Coins: spend moment proposals (2026-11-16)

Every playable game already **earns** Stratos Coins by itself. These games cannot **spend** them yet. For each one there is one small proposal and a prompt you paste into Claude Code in your own clone of the repo. The maker knows the game best, so change the idea if you have a better one.

Rules that apply to every proposal (they are in `CLAUDE.md`, section "Stratos Coins"):

- Stratos Coins pay for one-use help only: a hint, a second chance, a power-up. Never currency, skins or progress.
- Call `Stratos.coins.offer(item, onDone, { title, what, onCancel })`. It shows the price and the player's balance, one tap spends, and `onDone` runs only after payment. Items today: `hint` 10, `undo` 5, `continue` 15, `boost` 20.
- At most once per run or per level, single player only (no coins for online or friends-only play).
- If `Stratos.coins` is not there, the game plays exactly as before. Keep the game's own coin, if it has one, completely separate.
- Working examples to copy: `games/im-mohua-liza-momo-run/` (a revive), `games/sksarfarajali-moto-rush/` (a second chance), `games/im-mohua-liza-wordbloom/` (help next to an own-coin price).

The prompt format (fill in the game and the moment):

```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. In games/<folder>/ add ONE spend moment: <the moment>.
Use Stratos.coins.offer('<item>', onDone, { title: '<question>', what: '<noun>', onCancel }) the way games/im-mohua-liza-momo-run/ does.
It must happen at most <how often>, only in single player, and the game must play exactly as before if Stratos.coins is missing.
Do not touch the game's own coin. Then play a round to test it, run the economy checklist from CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

---

## Mohua Liza (`im-mohua-liza`)

### Zest Strike (`im-mohua-liza-zest-strike`)
- **Now:** free-for-all fruit shooter against bots, with its own respawn (`respawn(b)` in `game.js`). Sends only `level_start`, so it earns first play only.
- **Moment:** when the player is knocked out, offer **"Another go" (`continue`, 15)**: respawn at once at full health with 3 seconds of protection, once per match.
- **Also:** send `level_complete` at the end of a match (and `game_over` with `won: true` for a win) so it earns more than first play.
```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. In games/im-mohua-liza-zest-strike/ do two things.
1) At the end of a match send Stratos.track('level_complete', { level: <match number> }), and Stratos.track('game_over', { won: true }) when the player wins.
2) When the player is knocked out, call Stratos.coins.offer('continue', respawnWithProtection, { title: 'Another go?', what: 'Another go' }) once per match: full health, 3 seconds of protection, in single player only.
If Stratos.coins is missing the game must play as before. Test a full match, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

### Chroma Clash (`im-mohua-liza-chroma-clash`)
- **Now:** party game with rounds. Events carry no level number, so it earns replay coins only.
- **Moment:** a one-use **"Power start" (`boost`, 20)** before a round: pick the help that fits the game best (a shield for the first hit, a head start, or a skip of one bad turn). Once per round, single player only.
- **Also:** add a round number to `level_complete`.
```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. In games/im-mohua-liza-chroma-clash/ first add a round number to the level_complete event: Stratos.track('level_complete', { level: <round number> }).
Then read the game and pick ONE natural one-use help for a single player (a shield for the first hit, a head start, or skipping one bad turn). Offer it before a round with Stratos.coins.offer('boost', applyHelp, { title: 'Power start?', what: 'Power start' }), once per round, single player only.
The game must play as before if Stratos.coins is missing. Test a round, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

### Ashgrove Extraction (`im-mohua-liza-ashgrove-extraction`)
- **Now:** 3D mission game with a free checkpoint retry (`btnRetry`) on the "Mission failed" panel.
- **Moment:** on the failed panel add **"Revive Mara and fight on" (`continue`, 15)**: restart from the current position with full health for both characters and a refill of ammo, once per mission. The free checkpoint retry stays.
```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. In games/im-mohua-liza-ashgrove-extraction/ add a second button on the "Mission failed" panel (endGame(false, ...)) called "Fight on" that calls Stratos.coins.offer('continue', reviveHere, { title: 'Fight on?', what: 'A second chance' }).
reviveHere restores health for Mara and the player and refills ammo at the current position, once per mission. Keep the existing free checkpoint retry. Hide the button when Stratos.coins is missing.
Test a failed mission, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

---

## Mohammad Sadee (`Mdsadee527`)

### Mega Ramp Stunt Racer (`Mdsadee527-mega-ramp-stunt-racer`)
- **Now:** stunt racer with levels. The team update says it has flip and restart problems (issue #34). Fix those first.
- **Moment:** after a failed run, **"Retry from the ramp" (`continue`, 15)** puts the car back on the ramp just before the crash, once per level. The free restart stays.
```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. First finish the open fixes from issue #34 (restart after a flip). Then in games/Mdsadee527-mega-ramp-stunt-racer/ add one spend moment on the failed-run screen: Stratos.coins.offer('continue', retryFromRamp, { title: 'Try again from the ramp?', what: 'Another try' }), once per level, single player only.
The free restart must stay. The game must play as before if Stratos.coins is missing. Test a failed run, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```
(Sadee's games are pushed from Mohua's account today, so Mohua can pass this on.)

---

## Md. Saiqul Haque Modi (`saiqulmodi`)

### SkyForge (`saiqulmodi-skyforge`)
- **Now:** flight sim. After a crash the pilot waits 10 seconds for a new start.
- **Moment:** a one-use **"Landing assist" (`boost`, 20)** before an approach: shows the glide path and steadies the aircraft for that landing. Once per flight. The crash wait stays free.
```text
Read the "Stratos Coins" section of CLAUDE.md and research/COINS_ROLLOUT.md. In games/saiqulmodi-skyforge/ add a "Landing assist" button during approach that calls Stratos.coins.offer('boost', startLandingAssist, { title: 'Use landing assist?', what: 'Landing assist' }).
startLandingAssist shows the glide path and steadies pitch and roll for this landing only, once per flight. Hide the button if Stratos.coins is missing. Also send Stratos.track('level_complete', { level: <flight number> }) after a good landing so the game earns more than first play.
Test a flight, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

### Fighter (`saiqulmodi`) , compiled build
- **Now:** a compiled build (`assets/index-*.js`); the source is not in the repo.
- **Moment:** **"Second chance" (`continue`, 15)** after a knock-out, once per fight.
- **First:** put the source project in the repo, or ask Sarfaraj to help.
```text
Read the "Stratos Coins" section of CLAUDE.md. games/saiqulmodi/ is a compiled build, so first add the source project (the folder with package.json) to the repo under games/saiqulmodi-source/ and keep the build output in games/saiqulmodi/.
Then, in the source, add Stratos.coins.offer('continue', secondChance, { title: 'Another chance?', what: 'A second chance' }) after a knock-out, once per fight, single player only. Rebuild, test, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

### Stratos Poker Arena (`saiqulmodi-stratos-poker`)
- **Now:** online poker over a server, hidden on live until the email and phone sign-up is removed.
- **Proposal:** no coin spend for now. A rebuy that costs coins needs the server to check the balance, which comes with accounts (phase 7). Earning already works.

### Domino Game (`saiqulmodi-domino-wonder-dash`), Kids, Python build
- **Now:** a Python-in-the-browser build (`dominowonderdash.zip`), no JavaScript source to edit.
- **Moment:** a **free-style hint is better for kids**; if you want a paid one, **"Hint" (`hint`, 10)** that glows the next playable domino.
- **First:** add the Python source (`.py` files) to the repo.
```text
Read the "Stratos Coins" section of CLAUDE.md. games/saiqulmodi-domino-wonder-dash/ is a Python build, so first put the .py source in the repo. If the game has no hint, add a hint button that glows the next playable domino and calls Stratos.coins.offer('hint', showHint, { title: 'Get a hint?', what: 'A hint' }) through the JavaScript bridge of the page, once per level.
If that is not possible in this build, tell me why in three short lines instead of forcing it.
```

---

## Sahariar Mody (`mody-sahariar1`)

### Arrow Rush (`mody-sahariar1`), compiled build
- **Now:** compiled build (`assets/index-*.js`), no source in the repo.
- **Moment:** **"Hint" (`hint`, 10)** that highlights the next arrow that can leave the board, and **"Undo" (`undo`, 5)** for the last move.
```text
Read the "Stratos Coins" section of CLAUDE.md. games/mody-sahariar1/ is a compiled build, so first put the source project (the folder with package.json) in the repo.
Then add a Hint button (Stratos.coins.offer('hint', highlightNextArrow, { title: 'Get a hint?', what: 'A hint' })) and an Undo button (Stratos.coins.offer('undo', undoLastMove, { title: 'Undo that move?', what: 'An undo' })), each at most 3 times per level. Rebuild, test, check the economy checklist in CLAUDE.md, tell me in three short lines what passed, and publish to staging.
```

---

## Sk Sarfaraj Ali (`sksarfarajali`)

### Stratos Drop Zone (`sksarfarajali-stratos-drop-zone`)
- **Moment:** after elimination, **"Drop back in" (`continue`, 15)**: land again with half health and a basic weapon, once per match.

### Dino Frontier (`sksarfarajali-dino-frontier`)
- **Moment:** on a failed expedition, **"Revive at the checkpoint" (`continue`, 15)**. Make sure the revive never grants rewards twice (`DF.commitGrant` already guards run IDs).

### BrainRush Daily (`sksarfarajali-brainrush`), compiled build
- **Moment:** **"Hint" (`hint`, 10)** for the Sudoku and Logic puzzles. Needs the source project in the repo first.

### Echo Island (`sksarfarajali`), Kids, compiled build
- **Proposal:** none for now (kids game; keep help free).

---

## Nikhat (`nikhatenglish89`)

### Mystery Island (`nikhatenglish89`), Kids
- **Proposal:** none. The 💡 hint is a free, unlimited learning aid for children by design. It still earns Stratos Coins automatically.
