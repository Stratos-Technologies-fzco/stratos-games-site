// daily.js - a reason to come back: one nature question a day on the path
// screen, with a gentle streak (a missed day starts a new streak; the best
// streak is kept). The question comes from the player's own class pack.
import { addStrings, tr } from './strings.js';
import { progress, saveProgress } from './Profile.js';
import { bankItems } from '../Quiz.js';
import { track } from './hooks.js';
import { getLang } from '../i18n.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

addStrings({
  en: { 'dy.title': "Today's nature question", 'dy.streak': '🔥 {n}-day streak', 'dy.best': 'Best {n}', 'dy.come': 'A new question every day. Come back tomorrow to grow your streak.',
    'dy.right': 'Right!', 'dy.wrong': 'Not quite. Answer: {a}', 'dy.done': 'Done for today. See you tomorrow!', 'dy.en': '(in English)' },
  hi: { 'dy.title': 'आज का प्रकृति प्रश्न', 'dy.streak': '🔥 {n} दिन लगातार', 'dy.best': 'सर्वश्रेष्ठ {n}', 'dy.come': 'हर दिन नया प्रश्न। लगातार दिन बढ़ाने के लिए कल फिर आएँ।',
    'dy.right': 'सही!', 'dy.wrong': 'ठीक नहीं। उत्तर: {a}', 'dy.done': 'आज का पूरा हुआ। कल मिलते हैं!', 'dy.en': '(अंग्रेज़ी में)' },
  bn: { 'dy.title': 'আজকের প্রকৃতি-প্রশ্ন', 'dy.streak': '🔥 টানা {n} দিন', 'dy.best': 'সেরা {n}', 'dy.come': 'প্রতিদিন নতুন প্রশ্ন। টানা দিন বাড়াতে কাল আবার এসো।',
    'dy.right': 'ঠিক!', 'dy.wrong': 'ঠিক হয়নি। উত্তর: {a}', 'dy.done': 'আজকের হয়ে গেছে। কাল দেখা হবে!', 'dy.en': '(ইংরেজিতে)' },
});

const packs = {};
async function questionFor(p) {
  const cls = Math.max(1, Math.min(12, p.cls || 5));
  const url = cls <= 10 ? `content/questions/explorer/class-${cls}.json` : 'content/questions/scientist/form-0.json';
  if (!packs[url]) packs[url] = fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  let list = await packs[url];
  if (cls > 10) list = list.filter((q) => q.cls >= 11);
  if (!list.length) return null;
  const pick = list[hash(dayKey() + '|' + cls + '|' + p.id) % list.length];
  return bankItems([pick], 1)[0] || null;
}

function state(p) {
  const pr = progress(p);
  pr.daily = pr.daily || { last: '', streak: 0, best: 0 };
  return pr.daily;
}

export function addDaily(shell) {
  shell.addFooter(async (foot, p) => {
    if (!p) return;
    const box = document.createElement('section');
    box.className = 'daily';
    foot.parentElement.insertBefore(box, foot.parentElement.querySelector('.path-cards'));
    const s = state(p);
    const today = dayKey();
    const head = () => `<div class="daily-head"><h2>${esc(tr('dy.title'))}</h2>${s.streak ? `<span class="daily-streak">${esc(tr('dy.streak', { n: s.streak }))} · ${esc(tr('dy.best', { n: s.best }))}</span>` : ''}</div>`;
    if (s.last === today) { box.innerHTML = `${head()}<p>${esc(tr('dy.done'))}</p>`; return; }
    const q = await questionFor(p);
    if (!q) { box.remove(); return; }
    box.innerHTML = `${head()}<p class="daily-q" lang="en">${esc(q.q)} <span class="path-note small">${getLang() !== 'en' ? esc(tr('dy.en')) : ''}</span></p>
      <div class="daily-opts">${q.opts.map((o, i) => `<button class="btn" data-i="${i}" lang="en">${esc(o)}</button>`).join('')}</div><p class="path-note small">${esc(tr('dy.come'))}</p>`;
    track('level_start', { mode: 'daily' });
    box.querySelectorAll('[data-i]').forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.i);
        s.streak = s.last === yesterday() ? s.streak + 1 : 1;
        s.best = Math.max(s.best || 0, s.streak);
        s.last = today;
        saveProgress(p);
        track('level_complete', { mode: 'daily', correct: i === q.ans, streak: s.streak });
        box.innerHTML = `${head()}<p class="daily-q" lang="en">${esc(q.q)}</p>
          <p class="feedback ${i === q.ans ? 'good' : 'bad'}">${esc(i === q.ans ? tr('dy.right') : tr('dy.wrong', { a: q.opts[q.ans] }))}${q.why ? ` <span lang="en">${esc(q.why)}</span>` : ''}</p><p>${esc(tr('dy.done'))}</p>`;
      };
    });
  });
}
