// Helpers shared by the mini-game engines.

// Big answer buttons. Wrong choices are dimmed (never removed as punishment)
// so the child can try again. Returns { el, eliminateOne } for hints.
export function choiceGrid(api, options, isCorrect, { label = (o) => String(o), cls = '' } = {}) {
  const { h } = api;
  const buttons = options.map((opt) => {
    const b = h(
      'button.choice' + (cls ? '.' + cls : ''),
      {
        type: 'button',
        onclick: () => {
          if (api.locked() || b.disabled) return;
          if (isCorrect(opt)) {
            b.classList.add('is-correct');
            api.correct();
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            api.wrong();
          }
        }
      },
      label(opt)
    );
    b.dataset.value = String(opt);
    return b;
  });
  const el = h('div.choices' + (options.length > 4 ? '.choices-many' : ''), buttons);
  return {
    el,
    eliminateOne() {
      const wrong = buttons.filter((b, i) => !b.disabled && !isCorrect(options[i]));
      if (!wrong.length) return false;
      const b = wrong[0];
      b.disabled = true;
      b.classList.add('is-eliminated');
      return true;
    }
  };
}

export function themeSymbols(ctx, count, rng, exclude = []) {
  const theme = ctx.questions.themes[ctx.theme] || ctx.questions.themes.beach;
  const pool = theme.symbols.filter((s) => !exclude.includes(s));
  return rng.sample(pool, Math.min(count, pool.length));
}

export function pulse(el, cls = 'hint-pulse', ms = 2400) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}

export function shake(el) {
  pulse(el, 'shake', 500);
}
