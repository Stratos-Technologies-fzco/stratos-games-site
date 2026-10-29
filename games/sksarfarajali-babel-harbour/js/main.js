import { S, save, load, resetAll, track, storageBlocked, todayStr, dayNumber, msToNextDay, fmtCountdown, fmtDateLong, fmtWeekday, weekId } from './store.js';
import { LANGS, BUILDINGS, STAMP_ROUNDS, REWARD, wordCount, loadLang, dockLabel } from './engine.js';
import * as G from './game.js';
import { Sound } from './audio.js';
import { icon, ship, sailboat, wave, gull, lighthouseLogo, building, buildingScene, harbourScene, stamp, leaveShip, sparkle } from './art.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (n) => Number(n).toLocaleString('en-GB');
const wait = (ms) => new Promise((r) => setTimeout(r, S.profile.reducedMotion ? Math.min(ms, 60) : ms));

const screenEl = $('#screen'), ov1 = $('#ov1'), ov2 = $('#ov2'), toastEl = $('#toasts');
let view = { name: 'welcome' };
let R = null;            // the round being played
let SUM = null;          // summary of the round just finished
let flash = null;        // transient feedback inside a round
let ppHelp = '';         // passport help text
let justFinished = false;
let loadedDay = todayStr();
let lastFocus = null;
let arrived = false;     // the ship slides in once per round
let justSorted = null;   // dock that just received a crate

// ------------------------------------------------------------------ helpers
function applySettings() {
  const h = document.documentElement, p = S.profile;
  h.classList.toggle('rm', !!p.reducedMotion);
  h.classList.toggle('hc', !!p.contrast);
  h.classList.toggle('ts1', p.textSize === 1);
  h.classList.toggle('ts2', p.textSize === 2);
}
function toast(msg) {
  toastEl.innerHTML = '';
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  toastEl.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}
function go(name, params = {}) {
  view = { name, ...params };
  Sound.setMood(name === 'harbour' || name === 'building' ? 'market' : (R && R.mode === 'daily' && name === 'round') ? 'night' : 'day');
  render();
}
function openOv(el, html, focusSel) {
  if (el === ov1 || !ov1.innerHTML) lastFocus = document.activeElement;
  el.innerHTML = html;
  const f = $(focusSel || '[data-autofocus]', el);
  if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
}
function closeOv(el) {
  el.innerHTML = '';
  if (el === ov2 && ov1.innerHTML) { const f = $('[data-autofocus]', ov1); if (f) f.focus(); }
  else if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) {} }
}
const pill = (ic, text, aria, cls = '') => `<span class="pill ${cls}" aria-label="${aria}">${ic}${text}</span>`;
const tabbar = (cur) => `<nav class="tabbar" aria-label="Main">
  ${[['play', 'Play', icon.anchor()], ['harbour', 'Harbour', icon.home()], ['passport', 'Passport', icon.passport()]].map(([k, l, ic]) => `<button data-act="tab" data-tab="${k}" ${cur === k ? 'aria-current="page"' : ''}>${ic}${l}</button>`).join('')}</nav>`;
const heartsHtml = (n) => `<span class="hearts" role="img" aria-label="Hearts: ${n} of 3">${[0, 1, 2].map((i) => icon.heart(20, i < n)).join('')}</span>`;

// ------------------------------------------------------------------ screens
function welcomeView() {
  return `<div class="screen welcome">
    <div class="skyband"></div><div class="sun"></div>
    <div class="gull" style="top:150px;left:56px">${gull(40)}</div><div class="gull" style="top:196px;left:110px;animation-delay:-3s">${gull(28)}</div>
    <div class="logo">${lighthouseLogo()}<h1>Babel<br>Harbour</h1></div>
    ${wave('#0B2238', 60).replace('class="wave"', 'class="wave" style="height:60px;top:calc(60% - 30px)"')}
    <div class="sea-water" aria-hidden="true"><i style="top:30%"></i><i style="top:55%;animation-delay:-2s;width:70%"></i><i style="top:80%;animation-delay:-4s"></i></div>
    <div class="cta">
      <p class="tagline">Sort the words. Spot the false friends.</p>
      <p class="sub">A calm daily word puzzle. No sign-up, no download.</p>
      <button class="btn ghost" data-act="demo">${icon.play(16, '#F5ECD9')}Watch demo</button>
      <button class="btn" data-act="welcome-play" data-autofocus>${icon.play(22)}Play</button>
    </div></div>`;
}

function dailyArt() {
  return `<svg class="scene" viewBox="0 0 350 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><circle cx="290" cy="38" r="18" fill="#E9B949"/>
    ${[112, 150, 188].map((x) => `<rect x="${x}" y="40" width="34" height="26" rx="4" fill="#D9A86C" stroke="#9C6B3A" stroke-width="2"/>`).join('')}
    ${[131, 169].map((x) => `<rect x="${x}" y="16" width="34" height="24" rx="4" fill="#C79558" stroke="#9C6B3A" stroke-width="2"/>`).join('')}
    <path d="M84 66 H262 L240 98 H106 Z" fill="#E8735A"/><rect x="84" y="62" width="178" height="6" rx="2" fill="#F5ECD9"/>
    <path d="M0 100 C30 90 60 90 90 100 S150 110 180 100 S250 90 350 100 V120 H0 Z" fill="#10304F"/></svg>`;
}

function homeView() {
  const done = G.dailyDone(), eff = G.effectiveStreak(), saved = S.round_in_progress;
  const late = !done && eff > 0 && msToNextDay() < 6 * 3600e3;
  const nb = G.nextBuildings()[0];
  const h = new Date().getHours();
  const greet = h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
  const stale = loadedDay !== todayStr();
  const n = G.dailyCount();
  const dayNo = dayNumber();
  let btn;
  if (done) btn = `<button class="btn done" data-act="daily-result" data-date="${done.date}">See result</button>`;
  else if (saved && saved.mode === 'daily') btn = `<button class="btn" data-act="continue" data-autofocus>${icon.play()}Continue your ship</button>`;
  else btn = `<button class="btn" data-act="daily" data-autofocus>${icon.play()}Set sail</button>`;
  return `<div class="screen home">
    <header>
      <div class="chips">
        ${pill(icon.flame(20, late ? '#E9A23B' : '#E8735A', late ? '#9A6410' : '#B94E39'), eff, late ? `Streak: ${eff} days, at risk` : `Streak: ${eff} days`, late ? 'late' : '')}
        ${pill(icon.coin(), num(S.progress.coins), `Coins: ${S.progress.coins}`)}
      </div>
      <div style="display:flex"><button class="iconbtn plain" data-act="mute" aria-label="${S.profile.music || S.profile.sfx ? 'Mute all sound' : 'Turn sound on'}">${icon.speaker(24, S.profile.music || S.profile.sfx)}</button>
      <button class="iconbtn plain" data-act="settings" aria-label="Settings">${icon.gear()}</button></div>
    </header>
    <div class="scroll">
      <div class="pad" style="padding-top:4px"><h1>${greet}, harbour master</h1>
        <p class="muted" style="font-size:.95rem;margin-top:4px">${done ? 'Today’s ship has sailed.' : 'A new ship is waiting at the dock.'}${navigator.onLine ? '' : ' <span class="offline">Offline</span>'}</p></div>
      ${saved ? `<div class="banner" role="group"><span>Continue your ship?</span><button data-act="continue">Continue</button></div>` : ''}
      ${stale ? `<div class="banner"><span>A new harbour is waiting</span><button data-act="refresh-day">Refresh</button></div>` : ''}
      <section class="daily" aria-label="Daily Harbour">
        <div class="art">${dailyArt()}<span class="tag">Daily Harbour #${dayNo}</span></div>
        <div class="body">
          <div class="row"><h2>${done ? 'Done for today' : 'Play today’s harbour'}</h2><span class="small">${done ? `${done.first}/${done.total} first try` : `${n} crates`}</span></div>
          <p class="small">${done ? 'Done, next in' : 'Same crates for everyone today. Ends in'} <b class="cd">${fmtCountdown(msToNextDay())}</b></p>
          ${btn}
        </div>
      </section>
      <button class="rowcard" data-act="freesail">
        <span class="ic">${icon.anchor()}</span>
        <span class="tx"><b>Free Sail</b><span>Unlimited rounds, your pick of languages</span></span>${icon.chevron()}
      </button>
      <button class="rowcard" data-act="demo"><span class="ic">${icon.bulb()}</span><span class="tx"><b>How to play</b><span>Watch a short demo</span></span>${icon.chevron()}</button>
      <div class="minis">
        <div><div class="k">Hints today</div><div class="v">${S.progress.hints.left} left</div></div>
        <div><div class="k">Next unlock</div><div class="v">${nb ? esc(nb.short) : 'All built'}</div></div>
      </div>
      <div style="height:18px"></div>
    </div>${tabbar('play')}</div>`;
}

function freeSailView() {
  const sel = view.langs, diff = view.diff;
  const langRows = Object.entries(LANGS).map(([k, l]) => {
    const open = S.progress.unlocked[k];
    if (open) {
      const on = sel.includes(k), wc = wordCount(k);
      return `<button class="opt ${on ? 'on' : ''}" role="checkbox" aria-checked="${on}" data-act="pick-lang" data-lang="${k}"><span class="code">${l.code}</span><span class="t"><b>${l.name}</b><span>${wc ? wc + ' words' : 'Ready to sail'}</span></span><span class="cb">${on ? icon.check(18, '#fff', 3.4) : ''}</span></button>`;
    }
    if (l.soon) return '';
    return `<div class="opt locked" aria-label="${l.name}, locked. Build the ${esc(BUILDINGS[l.building].short)} to unlock"><span class="code">${l.code}</span><span class="t"><b>${l.name}</b><span>Build the ${esc(BUILDINGS[l.building].short)} to unlock</span></span>${icon.lock()}</div>`;
  }).join('');
  const D = [['easy', 'Easy', 'More look-alikes that mean the same'], ['mixed', 'Mixed', 'A bit of everything'], ['tricky', 'Tricky', 'Mostly false friends']];
  return `<div class="screen">
    <div class="pagehead"><button class="iconbtn plain" data-act="home" aria-label="Back">${icon.back()}</button><h1>Free Sail</h1></div>
    <div class="scroll">
      <p class="lead">Unlimited rounds from the languages you choose. Pays fewer coins than the Daily Harbour.</p>
      <h2 class="sect">Languages</h2><div class="opts" role="group" aria-label="Languages">${langRows}</div>
      <h2 class="sect">Difficulty</h2>
      <div class="diffs" role="radiogroup" aria-label="Difficulty">${D.map(([k, n, d]) => `<button class="diff ${diff === k ? 'on' : ''}" role="radio" aria-checked="${diff === k}" data-act="pick-diff" data-diff="${k}"><span class="radio"></span><b>${n}</b><span>${d}</span></button>`).join('')}</div>
    </div>
    <div class="bottom"><span>Words from your last few rounds are skipped.</span><button class="btn" data-act="free-start" ${sel.length ? '' : 'disabled'}>Start</button></div></div>`;
}

function roundView() {
  const c = G.cur(R), n = G.total(R), tut = R.mode === 'tutorial';
  const sortedN = Object.keys(R.sorted).length;
  const title = tut ? 'Tutorial' : R.mode === 'daily' ? `Daily Harbour #${R.dayNo}` : 'Free Sail';
  const upcoming = R.ids.slice(R.idx + 1).map((id) => R.W[id]);
  const small = tut
    ? '<div class="crate small" aria-hidden="true" style="opacity:.85;background:#C79558"></div>'.repeat(Math.min(2, upcoming.length))
    : upcoming.slice(0, 3).map((w) => `<div class="crate small" aria-label="Crate: ${esc(w.word)}, ${LANGS[w.lang].name}">${esc(w.word)}</div>`).join('');
  const more = !tut && upcoming.length > 3 ? `<div class="more" aria-label="${upcoming.length - 3} more crates below deck">+${upcoming.length - 3}</div>` : '';
  const stale = R.mode === 'daily' && R.date !== todayStr();
  const bubbles = ['Drag the crate to the dock that shows what it <b>really</b> means. Or tap the crate, then a dock.', 'Another one. Same idea: find the dock with its true meaning.', 'This one looks like an English word. Does it mean the same? Think before you drop.'];
  const head = tut
    ? `<div class="rhead" style="justify-content:space-between"><span class="head" style="font-size:1.125rem">Tutorial</span><span class="ttl">Crate ${R.idx + 1} of ${n}</span></div>
       <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${sortedN}" aria-label="Crates sorted" style="margin-top:12px"><i style="width:${Math.max(12, sortedN / n * 100)}%"></i></div>
       <div class="bubble">${bubbles[R.idx]}</div>`
    : `<header class="rhead">
        <button class="iconbtn" data-act="leave" aria-label="Leave round">${icon.close()}</button>
        <div class="mid"><span class="ttl">${title} · Crate ${R.idx + 1} of ${n}</span>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${sortedN}" aria-label="Crates sorted"><i style="width:${sortedN / n * 100}%"></i></div></div>
        ${heartsHtml(R.hearts)}
        <span class="flame" aria-label="Streak: ${G.effectiveStreak()} days">${icon.flame(18)}${G.effectiveStreak()}</span></header>`;
  const long = c.word.length > 8;
  const hintLeft = S.progress.hints.left;
  const statusMsg = flash && flash.msg ? flash.msg : `${c.word} is picked up. Drag it, or tap a dock.`;
  const nudge = R.ruled.length && !R.hintsUsedThis && R.tries >= 2 && hintLeft > 0;
  const docks = R.docks.map((d) => {
    const sortedBy = R.sorted[d.id], ruled = R.ruled.includes(d.id);
    const sh = flash && flash.dock === d.id ? ' shake' : '';
    if (sortedBy) {
      const w = R.W[sortedBy];
      return `<div class="dock sorted${justSorted === d.id ? ' new' : ''}" aria-label="Dock: ${esc(d.label)}, sorted: ${esc(w.word)}"><span>${esc(d.label)}</span><span class="chip">${icon.check(14)}${esc(w.word)}</span></div>`;
    }
    if (ruled) return `<button class="dock ruled${sh}" aria-disabled="true" aria-label="Dock: ${esc(d.label)}, ruled out" data-act="noop"><span>${esc(d.label)}</span><small>Not this one</small></button>`;
    const sug = tut && (R.idx < 2 || R.tries >= 1) && d.owner === c.id;
    return `<button class="dock${sug ? ' suggest' : ''}${sh}" data-act="dock" data-dock="${d.id}" aria-label="Dock: ${esc(d.label)}${sug ? ', suggested' : ''}"><span>${esc(d.label)}</span>${sug ? '<span class="drop">Drop here</span>' : ''}</button>`;
  }).join('');
  return `<div class="screen round">
    <div class="sea ${tut ? 'tut' : ''}">${head}
      <div class="deck"><div class="ship-wrap ${arrived ? '' : 'arriving'}">
        <button class="crate main ${long ? 'long' : ''} ${flash && flash.bounce ? 'bounce' : ''}" data-crate aria-label="Crate: ${esc(c.word)}, ${LANGS[c.lang].name}, selected">${esc(c.word)}<span class="lang">${LANGS[c.lang].code}</span></button>
        <div class="rowc">${small}${more}</div>${ship()}</div></div>
      ${wave('#F5ECD9')}
    </div>
    ${stale ? `<div class="banner" style="margin-top:10px">A new harbour is waiting. This one still counts for its own day.</div>` : ''}
    <p role="status" aria-live="polite" class="status ${flash && flash.msg && !flash.info ? 'bad' : ''}">${flash && flash.msg && !flash.info ? icon.cross(14) : flash && flash.info ? icon.bulb(16) : ''}${esc(statusMsg)}</p>
    <div class="scroll">${tut ? '<h2 class="tuthd" style="margin-top:6px">Docks</h2>' : ''}<div class="docks ${tut ? 'list' : ''}" style="${tut ? 'margin:0 20px;gap:12px' : ''}">${docks}</div>${tut ? '<p class="tutnote">No hearts to lose in the tutorial. Take your time.</p>' : ''}</div>
    ${tut ? '' : `<div class="hintbar"><button class="hintbtn ${nudge ? 'nudge' : ''}" data-act="hint" ${hintLeft <= 0 ? 'disabled' : ''} aria-label="Hint, ${hintLeft} left">${icon.bulb()}Hint ${hintLeft > 0 ? `<span class="n">${hintLeft} left</span>` : `<span class="n">Refill <span class="cd">${fmtCountdown(msToNextDay())}</span></span>`}</button></div>`}
  </div>`;
}

function revealHtml(c, res, final) {
  const tut = R.mode === 'tutorial';
  const T = { false_friend: 'False friend', cognate: 'Cognate', partial: 'Partial', cross_language: 'Cross-language' };
  const same = c.type === 'cognate';
  const status = res.tries === 1 ? 'Correct, first try' : res.tries === 2 ? 'Correct, second try' : `Sorted on try ${res.tries}`;
  const explain = [
    'Hotel is a <b>cognate</b>: it looks like English and means the same. Easy ones like this build confidence.',
    'Another cognate. Plenty of words travel between languages unchanged.',
    'This is a <b>false friend</b>: a word that looks like English but means something else. Spotting these is the whole game.',
  ][R.idx];
  return `<div class="scrim"></div>
  <div class="sheet reveal" role="dialog" aria-modal="true" aria-label="Word reveal: ${esc(c.word)}">
    <div class="grab"></div>
    <div class="in">
      <div class="rvtop"><div class="rvres ${res.tries > 2 ? 'bad' : ''}"><span class="okc">${icon.check(18, '#fff', 3.4)}</span>${status}</div>
        ${res.coins ? `<div class="coinchip" aria-label="${res.coins} coins">${icon.coin(24)}+${res.coins}</div>` : ''}</div>
      <div class="rvword"><div class="crate" aria-hidden="true" style="display:flex;align-items:center;justify-content:center">${esc(c.word)}<span class="lang">${LANGS[c.lang].code}</span></div>
        <div class="meta"><span class="tag ${c.type}">${T[c.type]}</span><span class="muted" style="font-size:1.05rem">${LANGS[c.lang].name}${c.gram ? ' · ' + esc(c.gram) : ''}</span></div></div>
      <div class="vs ${same ? 'same' : ''}"><div class="a"><span>Looks like</span><s>${esc(c.trap || c.meaning)}</s></div><div class="b"><span>Really means</span><strong>${esc(c.meaning)}</strong></div></div>
      ${tut ? `<div class="tutexplain">${explain}</div>` : ''}
      ${c.origin ? `<div><div class="lbl">Where it comes from</div><p class="origin">${esc(c.origin)}</p></div>` : ''}
      ${c.say_it ? `<div class="sayit">${icon.speech()}<div><small>To say “${esc(c.trap.replace(/^a /, 'a '))}” in ${LANGS[c.lang].name}</small><b>${esc(c.say_it)}</b></div></div>` : ''}
      <button class="btn" data-act="next-crate" data-autofocus>${final ? (tut ? 'Finish tutorial' : 'Set sail') : 'Next crate'} ${icon.arrow()}</button>
      ${tut ? '' : `<button class="reportlink" data-act="report" data-word="${c.id}">${icon.flag()}Report a mistake in this word</button>`}
    </div></div>`;
}

function summaryView() {
  const s = SUM, free = s.mode === 'free';
  const nb = G.nextBuildings()[0];
  const sparkles = s.first > 0 ? `<span class="sparkle" style="left:16%;top:26%">${sparkle(26)}</span><span class="sparkle" style="right:12%;top:20%;animation-delay:-.6s">${sparkle(34)}</span><span class="sparkle" style="left:8%;top:52%;animation-delay:-1s">${sparkle(16)}</span>` : '';
  return `<div class="screen summary"><div class="scroll">
    <div class="top">${sparkles}<div class="eyebrow">${s.mode === 'daily' ? 'Daily Harbour #' + s.dayNo : 'Free Sail'}</div><h1>Ship sorted!</h1><p>The ship sails off with every crate in place.</p>
      <div class="boat">${sailboat(80)}</div>${wave('#F5ECD9')}</div>
    <div class="pad" style="display:flex;flex-direction:column;gap:14px;padding-top:6px;padding-bottom:20px">
      <div class="stats3"><div class="stat"><b>${s.total}/${s.total}</b><span>Crates sorted</span></div><div class="stat"><b>${s.first}</b><span>First try</span></div><div class="stat"><b>${s.hearts}/3</b><span>Hearts left</span></div></div>
      <div class="card breakdown">${s.lines.map(([l, v]) => `<div class="ln"><span>${esc(l)}</span><b>+${v}</b></div>`).join('')}<hr><div class="tot"><span>Coins earned</span><b>${icon.coin(32)}+${s.earned}</b></div></div>
      ${s.newStamps.map((l) => `<div class="stampnote">${stamp(LANGS[l].code, LANGS[l].stamp, true, 64)}<div><b>${LANGS[l].name} stamp earned</b><span>Added to your passport</span></div></div>`).join('')}
      ${nb ? `<button class="progcard" style="border:0;text-align:left;width:100%" data-act="building" data-id="${nb.id}"><div class="r"><b>${esc(nb.short)} · unlocks ${LANGS[nb.lang].name}</b><span>${num(Math.min(S.progress.coins, nb.cost))} / ${num(nb.cost)}</span></div><div class="bar" aria-hidden="true"><i style="width:${Math.min(100, S.progress.coins / nb.cost * 100)}%"></i></div></button>` : ''}
    </div></div>
    <div class="bottom" style="padding-top:0">
      ${free ? `<button class="btn" data-act="play-again" data-autofocus>Play again</button><button class="linkbtn" data-act="home">Back to Home</button>`
             : `<button class="btn" data-act="daily-result" data-date="${s.date}" data-autofocus>See today's result</button><button class="linkbtn" data-act="home">Back to Home</button>`}
    </div></div>`;
}

const gridText = (d) => d.tries.map((t) => (t === 1 ? '🟩' : t === 2 ? '🟨' : '🟧')).join('');
const GAME_URL = 'https://stratos.games/play/sksarfarajali-babel-harbour/';
const shareText = (d) => `Babel Harbour #${d.dayNo} · ${d.first}/${d.total} · streak ${d.streak}\n${gridText(d)}\n${GAME_URL}`;

function resultView() {
  const d = S.daily_results.find((x) => x.date === view.date);
  if (!d) return homeView();
  const isToday = d.date === todayStr();
  const grace = G.graceLeft();
  const stampLang = (d.newStamps || [])[0];
  let stampCard;
  if (stampLang) stampCard = `<div class="stampnote">${stamp(LANGS[stampLang].code, LANGS[stampLang].stamp, true, 64)}<div><b>${LANGS[stampLang].name} stamp earned</b><span>Shown on your passport and share card</span></div></div>`;
  else {
    const prog = Object.keys(S.progress.unlocked).filter((l) => !S.progress.stamps[l]).map((l) => `${LANGS[l].name} ${S.progress.roundsByLang[l] || 0} of ${STAMP_ROUNDS} rounds`)[0];
    stampCard = `<div class="stampnote">${stamp('★', 'PORT', false, 64).replace('★', '✓')}<div><b>Your passport</b><span>${prog ? `Next stamp: ${prog}` : 'Every available stamp earned'}</span></div></div>`;
  }
  return `<div class="screen result"><div class="scroll">
    <div style="display:flex;justify-content:space-between;align-items:center"><span class="date">${fmtDateLong(d.date)}</span><button class="iconbtn" data-act="home" aria-label="Close">${icon.close()}</button></div>
    <h1>Babel Harbour #${d.dayNo}</h1>
    <p class="sub">${d.first} of ${d.total} crates on the first try</p>
    <div class="squares" role="img" aria-label="Result: ${d.tries.map((t) => (t === 1 ? 'first try' : t === 2 ? 'second try' : 'try ' + t)).join(', ')}">${d.tries.map((t) => `<span class="sq ${t === 2 ? 'g2' : t > 2 ? 'g3' : ''}">${t === 1 ? icon.check(22, '#fff', 3.4) : t}</span>`).join('')}</div>
    <p class="legend">Check = first try · 2 = second try</p>
    ${d.note === 'grace' ? `<div class="banner" style="margin:0">Your weekly grace day kept the streak alive.</div>` : ''}
    <div class="stats3 dark"><div class="stat"><b>${icon.flame(26)}${isToday ? G.effectiveStreak() : d.streak}</b><span>Day streak</span></div><div class="stat"><b>${S.streak.best}</b><span>Best streak</span></div><div class="stat"><b>${grace}</b><span>Grace day left</span></div></div>
    ${stampCard}
    <div class="sharebox"><div class="lbl">What gets shared</div><pre>${esc(shareText(d).replace(GAME_URL, 'stratos.games link'))}</pre><p style="margin-top:4px;color:var(--pale)">Only squares and the link. No words or meanings.</p></div>
    <div style="height:6px"></div></div>
    <div class="foot"><button class="btn" data-act="share" data-date="${d.date}" data-autofocus>${icon.share()}Share result</button>${isToday ? `<span>Next harbour in <b class="cd">${fmtCountdown(msToNextDay())}</b></span>` : ''}</div></div>`;
}

function harbourView() {
  const b = S.progress.buildings, coins = S.progress.coins;
  const slots = [
    ['office', 'left:4%;width:26%;height:34%', true],
    ['cafe', 'left:34%;width:21%', false],
    ['fish', 'left:59.5%;width:21%', false],
    ['lighthouse', 'left:85%;width:12%', false],
  ].map(([id, st, free]) => {
    const B = BUILDINGS[id];
    if (b[id]) return `<button class="slot built" style="${st};height:auto" ${free ? 'data-act="noop"' : `data-act="building" data-id="${id}"`} aria-label="${esc(B.name)}, built">${building(id)}<span class="nm">${esc(B.short)}</span></button>`;
    if (B.soon) return `<button class="slot empty" style="${st}" data-act="building" data-id="${id}" aria-label="${esc(B.name)}, coming soon">${icon.lock(22)}</button>`;
    return `<button class="slot empty" style="${st}" data-act="building" data-id="${id}" aria-label="${esc(B.name)}, ${num(B.cost)} coins">${esc(B.short)}<br>${num(B.cost)}</button>`;
  }).join('');
  const nb = G.nextBuildings();
  const art = { cafe: ['#F8E6B5', icon.cafe(32)], fish: ['#DCE8F4', icon.fish(32)] };
  return `<div class="screen"><div class="scroll">
    <div class="title-row"><h1>Your harbour</h1>${pill(icon.coin(24), num(coins), `Coins: ${coins}`, '')}</div>
    <div class="town">${harbourScene()}${slots}<div class="boat">${sailboat(72)}</div></div>
    <h2 class="sect" style="margin-top:22px">${nb.length ? 'Next to unlock' : 'Every building is built'}</h2>
    <div class="nextlist">${nb.map((x) => `<button class="ncard" data-act="building" data-id="${x.id}"><span class="ic" style="background:${art[x.id][0]}">${art[x.id][1]}</span><span class="tx"><span class="l1"><b>${esc(x.short)}</b><span>${num(Math.min(coins, x.cost))} / ${num(x.cost)}</span></span><span class="l2">Unlocks ${LANGS[x.lang].name}</span><span class="bar" aria-hidden="true"><i style="width:${Math.min(100, coins / x.cost * 100)}%"></i></span></span></button>`).join('')}</div>
  </div>${tabbar('harbour')}</div>`;
}

function buildingView() {
  const id = view.id, B = BUILDINGS[id], L = LANGS[B.lang];
  const built = !!S.progress.buildings[id], coins = S.progress.coins;
  const short = B.cost - coins, pct = Math.min(100, Math.round(coins / (B.cost || 1) * 100));
  let action;
  if (built) action = `<div class="built-note">${icon.check(20, '#2F7A5A')}<span>Built. ${L.name} is unlocked.</span></div><button class="btn ghost" data-act="tab" data-tab="harbour" data-autofocus>Back to the harbour</button>`;
  else if (B.soon) action = `<div class="need">Coming soon. This building arrives after the first release.</div><button class="btn" disabled>${icon.lock(20)} Coming soon</button>`;
  else action = `${short > 0 ? `<div class="need">You need ${num(short)} more coins. The Daily Harbour is the quickest way to earn them.</div>` : ''}
    <button class="btn" data-act="buy" data-id="${id}" ${short > 0 ? 'disabled' : 'data-autofocus'}>${short > 0 ? icon.lock(20) : ''} Buy for ${num(B.cost)}</button>
    ${short > 0 ? `<button class="linkbtn" data-act="daily-from-building" style="align-self:center">Play the Daily Harbour</button>` : ''}`;
  return `<div class="screen"><div class="scroll">
    <div class="bscene ${view.anim ? 'build-anim' : ''}">${buildingScene(id)}
      <button class="iconbtn light back" data-act="tab" data-tab="harbour" aria-label="Back">${icon.back()}</button></div>
    <div class="binfo">
      <div class="nm"><h1>${esc(B.name)}</h1><span class="cost">${icon.coin(30)}${num(B.cost)}</span></div>
      <p class="d">${esc(B.blurb || '')}</p>
      <div class="unl"><span class="code">${L.code}</span><div><b>Unlocks ${L.name}</b><span>In Free Sail right away, in the Daily Harbour from the next day</span></div></div>
      ${built ? '' : `<div><div class="have"><span style="color:var(--ink);font-weight:800">You have ${num(coins)} coins</span><span>${pct}%</span></div><div class="bar" style="background:#E3D6BC" aria-hidden="true"><i style="width:${pct}%"></i></div></div>`}
      ${action}
    </div><div style="height:20px"></div></div></div>`;
}

function passportView() {
  const st = S.progress.stamps, unl = S.progress.unlocked;
  const cells = Object.entries(LANGS).map(([k, l]) => {
    const earned = !!st[k];
    return `<button class="stampbtn ${earned ? '' : 'locked'}" data-act="stamp" data-lang="${k}" aria-label="${l.name} stamp, ${earned ? 'earned' : 'not yet earned'}">${stamp(l.code, l.stamp, earned, 88)}<span>${l.name}</span></button>`;
  });
  cells.splice(5, 0, `<p class="stamphelp" role="status">${esc(ppHelp || 'Tap a stamp to see what it needs')}</p>`);
  cells.length = 6;
  const hist = S.daily_results.slice(-10).reverse();
  const today = todayStr();
  return `<div class="screen"><div class="scroll">
    <div class="title-row"><h1>Passport</h1></div>
    <div class="pp"><div class="stamps">${cells.join('')}</div></div>
    <div class="two"><div><span>Best streak</span><b>${S.streak.best} day${S.streak.best === 1 ? '' : 's'}</b></div><div><span>Words seen</span><b>${S.progress.seen.length}</b></div></div>
    <h2 class="sect">Past daily harbours</h2>
    <div class="hist">${hist.length ? hist.map((d) => `<button class="hrow" data-act="daily-result" data-date="${d.date}"><b>#${d.dayNo} · ${d.date === today ? 'Today' : fmtWeekday(d.date)}</b><span style="display:flex;align-items:center"><span class="mini" aria-hidden="true">${d.tries.map((t) => `<i class="${t === 2 ? 'g2' : t > 2 ? 'g3' : ''}"></i>`).join('')}</span><span class="sc">${d.first}/${d.total}</span></span></button>`).join('') : '<p class="empty">Your finished daily harbours will show up here.</p>'}</div>
  </div>${tabbar('passport')}</div>`;
}

// ------------------------------------------------------------------ sheets & dialogs
function settingsHtml() {
  const p = S.profile;
  const sw = (id, on, label) => `<div class="item"><span id="l-${id}">${label}</span><span class="state" aria-hidden="true">${on ? 'On' : 'Off'}</span><button class="switch" role="switch" aria-checked="${on}" aria-labelledby="l-${id}" data-act="toggle" data-key="${id}"></button></div>`;
  return `<div class="scrim" data-act="close-ov1"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="Settings"><div class="grab" data-swipe></div>
    <div class="in" style="gap:0">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h2>Settings</h2><button class="iconbtn light" data-act="close-ov1" aria-label="Close" data-autofocus>${icon.close()}</button></div>
      <div class="grp">Sound</div><div class="list">${sw('sfx', p.sfx, 'Sound effects')}${sw('music', p.music, 'Music')}</div>
      <div class="grp">Display</div><div class="list">${sw('reducedMotion', p.reducedMotion, 'Reduced motion')}${sw('contrast', p.contrast, 'High contrast')}
        <div class="seg-wrap"><span id="l-ts">Text size</span><div class="seg" role="group" aria-labelledby="l-ts">${['Default', 'Large', 'Larger'].map((n, i) => `<button data-act="textsize" data-n="${i}" aria-pressed="${p.textSize === i}">${n}</button>`).join('')}</div></div></div>
      <div class="grp">Game</div><div class="list">
        <div class="item"><label for="ilang">Interface language</label><select class="sel" id="ilang" data-act="ilang"><option>English</option><option disabled>Deutsch (soon)</option><option disabled>Français (soon)</option><option disabled>Español (soon)</option></select></div>
        <button class="item" data-act="demo-from-settings">Watch the demo ${icon.chevron()}</button>
        <button class="item" data-act="about">About Babel Harbour ${icon.chevron()}</button>
        <button class="item danger" data-act="reset">Reset progress</button></div>
      <p class="fine">Progress is saved on this device only. Clearing your browser data also clears your harbour.</p>
    </div></div>`;
}
const aboutHtml = () => `<div class="scrim" data-act="close-ov2"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="About"><div class="grab"></div><div class="in">
  <h2>About</h2><p class="origin">Babel Harbour is a calm word puzzle about false friends: words that look familiar but mean something else. Free, no ads, no sign-up.</p>
  <p class="origin">Word facts are drafts and are still waiting for native-speaker review. If something looks wrong, use “Report a mistake” on any reveal card.</p>
  <p class="fine">Sounds are made live in your browser, so there are no audio files to download. Fonts: Fredoka and Nunito (SIL Open Font License). Version 1.0 draft.</p>
  <button class="btn ghost" data-act="close-ov2" data-autofocus>Close</button></div></div>`;
const resetHtml = () => `<div class="scrim" data-act="close-ov2"></div><div class="dialog" role="alertdialog" aria-modal="true" aria-label="Reset progress"><h2>Reset progress?</h2>
  <p>This clears your coins, streak, buildings and stamps on this device. Type <b>RESET</b> to confirm.</p>
  <input class="field one" id="resetbox" autocomplete="off" autocapitalize="characters" aria-label="Type RESET to confirm" data-autofocus>
  <button class="btn" id="resetgo" data-act="reset-go" disabled>Reset everything</button><button class="btn ghost" data-act="close-ov2">Cancel</button></div>`;
const leaveHtml = () => {
  const tut = R.mode === 'tutorial', done = Object.keys(R.sorted).length;
  return `<div class="scrim"></div><div class="dialog" role="alertdialog" aria-modal="true" aria-label="Leave this ship?">${leaveShip()}<h2>Leave this ship?</h2>
  <p>${tut ? 'You will see the tutorial again next time.' : `You have sorted ${done} of ${G.total(R)} crates. Your progress is saved, so you can continue the ship later.`}</p>
  <button class="btn" data-act="close-ov2" data-autofocus>Keep sorting</button><button class="btn ghost" data-act="leave-go">Leave for now</button></div>`;
};
const reportHtml = (w) => `<div class="scrim" data-act="close-ov2"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Report a word"><div class="grab" data-swipe></div><div class="in">
  <div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2>Report a word</h2><p class="muted" style="font-size:1.05rem;margin-top:2px">${esc(w.word)} (${LANGS[w.lang].name}) · ${esc(w.meaning)}</p></div><button class="iconbtn light" data-act="close-ov2" aria-label="Close">${icon.close()}</button></div>
  <div role="radiogroup" aria-label="What looks wrong?" style="display:flex;flex-direction:column;gap:10px"><div class="head" style="font-size:1.1rem;font-weight:800;font-family:var(--body)">What looks wrong?</div>
    ${['Wrong meaning', 'Wrong origin', 'Offensive', 'Something else'].map((r, i) => `<button class="radiorow ${i ? '' : 'on'}" role="radio" aria-checked="${!i}" data-act="report-pick" data-reason="${r}"><span class="radio"></span>${r}</button>`).join('')}</div>
  <div><label for="rnote" style="font-weight:800;font-size:1.1rem;display:block;margin-bottom:8px">Add a note (optional)</label><textarea class="field" id="rnote" placeholder="Tell us what you think is right" maxlength="300"></textarea></div>
  <button class="btn" data-act="report-send" data-word="${w.id}">Send report</button>
  <p class="fine" style="text-align:center">Sent with the word only, never your name. Offline? We'll send it later.</p></div></div>`;
const loadErrorHtml = (retryAct) => `<div class="scrim"></div><div class="dialog" role="alertdialog" aria-modal="true"><h2>Couldn't load the words</h2><p>Check your connection and try again. The round starts once the words are ready.</p><button class="btn" data-act="${retryAct}" data-autofocus>Retry</button><button class="btn ghost" data-act="close-ov2">Back</button></div>`;
const tutDoneHtml = () => `<div class="scrim"></div><div class="dialog" role="alertdialog" aria-modal="true" aria-label="Your harbour is open">${leaveShip()}<h2>Your harbour is open</h2><p>Here is a starter gift to get you going.</p><div class="coinchip" style="font-size:1.6rem">${icon.coin(32)}+${REWARD.starter}</div><button class="btn" data-act="tut-done" data-autofocus>Let’s go</button></div>`;

// ------------------------------------------------------------------ render
function render() {
  const v = view.name;
  let html;
  if (v === 'welcome') html = welcomeView();
  else if (v === 'home') html = homeView();
  else if (v === 'freesail') html = freeSailView();
  else if (v === 'round') html = roundView();
  else if (v === 'summary') html = summaryView();
  else if (v === 'result') html = resultView();
  else if (v === 'harbour') html = harbourView();
  else if (v === 'building') html = buildingView();
  else if (v === 'passport') html = passportView();
  screenEl.innerHTML = html;
  if (v === 'round') { arrived = true; justSorted = null; bindCrate(); }
  const f = $('[data-autofocus]', screenEl);
  if (f && !ov1.innerHTML && !ov2.innerHTML && (v === 'welcome' || v === 'summary' || v === 'result')) f.focus({ preventScroll: true });
}

// ------------------------------------------------------------------ round flow
async function startRound(kind, opts = {}) {
  try {
    if (kind === 'tutorial') R = await G.makeTutorial();
    else if (kind === 'daily') R = await G.makeDaily();
    else if (kind === 'free') R = await G.makeFree(opts.langs, opts.diff);
    else R = await G.restoreRound(S.round_in_progress);
  } catch (e) {
    R = null;
    openOv(ov2, loadErrorHtml('retry-' + kind), '[data-autofocus]');
    view._retry = { kind, opts };
    return;
  }
  flash = null; arrived = false;
  if (kind !== 'restore') {
    track(kind === 'tutorial' ? 'tutorial_start' : kind === 'daily' ? 'daily_start' : 'round_start', { mode: kind, languages: R.langs.join(','), difficulty: R.difficulty });
    G.persistRound(R);
  }
  go('round');
  Sound.play('horn');
}

function dockEl(id) { return $(`.dock[data-dock="${id}"]`, screenEl); }

async function trySort(dockId) {
  if (!R || R.busy) return;
  const crateEl = $('[data-crate]', screenEl);
  const dEl = dockEl(dockId);
  const c = G.cur(R);
  R.busy = true;
  const res = G.attempt(R, dockId);
  G.persistRound(R);
  if (res.ok) {
    Sound.play('drop');
    if (!S.profile.reducedMotion && crateEl && dEl) {
      const a = crateEl.getBoundingClientRect(), b = dEl.getBoundingClientRect();
      crateEl.classList.remove('dragging');
      crateEl.classList.add('fly');
      crateEl.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.45)`;
      crateEl.style.opacity = '.2';
    }
    await wait(400);
    flash = null; justSorted = dockId;
    render();
    Sound.play('correct');
    await wait(450);
    showReveal(c, res);
    R.busy = false;
  } else {
    Sound.play('wrong');
    flash = { dock: dockId, bounce: true, msg: res.tries >= 2 && R.mode !== 'tutorial' ? 'Not that one. Stuck? Tap Hint to rule a dock out.' : 'Not that one. Try again.' };
    if (crateEl) { crateEl.style.transform = ''; crateEl.classList.remove('dragging'); }
    render();
    R.busy = false;
    setTimeout(() => { if (flash) { flash.dock = null; flash.bounce = false; } }, 700);
  }
}

function showReveal(c, res) {
  const final = R.idx === G.total(R) - 1;
  Sound.duck(true);
  Sound.play('reveal');
  openOv(ov1, revealHtml(c, res, final));
  if (res.coins) setTimeout(() => Sound.play(res.tries === 1 ? 'coinRich' : 'coin'), 200);
  if (res.tries === 1 && R.mode !== 'tutorial') setTimeout(() => Sound.play('sparkle'), 450);
}

async function nextCrate() {
  if (!R || R.busy) return;
  R.busy = true;
  Sound.duck(false);
  closeOv(ov1);
  const final = R.idx === G.total(R) - 1;
  if (!final) {
    G.nextCrate(R); G.persistRound(R); flash = null;
    R.busy = false;
    render();
    $('[data-crate]', screenEl)?.focus({ preventScroll: true });
    return;
  }
  // last crate: the ship sails, then the summary opens
  $('.ship-wrap', screenEl)?.classList.add('leaving');
  Sound.play('horn');
  await wait(1000);
  if (R.mode === 'tutorial') { R.busy = false; openOv(ov2, tutDoneHtml()); Sound.play('fanfare'); return; }
  SUM = G.finishRound(R);
  justFinished = true;
  R.busy = false;
  go('summary');
  Sound.play(SUM.lines.some(([l]) => /No-mistake/.test(l)) ? 'fanfare' : 'sparkle');
  setTimeout(() => Sound.play('coinRich'), 350);
  if (SUM.newStamps.length) setTimeout(() => Sound.play('stamp'), 900);
}

// ---- drag and drop: pointer events, with tap-a-dock as the fallback ----
function bindCrate() {
  const el = $('[data-crate]', screenEl);
  if (!el) return;
  let sx = 0, sy = 0, drag = false, pid = null, over = null;
  const reset = () => { el.classList.remove('dragging'); el.style.transform = ''; over?.classList.remove('over'); over = null; };
  el.addEventListener('pointerdown', (e) => {
    if (R.busy || e.button > 0) return;
    Sound.unlock();
    sx = e.clientX; sy = e.clientY; drag = false; pid = e.pointerId;
    try { el.setPointerCapture(pid); } catch (err) {}
  });
  el.addEventListener('pointermove', (e) => {
    if (pid === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!drag && Math.hypot(dx, dy) > 8) { drag = true; el.classList.add('dragging'); Sound.play('pick'); }
    if (!drag) return;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(-4deg)`;
    const d = dockAt(e.clientX, e.clientY);
    if (d !== over) { over?.classList.remove('over'); over = d; over?.classList.add('over'); }
  });
  const end = (e) => {
    if (pid === null) return;
    const was = drag, d = was ? dockAt(e.clientX, e.clientY) : null;
    pid = null; drag = false;
    if (was && d && e.type === 'pointerup') { const id = d.dataset.dock; reset(); trySort(id); }
    else { reset(); if (!was && e.type === 'pointerup') { Sound.play('pick'); el.animate?.([{ transform: 'rotate(-4deg) translateY(0)' }, { transform: 'rotate(-4deg) translateY(-8px)' }, { transform: 'rotate(-4deg)' }], 220); } }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
function dockAt(x, y) {
  return document.elementsFromPoint(x, y).map((n) => n.closest?.('.dock[data-dock]')).find(Boolean) || null;
}


// ------------------------------------------------------------------ demo (how to play)
const DEMO_STEPS = [
  ['A ship arrives with crates.', 'Each crate carries a word in another language.'],
  ['Drag a crate to a dock.', 'Pick the dock that shows what you think the word means. Or just tap a dock.'],
  ['Wrong? No problem.', 'The crate bounces back and you lose a heart. The round never ends.'],
  ['Try again.', 'Gift looks like English, but it is a false friend.'],
  ['Every crate teaches one fact.', 'The reveal card shows the real meaning, where the word comes from, and how to say it.'],
  ['Earn coins and keep a streak.', 'Play the Daily Harbour, build your town, and unlock new languages.'],
];
let demoTimer = null;
function demoHtml() {
  return `<div class="demo" role="dialog" aria-modal="true" aria-label="How to play">
    <div class="dtop"><span class="head">How to play</span><button class="iconbtn" data-act="close-demo" aria-label="Close demo">${icon.close()}</button></div>
    <div class="dstage" data-step="0" aria-hidden="true">
      <span class="dhearts"><span class="h1">${icon.heart(22)}</span><span class="h2">${icon.heart(22)}</span><span class="h3 lost">${icon.heart(22, false)}</span><span class="h3 full">${icon.heart(22)}</span></span>
      <div class="dship">${ship()}</div>
      <div class="dcrate"><span class="lang">DE</span>Gift</div>
      <div class="ddocks"><div class="dd" data-d="0">hat</div><div class="dd" data-d="1">poison<span class="ck">${icon.check(16, '#2F7A5A')}</span></div><div class="dd" data-d="2">present<span class="xx">${icon.cross(14)}</span></div></div>
      <div class="dcard"><span class="tag false_friend">False friend</span><b>Gift</b><span>Really means <strong>poison</strong>. It once meant “something given”.</span></div>
      <div class="dreward"><span class="coinchip">${icon.coin(24)}+20</span><span class="pill">${icon.flame()}Streak</span><span class="pill">${icon.home(20)}Harbour</span></div>
    </div>
    <div class="dcap" role="status" aria-live="polite"><h2></h2><p></p></div>
    <div class="ddots">${DEMO_STEPS.map((_, i) => `<button data-act="demo-step" data-i="${i}" aria-label="Step ${i + 1}"></button>`).join('')}</div>
    <div class="dfoot"><button class="btn" data-act="close-demo" data-autofocus>Got it, let’s play</button></div>
  </div>`;
}
function demoSet(i) {
  const d = $('.demo', ov2);
  if (!d) return;
  $('.dstage', d).dataset.step = i;
  $('.dcap h2', d).textContent = DEMO_STEPS[i][0];
  $('.dcap p', d).textContent = DEMO_STEPS[i][1];
  $$('.ddots button', d).forEach((b, k) => b.setAttribute('aria-current', k === i));
  d.dataset.i = i;
  const sfx = [null, 'pick', 'wrong', 'correct', 'reveal', 'coin'][i];
  if (sfx) Sound.play(sfx);
}
function demoRun() {
  clearInterval(demoTimer);
  demoTimer = setInterval(() => {
    const d = $('.demo', ov2);
    if (!d) return clearInterval(demoTimer);
    demoSet((+d.dataset.i + 1) % DEMO_STEPS.length);
  }, 3600);
}
function openDemo() {
  openOv(ov2, demoHtml());
  demoSet(0);
  demoRun();
}
function closeDemo() {
  clearInterval(demoTimer);
  S.profile.demoSeen = true; save('profile');
  closeOv(ov2);
}
function showWelcome() {
  go('welcome');
  if (!S.profile.demoSeen) setTimeout(() => { if (view.name === 'welcome' && !ov2.innerHTML) openDemo(); }, 500);
}

// ------------------------------------------------------------------ actions
function openSettings() { openOv(ov1, settingsHtml()); }
function afterSettingChange() { applySettings(); save('profile'); }
function shareDaily(date) {
  const d = S.daily_results.find((x) => x.date === date);
  if (!d) return;
  const text = shareText(d);
  track('share_tap');
  const done = () => { Sound.play('pop'); toast('Copied to clipboard'); };
  if (navigator.share) {
    navigator.share({ text }).then(() => Sound.play('pop')).catch((e) => { if (e && e.name !== 'AbortError') copyText(text, done); });
  } else copyText(text, done);
}
function copyText(text, cb) {
  const fallback = () => {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { toast('Could not copy. Select the text to copy it.'); }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(cb).catch(fallback);
  else fallback();
}

const act = {
  noop() {},
  mute() {
    const on = !(S.profile.music || S.profile.sfx);
    S.profile.music = on; S.profile.sfx = on;
    Sound.setMusic(on); Sound.setSfx(on, on); track('music_toggle', { on }); track('sfx_toggle', { on });
    save('profile'); render(); toast(on ? 'Sound on' : 'Sound off');
  },
  demo() { openDemo(); },
  'demo-from-settings'() { openDemo(); },
  'close-demo'() { closeDemo(); },
  'demo-step'(el) { demoSet(+el.dataset.i); demoRun(); },
  'welcome-play'() { S.profile.welcomeSeen = true; save('profile'); track('first_open'); startRound('tutorial'); },
  'tut-done'() {
    S.profile.tutorialDone = true; S.progress.coins += REWARD.starter; save('profile', 'progress');
    track('tutorial_done'); closeOv(ov2); R = null; go('home'); Sound.play('coinRich');
  },
  tab(el) {
    const t = el.dataset.tab; closeOv(ov1);
    if (t === 'play') go('home'); else if (t === 'harbour') go('harbour'); else { ppHelp = ''; go('passport'); }
  },
  home() { R = null; go('home'); },
  settings() { openSettings(); },
  'close-ov1'() { closeOv(ov1); },
  'close-ov2'() { closeOv(ov2); },
  daily() { if (G.dailyDone()) return act['daily-result']({ dataset: { date: todayStr() } }); startRound('daily'); },
  continue() { startRound('restore'); },
  'refresh-day'() { loadedDay = todayStr(); render(); },
  'daily-result'(el) {
    const jf = justFinished; justFinished = false;
    go('result', { date: el.dataset.date });
    if (jf) setTimeout(() => Sound.play('streak'), 300);
  },
  'daily-from-building'() { go('home'); },
  freesail() {
    const open = G.unlockedNow();
    go('freesail', { langs: open.includes('de') ? ['de'] : open.slice(0, 1), diff: 'mixed' });
    open.forEach((l) => loadLang(l).then(() => view.name === 'freesail' && render()).catch(() => {}));
  },
  'pick-lang'(el) {
    const l = el.dataset.lang, i = view.langs.indexOf(l);
    if (i >= 0) { if (view.langs.length > 1) view.langs.splice(i, 1); else return toast('Pick at least one language'); } else view.langs.push(l);
    render(); $(`[data-lang="${l}"]`, screenEl)?.focus();
  },
  'pick-diff'(el) { view.diff = el.dataset.diff; render(); $(`[data-diff="${view.diff}"]`, screenEl)?.focus(); },
  'free-start'() { startRound('free', { langs: view.langs.slice(), diff: view.diff }); },
  'play-again'() { startRound('free', { langs: SUM.langs || ['de'], diff: SUM.diff || 'mixed' }); },
  'retry-tutorial'() { closeOv(ov2); startRound('tutorial'); },
  'retry-daily'() { closeOv(ov2); startRound('daily'); },
  'retry-free'() { closeOv(ov2); startRound('free', view._retry?.opts || { langs: ['de'], diff: 'mixed' }); },
  'retry-restore'() { closeOv(ov2); startRound('restore'); },
  dock(el) { trySort(el.dataset.dock); },
  hint() {
    if (!R || R.busy) return;
    const d = G.useHint(R);
    if (!d) return toast('No hints left today');
    Sound.play('hint');
    flash = { msg: 'Hint used: one wrong dock is dimmed.', info: true };
    G.persistRound(R); render();
  },
  'next-crate'() { nextCrate(); },
  leave() { openOv(ov2, leaveHtml()); },
  'leave-go'() {
    closeOv(ov2);
    if (R.mode !== 'tutorial') G.persistRound(R);
    const wasTut = R.mode === 'tutorial';
    R = null;
    wasTut ? showWelcome() : go('home');
  },
  report(el) {
    const w = R.W[el.dataset.word];
    openOv(ov2, reportHtml(w), '.radiorow');
  },
  'report-pick'(el) {
    $$('.radiorow', ov2).forEach((b) => { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  },
  'report-send'(el) {
    const reason = $('.radiorow.on', ov2)?.dataset.reason || 'Something else';
    S.reports.push({ word: el.dataset.word, reason, note: $('#rnote', ov2).value.slice(0, 300), sent: false, t: Math.floor(Date.now() / 1000) });
    save('reports'); track('word_report', { word: el.dataset.word, reason });
    window.dispatchEvent(new CustomEvent('babelharbour:report', { detail: S.reports[S.reports.length - 1] }));
    closeOv(ov2); Sound.play('pop'); toast(navigator.onLine ? 'Thanks, report sent' : 'Saved. We’ll send it when you’re online');
  },
  toggle(el) {
    const k = el.dataset.key, on = el.getAttribute('aria-checked') !== 'true';
    S.profile[k] = on; el.setAttribute('aria-checked', on);
    const st = el.parentElement.querySelector('.state'); if (st) st.textContent = on ? 'On' : 'Off';
    if (k === 'sfx') { Sound.setSfx(on, true); track('sfx_toggle', { on }); }
    if (k === 'music') { Sound.setMusic(on, true); track('music_toggle', { on }); }
    afterSettingChange();
  },
  textsize(el) { S.profile.textSize = +el.dataset.n; afterSettingChange(); $$('.seg button', ov1).forEach((b) => b.setAttribute('aria-pressed', b === el)); },
  about() { openOv(ov2, aboutHtml()); },
  reset() {
    openOv(ov2, resetHtml());
    const box = $('#resetbox', ov2), go2 = $('#resetgo', ov2);
    box.addEventListener('input', () => { go2.disabled = box.value.trim().toUpperCase() !== 'RESET'; });
  },
  'reset-go'() {
    resetAll(); load(); applySettings(); Sound.init(S.profile);
    closeOv(ov2); closeOv(ov1); R = null; loadedDay = todayStr(); showWelcome();
  },
  share(el) { shareDaily(el.dataset.date); },
  building(el) { go('building', { id: el.dataset.id }); },
  buy(el) {
    if (!G.buy(el.dataset.id)) return;
    Sound.play('build');
    go('building', { id: el.dataset.id, anim: true });
    toast(`${BUILDINGS[el.dataset.id].name} is open! ${LANGS[BUILDINGS[el.dataset.id].lang].name} unlocked`);
  },
  stamp(el) {
    const l = el.dataset.lang, L = LANGS[l];
    if (S.progress.stamps[l]) { Sound.play('stamp'); ppHelp = `${L.name} stamp earned on ${fmtDateLong(S.progress.stamps[l]).toLowerCase()}`; }
    else if (L.soon) ppHelp = `${L.name} is coming after launch`;
    else if (!S.progress.unlocked[l]) ppHelp = `Build the ${BUILDINGS[L.building].short} to unlock ${L.name}, then sail ${STAMP_ROUNDS} rounds`;
    else { const left = STAMP_ROUNDS - (S.progress.roundsByLang[l] || 0); ppHelp = `${left} more round${left === 1 ? '' : 's'} with ${L.name} to earn this stamp`; }
    render(); $(`[data-lang="${l}"]`, screenEl)?.focus();
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'SELECT') return;
  Sound.unlock();
  const name = el.dataset.act;
  if (!['dock', 'next-crate', 'hint', 'buy', 'share', 'report-send', 'toggle', 'tut-done', 'stamp', 'noop', 'mute', 'welcome-play', 'demo-step', 'close-demo'].includes(name)) Sound.play('click');
  else if (name === 'toggle' || name === 'noop') { /* has its own or no sound */ }
  (act[name] || (() => {}))(el, e);
});
document.addEventListener('pointerdown', () => Sound.unlock(), { once: true, capture: true });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (ov2.innerHTML) closeOv(ov2);
  else if (ov1.innerHTML && !$('.reveal', ov1)) closeOv(ov1);
});
// swipe a sheet down by its handle to close it
document.addEventListener('pointerdown', (e) => {
  const g = e.target.closest('[data-swipe]');
  if (!g) return;
  const sy = e.clientY, host = g.closest('.sheet').parentElement;
  const up = (u) => { document.removeEventListener('pointerup', up); if (u.clientY - sy > 70) closeOv(host); };
  document.addEventListener('pointerup', up);
});
window.addEventListener('online', () => view.name === 'home' && render());
window.addEventListener('offline', () => view.name === 'home' && render());

// ------------------------------------------------------------------ clock tick
let lateFlag = null;
setInterval(() => {
  $$('.cd').forEach((n) => { n.textContent = fmtCountdown(msToNextDay()); });
  if (view.name === 'home') {
    const late = !G.dailyDone() && G.effectiveStreak() > 0 && msToNextDay() < 6 * 3600e3;
    if (lateFlag !== null && late !== lateFlag) render();
    lateFlag = late;
    if (loadedDay !== todayStr() && !$('[data-act="refresh-day"]', screenEl)) render();
  }
  if (view.name === 'round' && R && R.mode === 'daily' && R.date !== todayStr() && !$('.banner', screenEl) && !R.busy && !ov1.innerHTML) render();
}, 1000);

// ------------------------------------------------------------------ boot
function boot() {
  load();
  applySettings();
  Sound.init(S.profile);
  if (S.profile.tutorialDone) go('home'); else showWelcome();
  if (storageBlocked) setTimeout(() => toast('Progress can’t be saved here. You can still play.'), 600);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.BH = { S, G, go, act, get R() { return R; } }; // handy for testing in the console
}
boot();
