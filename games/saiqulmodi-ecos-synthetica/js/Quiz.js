export function buildQuiz(scanned, tier, nGame = 2, nBank = 4) {
  const all = organismsOfTier(tier);
  const known = all.filter((x) => scanned.has(x.id));
  const pool = shuffle(known.length >= nGame ? known : all);
  const kinds = shuffle(Object.keys(MAKERS));
  const qs = [];
  for (let i = 0; i < pool.length && qs.length < nGame; i++) {
    const q = MAKERS[kinds[i % kinds.length]](pool[i], all);
    if (q) qs.push({ ...q, source: 'game' });
  }
  for (const b of spreadOrder(BANK[tier] || [], (x) => x.q, nBank)) {
    const r = options(b.opts[b.ans], b.opts.filter((_, i) => i !== b.ans));
    if (r) qs.push({ q: b.q, ...r, why: b.why, source: 'bank', cls: b.cls, topic: b.topic, subject: b.subject || 'Biology' });
  }
  return spreadOrder(qs, (x) => x.q);
}