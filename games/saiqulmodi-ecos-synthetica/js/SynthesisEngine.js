// SynthesisEngine.js - checks a combination of components against the real
// defence pathways stored in the Data Hub, and gives graded scientific hints.

export class SynthesisEngine {
  constructor() {
    this.attempts = {};
  }

  // org: organism from Database; selected: array of component ids.
  // Returns { success, recipe } or a failure with hints that grow with each try.
  evaluate(org, selected) {
    const sel = [...new Set(selected)];
    for (const r of org.recipes) {
      if (r.length === sel.length && r.every((c) => sel.includes(c))) {
        this.attempts[org.id] = 0;
        return { success: true, recipe: r };
      }
    }
    // Closest real pathway: most right parts, fewest wrong ones.
    let best = org.recipes[0];
    let bestScore = -Infinity;
    for (const r of org.recipes) {
      const hits = sel.filter((c) => r.includes(c)).length;
      const score = hits * 2 - (sel.length - hits);
      if (score > bestScore) { bestScore = score; best = r; }
    }
    const attempt = (this.attempts[org.id] = (this.attempts[org.id] || 0) + 1);
    const right = sel.filter((c) => best.includes(c));
    const wrong = sel.filter((c) => !best.includes(c));
    return {
      success: false,
      attempt,
      hits: right.length,
      needed: best.length,
      // Attempt 1: only the count. Attempt 2+: which parts fit. Attempt 3+: one missing part named.
      right: attempt >= 2 ? right : [],
      wrong: attempt >= 2 ? wrong : [],
      reveal: attempt >= 3 ? best.find((c) => !sel.includes(c)) || null : null,
    };
  }

  // Lengths of the real pathways, e.g. "2" or "1-2".
  partsHint(org) {
    const lens = org.recipes.map((r) => r.length);
    const lo = Math.min(...lens);
    const hi = Math.max(...lens);
    return lo === hi ? `${lo}` : `${lo}-${hi}`;
  }
}
