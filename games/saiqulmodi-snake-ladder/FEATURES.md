# Snake Ladder: game features

**Play (phone):** https://stratos-family-staging.vercel.app/play/snake-ladder/
**Folder:** `stratos-games-site/games/saiqulmodi-snake-ladder/`
**Version:** commit `d4bdd6b` on `staging` (22 Nov 2026). It goes live on stratos.games at the Saturday release if issue #33 shows ✅.

---

## 1. Goal: a two-player game
- **🔴 Red team vs 🔵 Blue team** on one phone or laptop.
- Each team has **one frog and one live snake** of its own colour.
- Race your frog from **1 to 100**, then on to **200, 300 … with no end**, for as long as both players want to play.

## 2. Turns: the hands swap after every roll
- **Player 1 rolls for the 🔴 frog** while **Player 2 steers the 🔵 snake** to catch it.
- After the roll, the dice passes: **Player 2 rolls for the 🔵 frog** and **Player 1 steers the 🔴 snake**.
- The active team is shown by a glowing HUD pill, a coloured dice button and a pulsing ring around its frog.
- Each frog stands on its own half of a square (red on the left, blue on the right), so both always show.

## 3. Dice
- **Two dice**, so the frog moves **+2 to +12** squares.
- Roll with **R / Space**, the **🔴🎲 R** button, or the big **🎲** button on a phone.
- The frog **hops square by square**, so every move is easy to follow.
- Each square moved gives **+25 points**.
- A second press while the frog is still moving is ignored.

## 4. Live team snakes (the hunters)
- At the start of each turn, the **opponent's snake appears just behind the moving frog** (2 squares back).
- It has a **1.2-second head start pause** and then moves at the **same speed as the frog** (one square per dice step).
- **Steering:** hold a **finger or the mouse** on the board (the snake crawls there and stops), or use the **Arrow keys / WASD**.
- **Catch:** if the head reaches the frog during its move, the frog **drops 10 squares** (−25 points per square). Its move stops and the dice passes on.
- Each catch makes that team's snake **3 pieces longer** (it starts at 22 and can reach up to 46).
- The snake takes its team's colour (a red or blue rainbow).

## 5. Idle snakes: enemies of both frogs
- **7 snakes** show only a **small head with small fangs** coming out of a hole. The body and tail are hidden.
- Landing on a snake head **slides the frog down to the tail square** (−25 points per square lost).
- **Moving snakes:** every **3 seconds**, one snake sinks and pops up somewhere new.

## 6. Ladders: friends of both frogs
- Landing on a ladder's foot **climbs it** with a chime and **+200 points**.
- **Wobbly ladder:** every **7 seconds**, one ladder grows into a new spot.

## 7. ⭐ Bonus stars 1 to 6
- **8 colourful stars** sit on random squares, each showing its **value from 1 to 6**. Bigger values make bigger stars.
- Landing on a star **or hopping over it** during a dice move pays **value × 100** (⭐1 = +100 … ⭐6 = +600).
- **🔗 Chain:** two or more stars in one move pay +25% extra for each further star.
- A collected star bursts, and a new one appears somewhere else, so there are always 8.

## 8. Endless hundreds
- Reaching **100 pays +1000** and fireworks. The frog then hops on to **101** (square 1 of the next hundred).
- The **first frog into a new hundred brings a fresh board** of snakes and ladders, which grows in for both frogs.
- The square numbers follow the active frog's hundred (101 … 200, 201 … 300 …).
- **No game over.**

## 9. 🔄 Reset: fresh game, scores kept
- A **🔄** button in the top bar.
- **Tap twice:** the first tap shows 🔄❓ for 2.5 seconds, the second tap resets. A stray tap does nothing.
- Both frogs go back to **square 1** on a **brand-new random board** with new stars. **Both scores are kept** and red rolls first.

## 10. Board
- **Daily board:** today's date sets the 7 ladders and 7 snakes, the same for every player (each new hundred has its own daily layout).
- The board fills the screen on a phone and on a laptop, with **no scrolling**.
- A frog's square is tinted in its team colour.

## 11. Controls
| Action | Laptop | Phone |
|---|---|---|
| Roll dice (active frog) | R / Space or 🎲 R | 🎲 button |
| Steer your snake (other player) | Arrow keys / WASD or mouse | Hold a finger on the board |
| Reset (scores kept) | 🔄 twice | 🔄 twice |
| Pause | P or ⏸ | ⏸ |
| Mute | M or 🔊 | 🔊 |
| Save and go home | H / Esc or 🏠 | 🏠 |

## 12. Teaching while playing, symbols only
- The dice button **pulses** until the first roll.
- **One-time picture tips** cover rolling, steering the snake, turn swaps, catches, stars and hundreds.
- No sentences on the screens, only symbols and numbers.
- The home screen goal reads **🔴🐸 🆚 🔵🐸 ➜ 🏁 100 ➜ 200 ➜ ♾️**, with picture cards for each rule.

## 13. Saving and coming back
- Everything saves after every move: both frogs' squares, hundreds and scores, the turn, the board and the stars.
- **▶ 🔴 N · 🔵 M** on the home screen continues exactly where you left off.
- **🏆 Top 5** scores (one row per frog per game, updated at each hundred) and a **🔥 daily streak**.

## 14. Stratos Coins
- **Earn:** automatic from the Stratos events (first play, and each hundred finished counts as a level).
- **Spend, always the player's choice:**
  - **↩ Second chance** (`continue`): offered once after a drop of 10 or more squares; it takes that frog back up.
  - **🎶+ Flute** (`boost`): the next snake head is harmless.
- Without Stratos the game plays normally.

## 15. The 6-second rule (hover clip, Stratos rule #71)
- Every Stratos game must have a **6-second silent clip of real play** (`preview.mp4`, 480 × 300). It plays when a mouse rests on the game's tile on stratos.games.
- **No clip, no launch:** the staging check holds back a game without one.
- The clip must show **only real play**: no menus, loading screens or "game over".
- Snake Ladder's clip shows both frogs rolling and the team snakes hunting. It was made with:
  `python tools/make_clip.py saiqulmodi-snake-ladder --steps "click:▶; wait:3000; key:r; hold:ArrowUp:1300; mark; …"`
  (`mark` = where the 6 seconds start; it was moved later so the menu is not in it).
- Remake the clip after any big change to how the game looks.

## 16. Stratos rules met
- Analytics: `level_start`, `level_complete` (each hundred) and `game_over`, plus `reward_offered` / `reward_taken`.
- Soft sounds with a mute button. No sign-up, no outside scripts, works offline.
- Glow effects switch off on slow phones.
- Real cover (800 × 500, from play), the 6-second clip, and a 300-word page text in `game.json`.
- `tools/check_games.py`: **✅ goes live**, every column ✅.
