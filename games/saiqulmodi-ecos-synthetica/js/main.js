// main.js - wires the Data Hub, UI, sound and the game together.
import { Game } from './GameLoop.js';
import { UI } from './UI.js';
import { Sound } from './Sound.js';

const sound = new Sound();
const ui = new UI(sound);
try {
  const game = new Game(document.getElementById('stage'), ui, sound);
  ui.bind(game);
  window.ecos = game; // handy for testing from the browser console
} catch (err) {
  console.error(err);
  document.getElementById('fatal').hidden = false;
}
