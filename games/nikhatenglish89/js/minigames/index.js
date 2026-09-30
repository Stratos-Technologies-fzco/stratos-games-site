// Mini-game framework: runs the rounds of a level with any of the eight
// engines, handling prompts, read-aloud, hints, friendly feedback and
// progress. Engines only generate rounds (pure data) and render one round.

import * as number from './number.js';
import * as wordBuilder from './word-builder.js';
import * as memorySequence from './memory-sequence.js';
import * as patternPuzzle from './pattern-puzzle.js';
import * as objectHunt from './object-hunt.js';
import * as mazePath from './maze-path.js';
import * as scienceChoice from './science-choice.js';
import * as spotDifference from './spot-difference.js';
import { createRng } from '../rng.js';

export const ENGINES = {
  number,
  'word-builder': wordBuilder,
  'memory-sequence': memorySequence,
  'pattern-puzzle': patternPuzzle,
  'object-hunt': objectHunt,
  'maze-path': mazePath,
  'science-choice': scienceChoice,
  'spot-difference': spotDifference
};

export function levelParams(level, band) {
  return level.bands[String(band)] || level.bands['0'];
}

// Pure: build all rounds for a level/band from a seed (used by tests too).
export function buildRounds(level, band, seed, questions) {
  const engine = ENGINES[level.engine];
  if (!engine) throw new Error('Unknown engine ' + level.engine);
  const rng = createRng(seed);
  return engine.generate(levelParams(level, band), rng, { questions, theme: level.world, band });
}

export function runMiniGame(opts) {
  const { container, level, band, seed, questions, h, t, sfx, speak, settings, avatar } = opts;
  const engine = ENGINES[level.engine];
  const rounds = buildRounds(level, band, seed, questions);
  const summary = {
    mistakes: opts.resume?.mistakes || 0,
    hints: opts.resume?.hints || 0,
    correct: opts.resume?.correct || 0,
    rounds: rounds.length
  };
  let index = Math.min(opts.resume?.round || 0, rounds.length - 1);
  let cleanups = [];
  let locked = false;
  let hintCounted = false;
  let destroyed = false;
  let timer = null;

  const resolveText = (msg) => {
    if (!msg) return '';
    if (typeof msg === 'string') return msg;
    if (msg.text) return msg.text;
    const vars = {};
    for (const [k, v] of Object.entries(msg.vars || {})) vars[k] = typeof v === 'string' && v[0] === '@' ? t(v.slice(1)) : v;
    return t(msg.key, vars);
  };

  const promptText = h('p.prompt-text');
  const readBtn = h(
    'button.btn.btn-icon.btn-read',
    { type: 'button', 'aria-label': t('ui.game.readAloud'), onclick: () => speak(promptText.textContent) },
    '🔊'
  );
  const hintBtn = h('button.btn.btn-hint', { type: 'button', onclick: () => doHint() }, '💡 ', t('ui.game.hint'));
  const dots = h('div.round-dots', { 'aria-label': '' });
  const feedback = h('div.feedback', { role: 'status' });
  const area = h('div.engine-area.engine-' + level.engine);
  container.replaceChildren(
    h('div.game-head', dots, hintBtn),
    h('div.prompt', readBtn, promptText),
    area,
    feedback
  );

  function setFeedback(text, kind = '') {
    feedback.className = 'feedback' + (kind ? ' feedback-' + kind : '');
    feedback.textContent = text;
  }

  function drawDots() {
    dots.replaceChildren(
      ...rounds.map((_, i) => h('span.dot' + (i < index ? '.done' : i === index ? '.current' : ''), { 'aria-hidden': 'true' }))
    );
    dots.setAttribute('aria-label', t('ui.game.roundOf', { n: index + 1, total: rounds.length }));
  }

  function runCleanups() {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
    cleanups = [];
  }

  function doHint() {
    if (locked || !hintHandler) return;
    sfx('tap');
    const used = hintHandler();
    if (used) countHint();
  }

  function countHint() {
    if (!hintCounted) {
      summary.hints++;
      hintCounted = true;
      opts.onProgress && opts.onProgress({ round: index, ...summary });
    }
  }

  let hintHandler = null;

  function startRound() {
    runCleanups();
    locked = false;
    hintCounted = false;
    hintHandler = null;
    area.replaceChildren();
    setFeedback('');
    drawDots();
    const round = rounds[index];
    // test hook: automated browser tests read the current round to solve it
    const debug = typeof window !== 'undefined' ? window.__MI_DEBUG__ : null;
    if (debug) {
      debug.round = round;
      debug.count = (debug.count || 0) + 1;
    }
    const text = resolveText(round.prompt);
    promptText.textContent = text;
    if (settings.autoRead) setTimeout(() => !destroyed && speak(text), 250);
    const api = {
      el: area,
      h,
      t,
      avatar,
      sfx,
      locked: () => locked,
      correct: () => {
        if (locked) return;
        locked = true;
        summary.correct++;
        sfx('correct');
        setFeedback(t('ui.game.praise'), 'good');
        timer = setTimeout(nextRound, typeof window !== 'undefined' && window.__MI_DEBUG__?.fast ? 60 : 1300);
      },
      wrong: () => {
        if (locked) return;
        summary.mistakes++;
        sfx('wrong');
        setFeedback(t('ui.game.tryAgain'), 'retry');
        opts.onProgress && opts.onProgress({ round: index, ...summary });
      },
      say: (msg) => {
        const s = resolveText(msg);
        if (!s) return;
        setFeedback(s, 'hint');
        speak(s);
      },
      setPrompt: (s) => (promptText.textContent = s),
      setHint: (fn) => (hintHandler = fn),
      useHint: countHint,
      onCleanup: (fn) => cleanups.push(fn)
    };
    engine.render(round, api);
  }

  function nextRound() {
    if (destroyed) return;
    index++;
    if (index >= rounds.length) {
      runCleanups();
      opts.onComplete(summary);
      return;
    }
    opts.onProgress && opts.onProgress({ round: index, ...summary });
    startRound();
  }

  startRound();
  return {
    destroy() {
      destroyed = true;
      clearTimeout(timer);
      runCleanups();
    }
  };
}
