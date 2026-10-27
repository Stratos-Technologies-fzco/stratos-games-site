// Connect.js - optional school server: progress sync and the live AI tutor.
// Both are OFF until a student turns them on with a class code. Without a
// server, or when it cannot be reached, the game works exactly as offline:
// progress stays on the device and the offline Mentor answers.
import { addStrings, tr } from './strings.js';
import { activeProfile, progress, saveProfiles, saveKeyFor, EXPLORER_MODULES } from './Profile.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (id) => document.getElementById(id);
const conn = (p) => { p.connect = p.connect || { url: '', ai: false, sync: false, token: '', classId: null, lastSync: '' }; return p.connect; };
const base = (c) => (c.url || location.origin).replace(/\/+$/, '') + '/api/v1';

async function call(c, method, path, body, ms = 15000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(base(c) + path, {
      method, signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', ...(c.token ? { Authorization: 'Bearer ' + c.token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: null };
  } finally { clearTimeout(timer); }
}

// Module results only, the same rows the school table shows.
export function progressRows(p) {
  const pr = progress(p);
  const rows = [];
  for (const id of EXPLORER_MODULES) { const m = pr.modules[id]; if (m) rows.push({ moduleId: 'ex_' + id, status: m.status, stars: m.stars || 0, bestScore: m.best || 0 }); }
  for (const [id, c] of Object.entries(pr.cases || {})) rows.push({ moduleId: 'pro_' + id, status: c.status, stars: c.stars || 0, bestScore: c.best || 0 });
  let s = null;
  try { s = JSON.parse(localStorage.getItem(saveKeyFor(p)) || 'null'); } catch (e) { s = null; }
  if (s) rows.push({ moduleId: 'sci_forms', status: s.completed ? 'done' : 'tried', stars: s.completed ? 3 : 0, bestScore: s.completed ? 1 : ((s.tier || 0) + 1) / 4 });
  return rows;
}

export async function syncNow(p = activeProfile()) {
  if (!p) return { ok: false };
  const c = conn(p);
  if (!c.sync || !c.token) return { ok: false, skipped: true };
  const r = await call(c, 'PUT', '/progress', progressRows(p));
  if (r.ok) { c.lastSync = new Date().toISOString(); saveProfiles(); }
  return r;
}

// The live model bridge used by Mentor.js. Returns null on any problem, so the offline answer is used.
const bridge = {
  async ask({ text, concepts, register, lang }) {
    const p = activeProfile();
    if (!p) return null;
    const c = conn(p);
    if (!c.ai || !c.token) return null;
    const L = (o) => (o && (o[lang] || o.en)) || '';
    const r = await call(c, 'POST', '/mentor/ask', {
      question: text, register, lang,
      concepts: concepts.map((k) => ({ id: k.id, title: L(k.title), text: L(k[register]) || L(k.scientist), source: k.source })),
    }, 30000);
    return r.ok && r.data && r.data.answer ? { answer: r.data.answer, source: (r.data.sources || []).join('; '), register } : null;
  },
};
export const llm = {
  attach(mentor) { const p = activeProfile(); if (p && conn(p).ai && conn(p).token) mentor.bridge = bridge; },
};

addStrings({
  en: {
    'sv.button': 'School server', 'sv.title': 'School server (optional)',
    'sv.lead': 'Only if your school runs the Ecos-Synthetica school server. Without it the game works fully offline.',
    'sv.url': 'Server address', 'sv.urlPh': 'leave empty if the game was opened from the school server', 'sv.classCode': 'Class code',
    'sv.join': 'Join class', 'sv.joined': 'Joined. Your results can now be synced.', 'sv.badCode': 'That class code is not on this server.',
    'sv.noServer': 'Could not reach the school server. Everything keeps working offline.',
    'sv.sync': 'Sync my results (stars and scores only)', 'sv.ai': 'Live AI tutor for Eco Scientist and Eco Professional (answers from checked notes)',
    'sv.syncNow': 'Sync now', 'sv.synced': 'Synced {n} results.', 'sv.last': 'Last sync: {t}', 'sv.aiOff': 'The live AI is not switched on at this school; the offline tutor answers.',
    'sv.leave': 'Leave class',
  },
  hi: {
    'sv.button': 'स्कूल सर्वर', 'sv.title': 'स्कूल सर्वर (वैकल्पिक)',
    'sv.lead': 'केवल तब जब आपका स्कूल इको-सिंथेटिका स्कूल सर्वर चलाता हो। इसके बिना खेल पूरी तरह ऑफ़लाइन चलता है।',
    'sv.url': 'सर्वर का पता', 'sv.urlPh': 'खाली छोड़ें यदि खेल स्कूल सर्वर से खोला गया है', 'sv.classCode': 'कक्षा कोड',
    'sv.join': 'कक्षा से जुड़ें', 'sv.joined': 'जुड़ गए। अब आपके परिणाम सिंक हो सकते हैं।', 'sv.badCode': 'यह कक्षा कोड इस सर्वर पर नहीं है।',
    'sv.noServer': 'स्कूल सर्वर तक नहीं पहुँच सके। सब कुछ ऑफ़लाइन चलता रहेगा।',
    'sv.sync': 'मेरे परिणाम सिंक करें (केवल सितारे और अंक)', 'sv.ai': 'इको साइंटिस्ट और इको प्रोफ़ेशनल के लिए लाइव AI शिक्षक (जाँचे नोट्स से उत्तर)',
    'sv.syncNow': 'अभी सिंक करें', 'sv.synced': '{n} परिणाम सिंक हुए।', 'sv.last': 'पिछला सिंक: {t}', 'sv.aiOff': 'इस स्कूल में लाइव AI चालू नहीं है; ऑफ़लाइन शिक्षक उत्तर देता है।',
    'sv.leave': 'कक्षा छोड़ें',
  },
  bn: {
    'sv.button': 'স্কুল সার্ভার', 'sv.title': 'স্কুল সার্ভার (ঐচ্ছিক)',
    'sv.lead': 'শুধু যদি তোমার স্কুল ইকো-সিন্থেটিকা স্কুল সার্ভার চালায়। এটি ছাড়া খেলা পুরোপুরি অফলাইনে চলে।',
    'sv.url': 'সার্ভারের ঠিকানা', 'sv.urlPh': 'খেলা স্কুল সার্ভার থেকে খোলা হলে ফাঁকা রাখো', 'sv.classCode': 'ক্লাস কোড',
    'sv.join': 'ক্লাসে যোগ দাও', 'sv.joined': 'যোগ দেওয়া হয়েছে। এখন তোমার ফল সিঙ্ক করা যাবে।', 'sv.badCode': 'এই ক্লাস কোড এই সার্ভারে নেই।',
    'sv.noServer': 'স্কুল সার্ভারে পৌঁছানো গেল না। সব কিছু অফলাইনে চলতে থাকবে।',
    'sv.sync': 'আমার ফল সিঙ্ক করো (শুধু তারা আর স্কোর)', 'sv.ai': 'ইকো সায়েন্টিস্ট আর ইকো প্রফেশনালের জন্য লাইভ AI শিক্ষক (যাচাই করা নোট থেকে উত্তর)',
    'sv.syncNow': 'এখনই সিঙ্ক করো', 'sv.synced': '{n}টি ফল সিঙ্ক হয়েছে।', 'sv.last': 'শেষ সিঙ্ক: {t}', 'sv.aiOff': 'এই স্কুলে লাইভ AI চালু নেই; অফলাইন শিক্ষক উত্তর দেয়।',
    'sv.leave': 'ক্লাস ছেড়ে দাও',
  },
});

export function addServerButton(shell) {
  shell.addFooter((foot, p) => {
    if (!p) return;
    foot.insertAdjacentHTML('beforeend', `<button class="btn" id="btnServer">🏫 ${esc(tr('sv.button'))}</button>`);
    $('btnServer').onclick = () => openServer(shell, p);
    // Quiet background sync when it is on (never blocks play).
    if (conn(p).sync && conn(p).token) syncNow(p);
  });
}

function openServer(shell, p) {
  const c = conn(p);
  const joined = !!c.token;
  shell.openModal(`<header><h2>${esc(tr('sv.title'))}</h2><button class="x" id="svClose">${esc(tr('common.close'))}</button></header>
    <div class="scroll profile-form"><p>${esc(tr('sv.lead'))}</p>
      <label>${esc(tr('sv.url'))}<input id="svUrl" value="${esc(c.url)}" placeholder="${esc(tr('sv.urlPh'))}" autocomplete="off" inputmode="url"></label>
      ${joined ? '' : `<label>${esc(tr('sv.classCode'))}<input id="svCode" maxlength="12" autocomplete="off" value="${esc(p.classCode || '')}"></label>
      <div class="sheet-actions"><button class="btn primary" id="svJoin">${esc(tr('sv.join'))}</button></div>`}
      ${joined ? `<label class="sv-check"><input type="checkbox" id="svSync" ${c.sync ? 'checked' : ''}> ${esc(tr('sv.sync'))}</label>
      <label class="sv-check"><input type="checkbox" id="svAi" ${c.ai ? 'checked' : ''}> ${esc(tr('sv.ai'))}</label>
      <div class="sheet-actions"><button class="btn primary" id="svSyncNow">${esc(tr('sv.syncNow'))}</button><button class="btn" id="svLeave">${esc(tr('sv.leave'))}</button></div>
      ${c.lastSync ? `<p class="path-note">${esc(tr('sv.last', { t: new Date(c.lastSync).toLocaleString() }))}</p>` : ''}` : ''}
      <p id="svMsg" aria-live="polite"></p></div>`);
  const msg = (k, v) => { $('svMsg').textContent = tr(k, v); };
  const keepUrl = () => { c.url = $('svUrl').value.trim(); saveProfiles(); };
  $('svClose').onclick = () => shell.closeModal();
  if ($('svJoin')) {
    $('svJoin').onclick = async () => {
      keepUrl();
      const code = $('svCode').value.trim().toUpperCase();
      const r = await call(c, 'POST', '/auth/join', { classCode: code, displayName: p.name });
      if (r.status === 0) return msg('sv.noServer');
      if (!r.ok) return msg('sv.badCode');
      c.token = r.data.token; c.classId = r.data.classId; p.classCode = code;
      saveProfiles();
      openServer(shell, p);
      msg('sv.joined');
    };
  }
  if ($('svSync')) {
    $('svSync').onchange = () => { c.sync = $('svSync').checked; saveProfiles(); };
    $('svAi').onchange = async () => {
      c.ai = $('svAi').checked; saveProfiles();
      if (c.ai) { const h = await call(c, 'GET', '/health'); if (!h.ok) msg('sv.noServer'); else if (!h.data.ai) msg('sv.aiOff'); }
    };
    $('svSyncNow').onclick = async () => {
      keepUrl();
      if (!c.sync) { c.sync = true; $('svSync').checked = true; saveProfiles(); }
      const r = await syncNow(p);
      if (r.ok) msg('sv.synced', { n: r.data.saved }); else msg('sv.noServer');
    };
    $('svLeave').onclick = () => { Object.assign(c, { token: '', classId: null, sync: false, ai: false, lastSync: '' }); saveProfiles(); openServer(shell, p); };
  }
}

