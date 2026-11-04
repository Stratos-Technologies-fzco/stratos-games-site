# Domino Classic: developer notes

- Game is one file: `index.html` (no outside scripts, works offline). Tests: `node tests/engine.test.js`.
- The rules engine sits between `/*ENGINE_START*/` and `/*ENGINE_END*/`. It has no DOM code and is pure data in, data out, so a server can run the exact same block.
- `?demo=1` shows a mid-game position (used for the thumbnail). `?auto=1` lets the computer play your seat, for testing.

## Rules used
- Double-six set, 7 tiles each. 2 players: 14 tiles in the boneyard. 4 players: all 28 dealt, no boneyard (so Draw and Block play the same).
- Highest double opens, else highest tile. Draw: draw only when stuck, pass only when boneyard is empty. Block: no drawing.
- Round win by emptying the hand: score the pips left in the other hands. Blocked (everyone passes in a row): lowest total wins the difference, a tie scores 0.
- 4 players: seats 0 and 2 are a team against 1 and 3, pips and scores are shared.

## Online multiplayer: not built yet (needs a server)
This site is static hosting only, so there is no real-time server. Nothing fake is shown. To add it:
1. Run the engine block on a WebSocket server. Server calls `newRound`, `applyMove`, `drawTile`, `passTurn`; clients only send `{type:'move'|'draw'|'pass', tileId, end}`.
2. Send each player `viewFor(state, seat)` (never other hands). `viewFor` is already the hidden-information boundary the AI uses.
3. Add rooms (code, quick match), reconnect by seat token, and a turn timer. The UI's `doMove` / draw / pass handlers are the only places that need to call the network instead of the engine.
