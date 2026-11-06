# Domino Classic: developer notes

- Game is one file: `index.html` (no outside scripts, works offline). Tests: `node tests/engine.test.js`.
- The rules engine sits between `/*ENGINE_START*/` and `/*ENGINE_END*/`. It has no DOM code and is pure data in, data out, so a server can run the exact same block.
- `?demo=1` shows a mid-game position (used for the thumbnail). `?auto=1` lets the computer play your seat, for testing.

## Rules used
- Double-six set, 7 tiles each. 2 players: 14 tiles in the boneyard. 4 players: all 28 dealt, no boneyard (so Draw and Block play the same).
- Highest double opens, else highest tile. Draw: draw only when stuck, pass only when boneyard is empty. Block: no drawing.
- Round win by emptying the hand: score the pips left in the other hands. Blocked (everyone passes in a row): lowest total wins the difference, a tie scores 0.
- 4 players: seats 0 and 2 are a team against 1 and 3, pips and scores are shared.

## Online play (built)
No game server. Players talk through a free public MQTT relay (broker.emqx.io / broker.hivemq.com) with the vendored `vendor/mqtt.min.js` (mqtt.js 5.10.1, MIT), the same approach as Momo Run. The library loads only when someone opens the online screen.
- **Host-authoritative:** the room creator's browser runs the engine, checks every move/draw/pass with `legalMoves` / `canDraw` / `canPass`, and sends each guest only that guest's own view (`viewFor`: their hand, the chain, tile counts). Guests never get other hands until the round ends.
- **Private and tamper-resistant:** each guest does an ECDH (P-256) key exchange with the host and every private message is AES-GCM encrypted, so people watching the relay cannot read hands or fake someone's move. Actions carry the state version so replays are rejected.
- **Rooms:** 5-letter code, invite link (`?room=CODE`), 2 players, or 4 players with CPU seats clearly labelled "(CPU)". Never shown as real people.
- **Drop-outs:** a silent player (or one who leaves) is marked "(away)" and a computer plays the seat; if they come back they are resynced. A guest who loses the host for 30 s goes back to the menu.
- **Limits:** the host's device is the referee (a modified host could cheat; fine for friends, not for ranked play). A page refresh drops a player, there is no spectator mode, and hints/undo are off online. A real server (WebSocket + same engine block) would remove these limits.
- Messages on the wire: `lobby`, `start`, `hb`, `ping`, `hello`, `reject`, `bye`, `closed` (public, no secrets) and `enc`/`act` (encrypted views and player actions).
