// Memory Sequence: watch the crystals light up, then tap them in the same order.

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#84cc16'];
const GEMS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '💠', '🌸', '🍀'];

export function generate(p, rng) {
  const tiles = p.tiles || 4;
  const rounds = [];
  for (let r = 0; r < (p.rounds || 3); r++) {
    const len = (p.length || 3) + r * (p.grow ?? 1);
    const seq = [];
    while (seq.length < len) {
      const n = rng.int(0, tiles - 1);
      if (!p.repeats && seq.length && seq[seq.length - 1] === n) continue;
      seq.push(n);
    }
    rounds.push({ tiles, seq, speed: p.speed || 700, prompt: { key: 'engines.memory.watch', vars: { n: len } } });
  }
  return rounds;
}

export function render(round, api) {
  const { h } = api;
  let step = 0;
  let playing = false;
  let timers = [];
  const speed = typeof window !== 'undefined' && window.__MI_DEBUG__?.fast ? 60 : round.speed;
  const buttons = Array.from({ length: round.tiles }, (_, i) =>
    h(
      'button.crystal',
      {
        type: 'button',
        style: { '--c': COLORS[i] },
        'aria-label': api.t('engines.memory.crystal', { n: i + 1 }),
        onclick: () => press(i)
      },
      GEMS[i]
    )
  );
  const grid = h('div.crystal-grid.cols-' + (round.tiles <= 4 ? 2 : 3), buttons);
  const replayBtn = h(
    'button.btn.btn-ghost.btn-small',
    { type: 'button', onclick: () => !playing && !api.locked() && playSequence(true) },
    api.t('engines.memory.watchAgain')
  );

  function flash(i, dur) {
    const b = buttons[i];
    b.classList.add('lit');
    api.sfx('flash', i);
    timers.push(setTimeout(() => b.classList.remove('lit'), dur));
  }

  function setInputEnabled(on) {
    grid.classList.toggle('disabled', !on);
    buttons.forEach((b) => b.setAttribute('aria-disabled', String(!on)));
  }

  function playSequence(countAsReplay = false) {
    if (countAsReplay) api.useHint();
    playing = true;
    step = 0;
    setInputEnabled(false);
    api.setPrompt(api.t('engines.memory.watch', { n: round.seq.length }));
    round.seq.forEach((n, k) => {
      timers.push(setTimeout(() => flash(n, speed * 0.6), 500 + k * speed));
    });
    timers.push(
      setTimeout(() => {
        playing = false;
        setInputEnabled(true);
        api.setPrompt(api.t('engines.memory.yourTurn'));
      }, 500 + round.seq.length * speed)
    );
  }

  function press(i) {
    if (playing || api.locked()) return;
    flash(i, 250);
    if (round.seq[step] === i) {
      step++;
      if (step === round.seq.length) api.correct();
    } else {
      api.wrong();
      timers.push(setTimeout(() => playSequence(false), 900));
    }
  }

  api.setHint(() => {
    if (playing) return false;
    // show the whole order again, then glow the next crystal
    playSequence(false);
    const next = round.seq[0];
    timers.push(setTimeout(() => buttons[next].classList.add('hint-pulse'), 500 + round.seq.length * speed));
    timers.push(setTimeout(() => buttons[next].classList.remove('hint-pulse'), 2600 + round.seq.length * speed));
    return true;
  });

  api.onCleanup(() => timers.forEach(clearTimeout));
  api.el.append(grid, h('div.center', replayBtn));
  playSequence(false);
}
