// ExplorerGame.js - Eco Explorer (Class 1-10): the Nature Trail map, story cards
// with narration, the mission or mini-game, a 3-question check, then stars,
// seeds and badges. Voice first: Class 1-3 can play without reading.
import { World } from './World.js';
import { MISSIONS } from './Missions.js';
import { Voice } from './Voice.js';
import { addStrings, tr } from '../../app/strings.js';
import { LANGS, getLang, setLang } from '../../i18n.js';
import { Sound } from '../../Sound.js';
import { bankItems, shuffle } from '../../Quiz.js';
import { track } from '../../app/hooks.js';
import { watchPerformance } from '../../app/perf.js';
import {
  progress, saveProgress, completeModule, award, recordAttempt, BANDS, bandOpen, explorerDone, EXPLORER_MODULES,
} from '../../app/Profile.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = (obj) => (obj && (obj[getLang()] || obj.en)) || '';

export async function start(profile) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'css/explorer.css';
  document.head.appendChild(css);
  const data = await fetch('content/text/explorer.json').then((r) => r.json());
  addStrings(data.ui);
  const game = new ExplorerGame(profile, data.modules);
  window.ecosExplorer = game; // handy for testing from the browser console
  return game;
}

class ExplorerGame {
  constructor(profile, modules) {
    this.p = profile;
    this.mods = modules;
    this.pr = progress(profile);
    this.cls = Math.min(10, profile.cls || 5);
    this.voice = new Voice();
    this.sound = new Sound();
    try { if (localStorage.getItem('ecos-sound') === '0') { this.sound.on = false; this.voice.on = false; } } catch (e) { /* ignore */ }
    this.root = document.createElement('div');
    this.root.id = 'explorer';
    this.root.innerHTML = `
      <div class="ex-stage"></div>
      <div class="ex-top">
        <button class="ex-btn" id="exBack" aria-label="back">⬅</button>
        <button class="ex-btn" id="exMap">🗺️ <span id="exMapL"></span></button>
        <span class="ex-stat" id="exSeeds"></span>
        <button class="ex-btn" id="exBadges"></button>
        <button class="ex-btn" id="exLang"></button>
        <button class="ex-btn" id="exSound"></button>
      </div>
      <div class="ex-step" id="exStep" hidden><p id="exStepText"></p><button class="ex-btn round" id="exStepSay" aria-label="listen">🔊</button></div>
      <div class="ex-wrap" id="exWrap" hidden><div class="ex-panel" id="exPanel"></div></div>`;
    document.body.appendChild(this.root);
    this.world = new World(this.root.querySelector('.ex-stage'), { trees: this.pr.trees || 0 });
    watchPerformance(this.world.renderer);
    // A river the child already cleaned stays clean.
    if ((this.pr.modules.pollution || {}).status === 'done') { this.world.setRiverClean(1); this.world.addFish(6); }
    this.$ = (id) => this.root.querySelector('#' + id);
    this.$('exBack').onclick = () => { if (window.confirm(tr('shell.backAsk'))) { this.voice.stop(); location.reload(); } };
    this.$('exMap').onclick = () => { this.abortMission(); this.showMap(); };
    this.$('exBadges').onclick = () => { this.abortMission(); this.showBadges(); };
    this.$('exLang').onclick = () => {
      const keys = Object.keys(LANGS);
      setLang(keys[(keys.indexOf(getLang()) + 1) % keys.length]);
      this.voice.stop();
      this.renderTop();
      if (this.lastStep) this.step(this.lastStep.key, this.lastStep.vars);
      if (this.redraw) this.redraw();
    };
    this.$('exSound').onclick = () => {
      this.sound.on = this.voice.on = !this.sound.on;
      if (!this.voice.on) this.voice.stop();
      try { localStorage.setItem('ecos-sound', this.sound.on ? '1' : '0'); } catch (e) { /* ignore */ }
      this.renderTop();
    };
    this.$('exStepSay').onclick = () => { if (this.lastStep) this.voice.speak([tr(this.lastStep.key, this.lastStep.vars)]); };
    this.ui = this.missionUI();
    this.renderTop();
    this.showMap(true);
  }

  renderTop() {
    this.$('exMapL').textContent = tr('ex.home');
    this.$('exSeeds').textContent = `🌱 ${this.pr.seeds || 0}`;
    this.$('exSeeds').title = tr('ex.seeds');
    this.$('exBadges').textContent = `🏅 ${Object.keys(this.pr.badges).length}`;
    this.$('exLang').textContent = LANGS[getLang()].label;
    this.$('exSound').textContent = this.sound.on ? '🔊' : '🔇';
  }

  // ---------- panel helpers ----------
  panel(html, kind = '') {
    const p = this.$('exPanel');
    p.className = `ex-panel ${kind}`;
    p.innerHTML = html;
    this.$('exWrap').hidden = false;
    return p;
  }
  closePanel() { this.$('exWrap').hidden = true; this.redraw = null; }

  step(key, vars) {
    this.lastStep = { key, vars };
    this.$('exStep').hidden = false;
    this.$('exStepText').textContent = tr(key, vars);
    this.voice.speak([tr(key, vars)]);
  }
  hideStep() { this.$('exStep').hidden = true; this.lastStep = null; }

  missionUI() {
    const g = this;
    const SOUNDS = { pick: () => g.sound.select(), dig: () => g.sound.scanDone(), water: () => g.sound.contain(), grow: () => g.sound.success(), yay: () => g.sound.success(), no: () => g.sound.fail() };
    return {
      tr, esc,
      step: (k, v) => g.step(k, v),
      hint: (k) => { const el = g.$('exStepText'); const old = el.textContent; el.textContent = tr(k); el.classList.add('hint'); setTimeout(() => { el.classList.remove('hint'); if (g.lastStep) el.textContent = old; }, 1800); },
      speak: (parts) => g.voice.speak(parts),
      sound: (k) => SOUNDS[k] && SOUNDS[k](),
      wait: (ms) => new Promise((r) => setTimeout(r, ms)),
      panel: (html, kind) => { g.redraw = null; return g.panel(html, kind); },
      closePanel: () => g.closePanel(),
      fact: (textKey, nameKey, id) => new Promise((res) => {
        const icon = { butterfly: '🦋', peacock: '🦚', earthworm: '🪱', mushroom: '🍄', bee: '🐝', ladybird: '🐞' }[id] || '🌿';
        const draw = () => {
          const el = g.panel(`<div class="ex-card-big"><div class="ex-icon">${icon}</div><h2>${esc(tr(nameKey))}</h2><p>${esc(tr(textKey))}</p></div>
            <div class="ex-actions"><button class="ex-btn big" id="exFactOk">👍 ${esc(tr('ex.next'))}</button></div>`);
          el.querySelector('#exFactOk').onclick = () => { g.closePanel(); res(); };
          g.voice.speak([tr(nameKey), tr(textKey)]);
        };
        g.redraw = draw;
        draw();
      }),
    };
  }

  // ---------- map ----------
  showMap(first = false) {
    this.hideStep();
    const m = this.pr.modules;
    const tile = (id) => {
      const mod = this.mods[id];
      const st = m[id] || {};
      const stars = [1, 2, 3].map((i) => (i <= (st.stars || 0) ? '★' : '☆')).join('');
      return `<button class="ex-tile ${st.status === 'done' ? 'done' : ''}" data-m="${id}"><span class="ex-icon">${mod.icon}</span><b>${esc(tr(`mod.${id}`))}</b><i>${stars}</i></button>`;
    };
    const draw = () => {
      const el = this.panel(`
        <h2 class="ex-h">${esc(tr('ex.title'))}</h2>
        <p class="ex-prompt">${esc(tr('ex.welcome', { name: this.p.name }))}</p>
        ${BANDS.map((b) => {
          const open = bandOpen(b, this.p);
          return `<div class="ex-band ${open ? '' : 'locked'}"><p class="ex-band-h">${esc(tr('shell.class', { c: `${b.from}-${b.to}` }))}${open ? '' : ' 🔒'}</p>
            ${open ? `<div class="ex-tiles">${b.modules.map(tile).join('')}</div>` : `<p class="ex-note">${esc(tr('ex.lockedBand'))}</p>`}</div>`;
        }).join('')}`, 'map');
      el.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => this.runModule(b.dataset.m); });
    };
    this.redraw = draw;
    draw();
    if (first) this.voice.speak([tr('ex.welcome', { name: this.p.name })]);
  }

  showBadges() {
    this.hideStep();
    const ids = [...EXPLORER_MODULES, 'explorer'];
    const draw = () => {
      const got = ids.filter((id) => this.pr.badges[id]);
      this.panel(`<h2 class="ex-h">🏅 ${esc(tr('ex.badges'))}</h2>
        ${got.length ? '' : `<p class="ex-prompt">${esc(tr('ex.noBadges'))}</p>`}
        <div class="ex-tiles">${ids.map((id) => `<div class="ex-tile badge ${this.pr.badges[id] ? 'done' : 'off'}"><span class="ex-icon">${id === 'explorer' ? '🌍' : this.mods[id].icon}</span><b>${esc(tr(`badge.${id}`))}</b></div>`).join('')}</div>
        <div class="ex-actions"><button class="ex-btn big" id="exBadgeBack">🗺️ ${esc(tr('ex.home'))}</button></div>`, 'map');
      this.$('exBadgeBack').onclick = () => this.showMap();
    };
    this.redraw = draw;
    draw();
  }

  // ---------- one module: story -> activity -> check -> result ----------
  storyCards(id) {
    const mod = this.mods[id];
    const cards = [...mod.story];
    if (this.cls >= 4 || this.p.cls > 12) cards.push(mod.more);
    if (this.cls >= 8 || this.p.cls > 12) cards.push(mod.deep);
    return cards;
  }

  async runModule(id) {
    track('level_start', { tier: 'explorer', module: id });
    this.abortMission();
    const run = (this.run = { id, aborted: false });
    const cards = this.storyCards(id);
    await new Promise((res) => {
      let i = 0;
      const draw = () => {
        const c = cards[i];
        const el = this.panel(`
          <p class="ex-band-h">${this.mods[id].icon} ${esc(tr(`mod.${id}`))} · ${i + 1}/${cards.length}</p>
          <div class="ex-card-big"><div class="ex-icon">${c.icon}</div><p>${esc(L(c))}</p></div>
          <div class="ex-actions">
            <button class="ex-btn round" id="exSay" aria-label="listen">🔊</button>
            <button class="ex-btn big" id="exNext">${i + 1 < cards.length ? `${esc(tr('ex.next'))} ➜` : `▶ ${esc(tr('ex.start'))}`}</button>
          </div>`, 'story');
        this.voice.speak([L(c)]);
        el.querySelector('#exSay').onclick = () => this.voice.speak([L(c)]);
        el.querySelector('#exNext').onclick = () => { this.sound.select(); if (++i < cards.length) draw(); else { this.closePanel(); res(); } };
      };
      this.redraw = draw;
      draw();
    });
    if (run.aborted) return;
    this.world.snapshot = this.world.things.length;
    let res;
    try {
      res = await MISSIONS[this.mods[id].activity](this.world, this.ui, this.pr);
    } catch (e) {
      if (e === 'abort') return;
      throw e;
    }
    this.world.onWrong = null;
    saveProgress(this.p);
    if (run.aborted) return;
    this.hideStep();
    const check = await this.check(id);
    if (run.aborted) return;
    this.result(id, check, res.wrong);
  }

  abortMission() {
    if (this.run) this.run.aborted = true;
    this.voice.stop();
    if (this.world.pending) {
      this.world.abort();
      // remove anything the unfinished mission placed
      const extra = this.world.things.slice(this.world.snapshot || this.world.things.length);
      for (const th of extra) { this.world.removeThing(th); if (th.obj.parent) th.obj.parent.remove(th.obj); }
      this.world.carry(null);
      this.world.resetEnergy();
      this.closePanel();
    }
  }

  async check(id) {
    const mod = this.mods[id];
    const own = mod.quiz.map((q, i) => ({
      id: `ex:${id}:${i}`, own: true, q: L(q.q),
      opts: q.opts.map(([icon, label]) => ({ icon, label: L(label) })), ans: q.ans,
    }));
    let qs;
    const bankN = this.cls >= 8 ? 2 : this.cls >= 4 ? 1 : 0;
    if (bankN) {
      let pack = [];
      try { pack = await fetch(`content/questions/explorer/class-${this.cls}.json`).then((r) => r.json()); } catch (e) { pack = []; }
      const bank = bankItems(pack.filter((x) => x.m === id), bankN).map((b, i) => ({ id: `sch:${b.q.slice(0, 40)}`, own: false, q: b.q, opts: b.opts.map((o) => ({ icon: '', label: o })), ans: b.ans, why: b.why, n: i }));
      qs = [...shuffle(own).slice(0, 3 - bank.length), ...bank];
    } else qs = shuffle(own);
    // Shuffle the picture options too, keeping the right answer.
    qs = qs.map((q) => { const order = shuffle(q.opts.map((_, i) => i)); return { ...q, opts: order.map((i) => q.opts[i]), ans: order.indexOf(q.ans) }; });
    return new Promise((res) => {
      let i = 0; let score = 0; let picked = null;
      const draw = () => {
        const q = qs[i];
        const answered = picked !== null;
        const en = !q.own ? 'lang="en"' : '';
        const el = this.panel(`
          <p class="ex-band-h">✅ ${esc(tr('ex.check'))} · ${i + 1}/${qs.length}${!q.own && getLang() !== 'en' ? ' ' + esc(tr('ex.qEn')) : ''}</p>
          <h3 class="ex-q" ${en}>${esc(q.q)}</h3>
          <div class="ex-opts ${q.own ? 'pics' : ''}">${q.opts.map((o, k) => `<button class="ex-opt ${answered && k === q.ans ? 'right' : answered && k === picked ? 'wrong' : ''}" data-k="${k}" ${answered ? 'disabled' : ''} ${en}>${o.icon ? `<span class="ex-icon">${o.icon}</span>` : ''}${esc(o.label)}</button>`).join('')}</div>
          <div class="ex-actions">
            <button class="ex-btn round" id="exSay" aria-label="listen">🔊</button>
            ${answered ? `<button class="ex-btn big" id="exNext">${esc(tr('ex.next'))} ➜</button>` : ''}
          </div>`, 'check');
        const say = () => (q.own ? this.voice.speak([q.q, ...q.opts.map((o) => o.label)]) : this.voice.speak([]));
        if (!answered) say();
        el.querySelector('#exSay').onclick = say;
        el.querySelectorAll('.ex-opt').forEach((b) => {
          b.onclick = () => {
            picked = Number(b.dataset.k);
            const ok = picked === q.ans;
            if (ok) { score++; this.sound.success(); } else this.sound.fail();
            recordAttempt(q.id, ok, this.p);
            this.voice.speak([ok ? tr('mini.right') : `${q.opts[q.ans].label}`]);
            draw();
          };
        });
        if (el.querySelector('#exNext')) el.querySelector('#exNext').onclick = () => { if (++i < qs.length) { picked = null; draw(); } else { this.closePanel(); res({ score, n: qs.length }); } };
      };
      this.redraw = draw;
      draw();
    });
  }

  result(id, check, wrong) {
    const prev = (this.pr.modules[id] || {}).stars || 0;
    const wasDone = explorerDone(this.p);
    const r = completeModule(id, check.score / check.n, wrong, this.p);
    track('level_complete', { tier: 'explorer', module: id, stars: r.stars });
    const gained = r.status === 'done' ? Math.max(0, r.stars - prev) * 5 + 2 : 0;
    this.pr.seeds = (this.pr.seeds || 0) + gained;
    const badge = r.status === 'done' && award(id, this.p);
    const all = !wasDone && explorerDone(this.p);
    if (all) award('explorer', this.p);
    saveProgress(this.p);
    this.renderTop();
    const pass = check.score / check.n >= 0.6;
    const lines = pass ? [tr('ex.great'), tr('ex.stars', { s: r.stars, n: gained })] : [tr('ex.tryAgain')];
    if (badge) lines.push(tr('ex.newBadge', { b: tr(`badge.${id}`) }));
    if (all) lines.push(tr('ex.allDone'));
    const draw = () => {
      const el = this.panel(`
        <div class="ex-card-big">
          <div class="ex-icon">${pass ? '🎉' : '💪'}</div>
          <p class="ex-stars">${[1, 2, 3].map((i) => (i <= (pass ? r.stars : 0) ? '★' : '☆')).join('')}</p>
          <p class="ex-score">${check.score} / ${check.n}</p>
          ${lines.map((l) => `<p>${esc(l)}</p>`).join('')}
        </div>
        <div class="ex-actions">
          <button class="ex-btn big" id="exAgain">🔁 ${esc(tr('ex.again'))}</button>
          <button class="ex-btn big primary" id="exDone">🗺️ ${esc(tr('ex.home'))}</button>
        </div>`, 'result');
      el.querySelector('#exAgain').onclick = () => this.runModule(id);
      el.querySelector('#exDone').onclick = () => this.showMap();
    };
    this.redraw = draw;
    draw();
    this.voice.speak(lines);
  }
}
