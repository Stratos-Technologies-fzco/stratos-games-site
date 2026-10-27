// report.js - the "Share with teacher" report card and the teacher's class
// table. Pure functions (used by the game, teacher.html and the tests).
// A report holds module results only: no clicks, no events, no location.
// The check code catches files changed by hand or damaged in copying; it is
// not a password and not encryption.

export const EXPLORER = ['plants', 'animals', 'water', 'foodchain', 'pollution', 'biodiversity', 'climate'];
const SALT = 'ecos-synthetica-report-v1';

async function sha256hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Stable JSON (sorted keys) so the check code does not depend on key order.
function stable(v) {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
  return JSON.stringify(v);
}

// profile: { name, cls, classCode }; pr: progress(profile); sci: the Scientist save (or null)
export function buildPayload(profile, pr, sci) {
  const ex = {};
  for (const id of EXPLORER) { const m = (pr.modules || {})[id]; if (m) ex[id] = m.status === 'done' ? m.stars || 1 : 0; }
  const cases = {};
  for (const [id, c] of Object.entries(pr.cases || {})) cases[id] = c.status === 'done' ? c.stars || 1 : 0;
  const impact = Math.round(Object.values(pr.cases || {}).reduce((s, c) => s + (c.impact || 0), 0));
  return {
    app: 'ecos', v: 1, at: new Date().toISOString().slice(0, 10),
    name: String(profile.name || '').slice(0, 24), cls: profile.cls, code: String(profile.classCode || '').toUpperCase().slice(0, 12),
    ex, seeds: pr.seeds || 0, trees: pr.trees || 0, badges: Object.keys(pr.badges || {}).length,
    sci: sci ? { form: (sci.tier || 0) + 1, done: !!sci.completed } : null,
    pro: cases, impact, journal: (pr.journal || []).length,
  };
}

export async function makeReport(payload) {
  const check = (await sha256hex(SALT + stable(payload))).slice(0, 12);
  return { ...payload, check };
}

// Returns { ok, report, error }: error is 'format' or 'check'.
export async function readReport(text) {
  let r;
  try { r = typeof text === 'string' ? JSON.parse(text.trim()) : text; } catch (e) { return { ok: false, error: 'format' }; }
  if (!r || r.app !== 'ecos' || r.v !== 1 || typeof r.name !== 'string') return { ok: false, error: 'format' };
  const { check, ...payload } = r;
  const want = (await sha256hex(SALT + stable(payload))).slice(0, 12);
  return want === check ? { ok: true, report: r } : { ok: false, report: r, error: 'check' };
}

// Class table: one row per student (latest report wins when a student sends twice).
export function classTable(reports, classCode = '') {
  const code = String(classCode || '').toUpperCase();
  const byName = new Map();
  for (const r of reports) {
    if (code && r.code !== code) continue;
    const key = `${r.name.trim().toLowerCase()}|${r.cls}`;
    const old = byName.get(key);
    if (!old || r.at >= old.at) byName.set(key, r);
  }
  const rows = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  const caseIds = [...new Set(rows.flatMap((r) => Object.keys(r.pro || {})))].sort();
  const totals = {
    students: rows.length,
    trees: rows.reduce((s, r) => s + (r.trees || 0), 0),
    seeds: rows.reduce((s, r) => s + (r.seeds || 0), 0),
    explorerDone: rows.filter((r) => EXPLORER.every((id) => (r.ex || {})[id] > 0)).length,
    impact: rows.reduce((s, r) => s + (r.impact || 0), 0),
    moduleDone: Object.fromEntries(EXPLORER.map((id) => [id, rows.filter((r) => (r.ex || {})[id] > 0).length])),
  };
  return { rows, caseIds, totals };
}

export function toCSV(table) {
  const head = ['name', 'class', 'code', 'date', ...EXPLORER, 'trees', 'seeds', 'badges', 'scientist_form', 'scientist_done', ...table.caseIds, 'impact', 'journal'];
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [head.join(',')];
  for (const r of table.rows) {
    lines.push([r.name, r.cls, r.code, r.at, ...EXPLORER.map((id) => (r.ex || {})[id] ?? ''), r.trees, r.seeds, r.badges,
      r.sci ? r.sci.form : '', r.sci ? (r.sci.done ? 1 : 0) : '', ...table.caseIds.map((id) => (r.pro || {})[id] ?? ''), r.impact, r.journal].map(q).join(','));
  }
  return lines.join('\n');
}

// Teacher unlock code: opens a tier for every student with this class code.
export async function unlockCode(classCode, tier) {
  const h = await sha256hex(`ecos-unlock|${String(classCode || '').toUpperCase().trim()}|${tier}`);
  return h.slice(0, 6).toUpperCase();
}
export async function checkUnlock(classCode, code) {
  const c = String(code || '').toUpperCase().trim();
  for (const tier of ['scientist', 'professional']) if (c && c === (await unlockCode(classCode, tier))) return tier;
  return null;
}
