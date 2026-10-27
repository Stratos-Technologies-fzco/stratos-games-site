// Mentor.js - the offline AI Mentor: one engine, three personas. It answers
// from the checked concept texts (content/text/concepts.json), in the
// player's language and in the register of their tier. No model, no network.
// An optional live model (LlmBridge.js) can be tried first when a school turns
// it on; if it is off or fails, this offline answer is used.
import { getLang } from '../i18n.js';

const REGISTER = { explorer: 'explorer', scientist: 'scientist', professional: 'professional' };
let concepts = null;

export async function loadConcepts() {
  if (concepts) return concepts;
  try { concepts = (await fetch('content/text/concepts.json').then((r) => r.json())).concepts; } catch (e) { concepts = []; }
  return concepts;
}

const norm = (s) => String(s || '').toLowerCase().normalize('NFC');
const pick = (obj, lang) => (obj && (obj[lang] || obj.en)) || '';

// Score each concept by how many of its keywords (any language) appear in the question.
export function match(text, list = concepts || []) {
  const q = norm(text);
  if (!q.trim()) return null;
  let best = null, bestScore = 0;
  for (const c of list) {
    let s = 0;
    for (const words of Object.values(c.keys || {})) {
      for (const w of words) if (q.includes(norm(w))) s += norm(w).length > 6 ? 2 : 1;
    }
    if (norm(pick(c.title, 'en')) && q.includes(norm(pick(c.title, 'en')))) s += 3;
    if (s > bestScore) { best = c; bestScore = s; }
  }
  return best;
}

export class Mentor {
  constructor(tier) {
    this.register = REGISTER[tier] || 'scientist';
    this.bridge = null; // set by LlmBridge when a school turns the live model on
  }

  async ask({ text = '', conceptId = null } = {}) {
    const list = await loadConcepts();
    const lang = getLang();
    const c = conceptId ? list.find((x) => x.id === conceptId) : match(text, list);
    if (this.bridge && text && this.register !== 'explorer') {
      const live = await this.bridge.ask({ text, concepts: c ? [c] : [], register: this.register, lang }).catch(() => null);
      if (live && live.answer) return { ...live, live: true, conceptId: c ? c.id : null, title: c ? pick(c.title, lang) : '' };
    }
    if (!c) return { answer: null, conceptId: null };
    return {
      answer: pick(c[this.register], lang) || pick(c.scientist, lang),
      title: pick(c.title, lang),
      source: c.source,
      register: this.register,
      conceptId: c.id,
      live: false,
    };
  }

  async topics() {
    const list = await loadConcepts();
    const lang = getLang();
    return list.map((c) => ({ id: c.id, title: pick(c.title, lang) }));
  }
}
