# Flag for Sahil and Sahariar: FAILSPAN audience and analytics

**From:** Md. Saiqul Haque Modi (saiqulmodi) · **Date:** 01-Nov-2026 · **Game:** `games/saiqulmodi-failspan/` (FAILSPAN: Structural Mayhem)

## What this game is for

FAILSPAN builds students' foundation for **academics and careers**, and it is meant for **all age groups**, not only
young children:

- Class 1 to 12, then BE, NIT, IIT and Expert Engineer: one building per stage on the campus road.
- 53,000+ questions (physics, chemistry, maths, biology, EVS, computer, commerce, economics, engineering).
- Real engineering physics: a stiffness-method truss solver checks every member for snapping, crushing and buckling.
- Useful for school students, engineering aspirants (JEE / NIT / IIT level) and adults who want the basics of structures.

## No analytics is added to it today

- The box is in the **kids** category (`"category": "kids"` in game.json), so by the Stratos rule it runs with **no
  analytics and no ads**. No usage numbers reach the Stratos dashboard for this game.
- The Stratos `track()` hand-off is already in the code (`js/game.js`), following the owner's analytics rule:
  `level_start` when a bridge level starts, `level_complete` when the bridge passes and `game_over` when it collapses,
  each with `seconds` played. No personal data: only level, stars, parts and seconds.
- Nothing else tracks: no Firebase, Google Analytics or any other script of our own.

## What we ask you to decide

Please review whether FAILSPAN can sit in a non-kids category (for example education / all ages), so that Stratos
analytics switches on for it. We will not change the category ourselves: that is your call under the kids rule.

If it must stay in kids, it stays as it is (no analytics, no ads), and this flag is only for your records.
