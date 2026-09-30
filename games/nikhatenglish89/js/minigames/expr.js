// Tiny safe arithmetic evaluator for word-problem answers in questions.json
// (e.g. "a*b-c"). Supports + - * / and parentheses. No eval().

export function evaluate(expr, vars) {
  const tokens = expr.match(/\d+(?:\.\d+)?|[a-z]\w*|[-+*/()]/gi) || [];
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function primary() {
    const tok = next();
    if (tok === '(') {
      const v = additive();
      if (next() !== ')') throw new Error('Missing )');
      return v;
    }
    if (tok === '-') return -primary();
    if (/^\d/.test(tok)) return Number(tok);
    if (tok in vars) return Number(vars[tok]);
    throw new Error(`Unknown token ${tok}`);
  }
  function multiplicative() {
    let v = primary();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const r = primary();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function additive() {
    let v = multiplicative();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const r = multiplicative();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  const result = additive();
  if (pos !== tokens.length) throw new Error('Unexpected input');
  return result;
}
