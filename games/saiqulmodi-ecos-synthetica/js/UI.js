// UI.js - HUD, profile sheet ("its side first", energy-flow strip, read-aloud),
// Synthesis Lab, Codex, quiz, dialogs and the start screen, in three languages.
import { TIERS, COMPONENTS, ORGANISMS, ROLE_LABEL, TROPHIC_LABEL, TRUTHS, organismsOfTier, getOrganism } from './Database.js';
import { RING } from './GameLoop.js';
import { LANGS, getLang, setLang, t, o, comp, dict, tierT, truthT, whyT } from './i18n.js';
import { Speech } from './Speech.js';
import { buildQuiz, loadBank } from './Quiz.js';
import { track, offerReward, rewardUsed } from './app/hooks.js';
import { tr } from './app/strings.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const role = (r) => dict('roles', r, ROLE_LABEL[r]);
const cat = (c) => dict('cats', c, c);
const kind = (k) => dict('kinds', k, k);
const trophic = (k) => dict('trophic', k, TROPHIC_LABEL[k]);
const compName = (id) => comp(id, 'name', COMPONENTS[id].name);
const compDesc = (id) => comp(id, 'desc', COMPONENTS[id].desc);

// Energy chain shown on every profile: where its energy comes from and goes.
const CHAINS = {
  producer: ['chain.sun', '@', 'chain.planteaters', 'chain.decomposers', 'chain.heat'],
  herbivore: ['chain.sun', 'chain.plants', '@', 'chain.predators', 'chain.heat'],
  predator: ['chain.sun', 'chain.plants', 'chain.planteaters', '@', 'chain.heat'],
  decomposer: ['chain.sun', 'chain.plants', 'chain.dead', '@', 'chain.soil'],
  parasite: ['chain.sun', 'chain.plants', 'chain.host', '@', 'chain.heat'],
  borrower: ['chain.sun', 'chain.plants', 'chain.hostcell', '@', 'chain.heat'],
  partner: ['chain.sun', 'chain.partner', '@', 'chain.partner', 'chain.heat'],
};

export class UI {
  constructor(sound) {
    this.sound = sound;
    this.speech = new Speech();
    this.game = null;
    this.labTarget = null;
    this.labSel = [];
    this.labTab = 0;
    this.labMarks = {};
    this.codexTab = 'species';
    this.openStack = [];
    this.profileOrg = null;
    this.lastHud = null;
  }

  bind(game) {
    this.game = game;
    $('btnScan').onclick = () => game.scanAction();
    $('btnLab').onclick = () => this.openLab();
    $('btnCodex').onclick = () => this.openCodex();
    $('btnEvolve').onclick = () => this.confirmEvolve();
    $('btnHelp').onclick = () => this.showHelp();
    $('btnLang').onclick = () => {
      const keys = Object.keys(LANGS);
      this.changeLang(keys[(keys.indexOf(getLang()) + 1) % keys.length]);
    };
    $('btnSound').onclick = () => {
      this.sound.on = !this.sound.on;
      this.renderSoundBtn();
      try { localStorage.setItem('ecos-sound', this.sound.on ? '1' : '0'); } catch (e) { /* ignore */ }
    };
    try { if (localStorage.getItem('ecos-sound') === '0') this.sound.on = false; } catch (e) { /* ignore */ }
    document.querySelectorAll('[data-close]').forEach((b) => { b.onclick = () => this.close(b.dataset.close); });
    $('sheetScrim').onclick = () => this.close('sheet');

    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { const top = this.openStack[this.openStack.length - 1]; if (top && top !== 'start' && top !== 'quiz') this.close(top); return; }
      if (this.game.paused) return;
      if (k === 'e' || k === ' ') game.scanAction();
      else if (k === 'l') this.openLab();
      else if (k === 'c') this.openCodex();
    });

    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) $('joy').hidden = false;
    window.addEventListener('touchstart', () => { $('joy').hidden = false; $('keysHint').hidden = true; }, { once: true, passive: true });

    setLang(getLang());
    this.applyStatic();
    this.showStart();
  }

  // ---------- language ----------
  changeLang(l) {
    this.speech.stop();
    setLang(l);
    this.applyStatic();
    if (!$('start').hidden) this.showStart();
    if (!$('lab').hidden) this.renderLab();
    if (!$('codex').hidden) this.renderCodex();
    if (!$('sheet').hidden && this.profileOrg) this.showProfile(this.profileOrg);
    if (!$('quiz').hidden) this.renderQuiz();
    if (this.lastHud) this.updateHUD(this.lastHud);
  }

  applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $('formsList').innerHTML = t('start.forms').split('|').map((f) => `<span>${esc(f)}</span>`).join('');
    $('btnLang').textContent = LANGS[getLang()].label;
    $('langPick').innerHTML = Object.entries(LANGS).map(([k, v]) => `<button class="tab ${k === getLang() ? 'on' : ''}" data-l="${k}" lang="${k}">${v.label}</button>`).join('');
    $('langPick').querySelectorAll('button').forEach((b) => { b.onclick = () => this.changeLang(b.dataset.l); });
    this.renderSoundBtn();
  }

  renderSoundBtn() {
    $('btnSound').setAttribute('aria-pressed', String(this.sound.on));
    $('btnSound').textContent = t(this.sound.on ? 'hud.soundOn' : 'hud.soundOff');
  }

  // ---------- panels ----------
  open(id) {
    $(id).hidden = false;
    if (!this.openStack.includes(id)) this.openStack.push(id);
    if (id === 'sheet') $('sheetScrim').hidden = false;
    this.game.pause(id);
  }

  close(id) {
    $(id).hidden = true;
    this.openStack = this.openStack.filter((x) => x !== id);
    if (id === 'sheet') { $('sheetScrim').hidden = true; this.profileOrg = null; }
    if (id === 'sheet' || id === 'quiz') this.speech.stop();
    this.game.resume(id);
  }

  // ---------- read aloud ----------
  readButton(id, label = t('prof.read')) {
    return `<button class="mini-btn read" id="${id}" aria-pressed="false">${esc(label)}</button>`;
  }

  wireRead(id, parts, langOverride = null) {
    const btn = $(id);
    if (!btn) return;
    if (!this.speech.ok) { btn.hidden = true; return; }
    const idle = btn.textContent;
    btn.onclick = () => {
      if (btn.getAttribute('aria-pressed') === 'true') { this.speech.stop(); return; }
      if (!this.speech.hasVoice()) this.toast(t('voice.missing', { lang: LANGS[getLang()].label }), 'warn');
      document.querySelectorAll('.read[aria-pressed="true"]').forEach((b) => { b.setAttribute('aria-pressed', 'false'); b.textContent = b.dataset.idle || b.textContent; });
      btn.dataset.idle = idle;
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = t('prof.stop');
      this.speech.speak(typeof parts === 'function' ? parts() : parts, () => { btn.setAttribute('aria-pressed', 'false'); btn.textContent = idle; }, langOverride);
    };
  }

  // ---------- start ----------
  showStart() {
    const g = this.game;
    const has = g.hasSave;
    $('btnBegin').textContent = has ? t('start.continue', { form: tierT(g.tier).name }) : t('start.begin');
    $('newGameRow').hidden = !has;
    $('confirmNew').hidden = true;
    $('btnBegin').onclick = () => {
      this.sound.ensure();
      this.close('start');
      $('hud').hidden = false;
      if (!has) this.showTierIntro(g.tier);
    };
    $('btnNew').onclick = () => { $('confirmNew').hidden = false; };
    $('btnNewNo').onclick = () => { $('confirmNew').hidden = true; };
    $('btnNewYes').onclick = () => {
      g.resetProgress();
      g.hasSave = false;
      this.showStart();
    };
    this.open('start');
    $('hud').hidden = true;
  }

  // ---------- HUD ----------
  updateHUD(d) {
    this.lastHud = d;
    $('tierNum').textContent = t('hud.form', { n: d.tier + 1 });
    $('tierName').textContent = tierT(d.tier).name;
    $('progCounters').textContent = `${d.counters}/${d.need.counters}`;
    $('progAllies').textContent = `${d.allies}/${d.need.allies}`;
    $('epVal').textContent = d.ep;
    this.meter('mInt', d.integrity);
    this.meter('mAtp', d.energy);
    this.meter('mBal', d.balance, d.balance < 50);
    $('envHum').textContent = `${Math.round(d.env.hum)}%`;
    $('envTemp').textContent = `${Math.round(d.env.temp)} °C`;
    $('envNut').textContent = `${Math.round(d.env.nut)}`;
    $('envEvent').textContent = dict('events', d.eventName, [d.eventName])[0];
    $('btnEvolve').hidden = !d.ready;
    const chip = $('targetChip');
    const tg = d.target;
    if (tg) {
      chip.hidden = false;
      $('tName').textContent = tg.org && tg.known ? o(tg.org, 'name') : t('target.unknown');
      $('tSci').textContent = tg.org && tg.known ? tg.org.sci : '';
      $('tStatus').textContent = tg.known ? t('target.tapAgain') : (tg.far ? t('target.far', { m: tg.far }) : t('target.scanning'));
      $('tBar').style.width = `${Math.round(tg.progress * 100)}%`;
      chip.style.setProperty('--ring', hex(RING[tg.ring]));
    } else chip.hidden = true;
    $('btnScan').style.setProperty('--p', tg && tg.progress < 1 ? tg.progress : 0);
  }

  meter(id, v, warn = false) {
    const el = $(id);
    el.querySelector('i').style.width = `${Math.max(0, Math.min(100, v))}%`;
    el.querySelector('b').textContent = Math.round(v);
    el.classList.toggle('warn', warn || v < 25);
  }

  toast(text, kind = 'info') {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 4200);
  }

  flashDamage() {
    const v = $('vignette');
    v.classList.remove('hit');
    void v.offsetWidth;
    v.classList.add('hit');
  }

  // ---------- profile ----------
  statusOf(org) {
    const g = this.game;
    if (g.recruited.has(org.id)) return { text: t('status.partner'), cls: 'mutualist' };
    if (g.countered.has(org.id)) return { text: t('status.memory'), cls: 'memory' };
    if (org.role === 'opportunist') return g.balance < 50 ? { text: t('status.invasive'), cls: 'pathogen' } : { text: t('status.coexist'), cls: 'calm' };
    return null;
  }

  chainHTML(org) {
    const keys = CHAINS[org.trophic] || CHAINS.partner;
    const nodes = keys.map((k, i) => {
      if (k === '@') return `<li class="it">${esc(o(org, 'name'))}</li>`;
      if (i === 0 && org.id === 'nitrosomonas') return `<li>${esc(t('chain.chem'))}</li>`;
      return `<li>${esc(t(k))}</li>`;
    }).join('');
    return `<div class="chain" style="--n:${keys.length}" aria-label="${esc(t('chain.title'))}">
      <div class="chain-track" aria-hidden="true"><span class="spark" style="--d:0s"></span><span class="spark" style="--d:1s"></span><span class="spark" style="--d:2s"></span></div>
      <ol>${nodes}</ol></div>`;
  }

  showProfile(org, { isNew = false } = {}) {
    const g = this.game;
    this.profileOrg = org;
    const st = this.statusOf(org);
    const resolved = g.recruited.has(org.id) || g.countered.has(org.id);
    const canAct = !resolved && org.tier === g.tier;
    const mutual = org.role === 'mutualist';
    const harm = o(org, 'harm');
    const section = (cls, key, text, extra = '') => `<section class="${cls}"><h3>${esc(key)}</h3>${extra}<p>${esc(text)}</p></section>`;
    $('sheetBody').innerHTML = `
      ${isNew ? `<p class="eyebrow new">${esc(t('prof.new'))}</p>` : ''}
      <header class="prof-head">
        <div class="prof-top"><h2>${esc(o(org, 'name'))}</h2>${this.readButton('readAll')}</div>
        <p class="sci">${esc(org.sci)}</p>
        <div class="chips">
          <span class="chip">${esc(cat(org.category))}</span>
          <span class="chip role" style="--c:${hex(RING[org.role])}">${esc(role(org.role))}</span>
          ${st ? `<span class="chip role" style="--c:${hex(RING[st.cls])}">${esc(st.text)}</span>` : ''}
        </div>
      </header>
      ${section('its-side', t('prof.side'), o(org, 'survival'))}
      <section class="two">
        <div><h3>${esc(t('prof.gift'))}</h3><p>${esc(o(org, 'role_'))}</p></div>
        <div><h3>${esc(t('prof.without'))}</h3><p>${esc(o(org, 'without'))}</p></div>
      </section>
      <section class="energy">
        <h3>${esc(t('prof.energy'))}</h3>
        ${this.chainHTML(org)}
        <p class="trophic">${esc(trophic(org.trophic))}</p>
        <p>${esc(o(org, 'energy'))}</p>
      </section>
      ${harm ? section('harm', t('prof.harm', { player: tierT(org.tier).player }), harm) : ''}
      ${section('answer', t(mutual ? 'prof.partner' : 'prof.answer'), o(org, 'counter'))}
      <section class="solution">
        <h3>${esc(t('prof.solution'))}</h3>
        ${org.recipes.map((r, k) => `<p class="sol-lead">${esc(t(k ? 'prof.solutionAlt' : 'prof.solutionLead'))} <b>${r.map((id) => esc(compName(id))).join(' + ')}</b></p>
        <ul class="sol-parts">${r.map((id) => `<li><b>${esc(compName(id))}</b> <i>${esc(kind(COMPONENTS[id].kind))}</i>
          <p><span>${esc(t('prof.whatItIs'))}</span> ${esc(compDesc(id))}</p>
          ${whyT(org.id, id) ? `<p><span>${esc(t('prof.whyWorks'))}</span> ${esc(whyT(org.id, id))}</p>` : ''}</li>`).join('')}</ul>`).join('')}
      </section>
      <section class="human">
        <div class="prof-top"><h3>${esc(t('prof.human'))}</h3>${this.readButton('readHuman', t('prof.listen'))}</div>
        <ol class="ways">
          <li><span class="way">${esc(t('way.belief'))}</span><p>${esc(o(org, 'belief'))}</p></li>
          <li><span class="way">${esc(t('way.observed'))}</span><p>${esc(o(org, 'observed'))}</p></li>
          <li><span class="way">${esc(t('way.science'))}</span><p>${esc(o(org, 'science'))}</p></li>
        </ol>
      </section>
      <p class="fact"><span>${esc(t('prof.fact'))}</span> ${esc(o(org, 'fact'))}</p>
      <div class="sheet-actions">
        ${canAct ? `<button class="btn primary" id="profLab">${esc(t(mutual ? 'prof.labPartner' : 'prof.labDefence'))}</button>` : ''}
        <button class="btn" id="profClose">${esc(t('prof.back'))}</button>
      </div>`;
    this.open('sheet');
    $('sheetBody').scrollTop = 0;
    const human = () => [t('prof.human'), `${t('way.belief')}. ${o(org, 'belief')}`, `${t('way.observed')}. ${o(org, 'observed')}`, `${t('way.science')}. ${o(org, 'science')}`];
    this.wireRead('readAll', () => [
      o(org, 'name'), t('prof.side'), o(org, 'survival'), t('prof.gift'), o(org, 'role_'), t('prof.without'), o(org, 'without'),
      t('prof.energy'), o(org, 'energy'), harm ? t('prof.harm', { player: tierT(org.tier).player }) : '', harm,
      t(mutual ? 'prof.partner' : 'prof.answer'), o(org, 'counter'),
      t('prof.solution'), ...org.recipes.flatMap((r, k) => [t(k ? 'prof.solutionAlt' : 'prof.solutionLead'),
        ...r.flatMap((id) => [compName(id), `${t('prof.whatItIs')} ${compDesc(id)}`, whyT(org.id, id) ? `${t('prof.whyWorks')} ${whyT(org.id, id)}` : ''])]),
      ...human(), t('prof.fact'), o(org, 'fact'),
    ]);
    this.wireRead('readHuman', human);
    $('profClose').onclick = () => this.close('sheet');
    if (canAct) $('profLab').onclick = () => { this.close('sheet'); if (!$('codex').hidden) this.close('codex'); this.openLab(org.id); };
  }

  // ---------- lab ----------
  labTargets() {
    const g = this.game;
    return organismsOfTier(g.tier).filter((x) => g.scanned.has(x.id) && !g.countered.has(x.id) && !g.recruited.has(x.id));
  }

  openLab(preselect) {
    const targets = this.labTargets();
    if (preselect) this.labTarget = preselect;
    if (!targets.find((x) => x.id === this.labTarget)) this.labTarget = targets[0] ? targets[0].id : null;
    this.labSel = [];
    this.labMarks = {};
    this.labTab = this.game.tier;
    this.lastPart = null;
    $('labFeedback').textContent = '';
    $('labFeedback').className = 'feedback';
    this.renderLab();
    this.open('lab');
  }

  renderLab() {
    const g = this.game;
    const targets = this.labTargets();
    const list = $('labTargets');
    if (!targets.length) {
      list.innerHTML = `<p class="empty">${esc(t('lab.empty'))}</p>`;
    } else {
      list.innerHTML = targets.map((x) => `<button class="target ${x.id === this.labTarget ? 'on' : ''}" data-id="${x.id}" style="--c:${hex(RING[x.role])}"><b>${esc(o(x, 'name'))}</b><i>${esc(x.sci)}</i></button>`).join('');
      list.querySelectorAll('.target').forEach((b) => { b.onclick = () => { this.labTarget = b.dataset.id; this.labSel = []; this.labMarks = {}; this.lastPart = null; $('labFeedback').textContent = ''; this.renderLab(); }; });
    }
    const org = this.labTarget && getOrganism(this.labTarget);
    $('labCase').innerHTML = org ? `
      <h3>${esc(t(org.role === 'mutualist' ? 'lab.partner' : 'lab.answer'))} <span class="parts">${esc(t('lab.parts', { n: g.synth.partsHint(org) }))}</span></h3>
      <p>${esc(o(org, 'counter'))}</p>` : '';
    $('labWork').hidden = !org;

    const slots = $('labSlots');
    slots.innerHTML = [0, 1, 2].map((i) => {
      const id = this.labSel[i];
      return id ? `<button class="slot full" data-i="${i}">${esc(compName(id))}<span aria-hidden="true">×</span></button>` : `<div class="slot">${esc(t('lab.slotEmpty'))}</div>`;
    }).join('');
    slots.querySelectorAll('.slot.full').forEach((b) => { b.onclick = () => { this.labSel.splice(Number(b.dataset.i), 1); this.renderLab(); }; });
    $('btnSynth').disabled = !org || !this.labSel.length;
    $('btnSynth').textContent = t('lab.synth', { n: Math.floor(g.energy) });

    const tabs = $('labTabs');
    tabs.innerHTML = TIERS.slice(0, g.tier + 1).map((tr) => `<button class="tab ${tr.id === this.labTab ? 'on' : ''}" data-t="${tr.id}">${esc(tierT(tr.id).name)}</button>`).join('');
    tabs.querySelectorAll('.tab').forEach((b) => { b.onclick = () => { this.labTab = Number(b.dataset.t); this.renderLab(); }; });

    const parts = Object.entries(COMPONENTS).filter(([, c]) => c.tier === this.labTab);
    const grid = $('labParts');
    grid.innerHTML = parts.map(([id, c]) => {
      const cls = [this.labSel.includes(id) ? 'sel' : '', this.labMarks[id] || ''].join(' ');
      return `<button class="part ${cls}" data-id="${id}"><b>${esc(compName(id))}</b><i>${esc(kind(c.kind))}</i></button>`;
    }).join('');
    grid.querySelectorAll('.part').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.id;
        this.lastPart = id;
        const at = this.labSel.indexOf(id);
        if (at >= 0) this.labSel.splice(at, 1);
        else if (this.labSel.length < 3) this.labSel.push(id);
        else { $('labFeedback').textContent = t('lab.full'); $('labFeedback').className = 'feedback warn'; }
        this.sound.select();
        this.renderLab();
      };
    });
    $('btnSynth').onclick = () => this.synthesise();
    $('partInfo').innerHTML = this.lastPart ? this.partInfoHTML(this.lastPart) : esc(t('lab.partInfo'));
  }

  // What the part does, then why it is (or is not) the best fit for the open case.
  partInfoHTML(id) {
    let html = `<b>${esc(compName(id))}.</b> ${esc(compDesc(id))}`;
    const org = this.labTarget && getOrganism(this.labTarget);
    if (!org) return html;
    // Reasons unlock only after one wrong try for this case, so the first attempt is the player's own.
    if (!this.game.synth.attempts[org.id]) return `${html}<span class="why-locked">${esc(t('lab.whyLocked'))}</span>`;
    const name = o(org, 'name');
    if (org.recipes.some((r) => r.includes(id))) {
      html += `<span class="why-fit"><b>${esc(t('lab.bestFit', { name }))}</b> ${esc(whyT(org.id, id))}</span>`;
    } else {
      const users = ORGANISMS.filter((x) => x.tier <= this.game.tier && x.recipes.some((r) => r.includes(id))).map((x) => o(x, 'name')).slice(0, 4);
      html += `<span class="why-not"><b>${esc(t('lab.notFit', { name }))}</b> ${esc(users.length ? t('lab.usedFor', { list: users.join(', ') }) : t('lab.general'))}</span>`;
    }
    return html;
  }

  synthesise() {
    const g = this.game;
    const org = getOrganism(this.labTarget);
    const res = g.trySynthesis(this.labTarget, this.labSel);
    const fb = $('labFeedback');
    if (res.error === 'energy') { fb.textContent = t('lab.noEnergy'); fb.className = 'feedback warn'; return; }
    if (res.error) return;
    if (res.success) {
      this.close('lab');
      this.showSuccess(org);
      return;
    }
    this.labMarks = {};
    for (const id of res.right) this.labMarks[id] = 'right';
    for (const id of res.wrong) this.labMarks[id] = 'wrong';
    const msg = [t('lab.fit', { hits: res.hits, needed: res.needed })];
    if (res.attempt === 1) msg.push(t('lab.read'));
    if (res.attempt >= 2) msg.push(t('lab.marks'));
    if (res.reveal) {
      const rc = COMPONENTS[res.reveal];
      this.labMarks[res.reveal] = 'reveal';
      msg.push(rc.tier !== this.labTab ? t('lab.hintTab', { part: compName(res.reveal), tab: tierT(rc.tier).name }) : t('lab.hint', { part: compName(res.reveal) }));
    }
    fb.textContent = msg.join(' ');
    fb.className = 'feedback bad';
    this.renderLab();
  }

  showSuccess(org) {
    const mutual = org.role === 'mutualist';
    this.dialog({
      title: t(mutual ? 'succ.partnerTitle' : 'succ.containTitle', { name: o(org, 'name') }),
      html: `<p class="lead">${esc(mutual ? o(org, 'bonus') : t('succ.notDestroyed', { outcome: o(org, 'outcome') }))}</p>
        <p>${esc(t(mutual ? 'succ.ep20' : 'succ.ep25'))}</p>
        <div class="ways mini">
          <p><span class="way">${esc(t('way.belief'))}</span> ${esc(o(org, 'belief'))}</p>
          <p><span class="way">${esc(t('way.observed'))}</span> ${esc(o(org, 'observed'))}</p>
          <p><span class="way">${esc(t('way.science'))}</span> ${esc(o(org, 'science'))}</p>
        </div>`,
      buttons: [{ label: t('btn.continue'), primary: true }],
    });
  }

  // ---------- codex ----------
  openCodex() {
    this.renderCodex();
    this.open('codex');
  }

  renderCodex() {
    const tabs = $('codexTabs');
    const names = { species: t('codex.species'), energy: t('codex.energy'), truth: t('codex.truth') };
    tabs.innerHTML = Object.entries(names).map(([k, v]) => `<button class="tab ${k === this.codexTab ? 'on' : ''}" data-k="${k}">${esc(v)}</button>`).join('');
    tabs.querySelectorAll('.tab').forEach((b) => { b.onclick = () => { this.codexTab = b.dataset.k; this.renderCodex(); }; });
    const body = $('codexBody');
    if (this.codexTab === 'species') body.innerHTML = this.codexSpecies();
    else if (this.codexTab === 'energy') body.innerHTML = this.codexEnergy();
    else body.innerHTML = this.codexTruth();
    body.querySelectorAll('[data-org]').forEach((b) => { b.onclick = () => this.showProfile(getOrganism(b.dataset.org)); });
  }

  codexSpecies() {
    const g = this.game;
    const total = TIERS.reduce((n, tr) => n + organismsOfTier(tr.id).length, 0);
    let html = `<p class="codex-sum">${esc(t('codex.sum', { s: g.scanned.size, t: total, m: g.countered.size, p: g.recruited.size }))}</p>`;
    for (const tr of TIERS) {
      const orgs = organismsOfTier(tr.id);
      const tt = tierT(tr.id);
      html += `<h3 class="codex-tier">${tr.id + 1}. ${esc(tt.name)} <span>${esc(tt.world)}</span></h3>`;
      if (tr.id > g.tier) { html += `<p class="empty">${esc(t('codex.locked', { n: orgs.length }))}</p>`; continue; }
      html += '<div class="cards">' + orgs.map((x) => {
        if (!g.scanned.has(x.id)) return `<div class="card unknown"><b>${esc(t('codex.unscanned'))}</b><i>${esc(cat(x.category))}</i></div>`;
        const st = this.statusOf(x);
        return `<button class="card" data-org="${x.id}" style="--c:${hex(RING[st ? st.cls : x.role])}"><b>${esc(o(x, 'name'))}</b><i>${esc(x.sci)}</i><span>${esc(st ? st.text : role(x.role))}</span></button>`;
      }).join('') + '</div>';
    }
    return html;
  }

  codexEnergy() {
    const g = this.game;
    const orgs = organismsOfTier(g.tier);
    const you = { 0: 'decomposer', 1: 'producer', 2: 'herbivore', 3: 'predator' }[g.tier];
    const col = (key) => {
      const list = orgs.filter((x) => x.trophic === key);
      const items = list.map((x) => (g.scanned.has(x.id) ? `<button class="node" data-org="${x.id}">${esc(o(x, 'name'))}</button>` : '<span class="node unknown">?</span>')).join('');
      const mine = key === you ? `<span class="node you">${esc(t('energy.you' + g.tier))}</span>` : '';
      return `<div class="level"><h4>${esc(t('energy.' + key))}</h4><p>${esc(t('energy.' + key + 'Note'))}</p>${mine}${items || (mine ? '' : `<span class="node empty">${esc(t('energy.none'))}</span>`)}</div>`;
    };
    return `
      <p class="lead">${esc(t('energy.lead'))}</p>
      <div class="flow">
        <div class="level source"><h4>${esc(t('energy.source'))}</h4><p>${esc(t('energy.sourceNote'))}</p></div>
        ${col('producer')}${col('herbivore')}${col('predator')}${col('decomposer')}
        <div class="level sink"><h4>${esc(t('energy.heat'))}</h4><p>${esc(t('energy.heatNote'))}</p></div>
      </div>
      <div class="flow side">${col('parasite')}${col('borrower')}${col('partner')}</div>`;
  }

  codexTruth() {
    return TRUTHS.map((_, i) => { const [ti, tx] = truthT(i); return `<article class="truth"><h3>${esc(ti)}</h3><p>${esc(tx)}</p></article>`; }).join('');
  }

  // ---------- quiz ----------
  async openQuiz(mode) {
    const g = this.game;
    await loadBank(g.tier);
    this.quiz ={ mode, qs: buildQuiz(g.scanned, g.tier), i: 0, score: 0, picked: null, done: false };
    this.renderQuiz();
    this.open('quiz');
  }

  renderQuiz() {
    const z = this.quiz;
    if (!z) return;
    const box = $('quizBody');
    $('quizTitle').textContent = t(z.mode === 'final' ? 'quiz.finalTitle' : 'quiz.title');
    if (z.done) {
      const n = z.qs.length;
      const pass = z.score >= 3;
      let msg;
      const buttons = [];
      if (z.mode === 'final') {
        msg = t('quiz.final', { s: z.score, n, ep: z.score * 10 });
        buttons.push(`<button class="btn primary" id="qzBack">${esc(t('quiz.back'))}</button>`);
      } else if (pass) {
        msg = t('quiz.pass', { s: z.score, n });
        buttons.push(`<button class="btn primary" id="qzEvolve">${esc(t('quiz.evolveNow'))}</button>`);
      } else {
        msg = t('quiz.fail', { s: z.score, n });
        buttons.push(`<button class="btn" id="qzBack">${esc(t('quiz.back'))}</button>`, `<button class="btn primary" id="qzRetry">${esc(t('quiz.retry'))}</button>`);
      }
      box.innerHTML = `<p class="score">${z.score} / ${n}</p><p class="lead">${esc(msg)}</p><div class="sheet-actions">${buttons.join('')}</div>`;
      if ($('qzBack')) $('qzBack').onclick = () => this.close('quiz');
      if ($('qzRetry')) $('qzRetry').onclick = () => this.openQuiz(z.mode);
      if ($('qzEvolve')) $('qzEvolve').onclick = () => { this.close('quiz'); this.game.evolve(); };
      return;
    }
    const q = z.qs[z.i];
    const src = q.source === 'bank'
      ? `${t('quiz.bank', { c: q.cls, topic: q.topic })}${getLang() !== 'en' ? ' ' + t('quiz.bankEn') : ''}`
      : t('quiz.game');
    const answered = z.picked !== null;
    box.innerHTML = `
      <div class="quiz-head"><p class="eyebrow">${esc(t('quiz.progress', { i: z.i + 1, n: z.qs.length }))} · ${esc(src)}</p>${this.readButton('readQ', t('quiz.read'))}</div>
      <h3 class="question" ${q.source === 'bank' ? 'lang="en"' : ''}>${esc(q.q)}</h3>
      ${q.quote ? `<blockquote>${esc(q.quote)}</blockquote>` : ''}
      <div class="qopts">${q.opts.map((opt, i) => {
        let cls = '';
        if (answered && i === q.ans) cls = 'right';
        else if (answered && i === z.picked) cls = 'wrong';
        return `<button class="qopt ${cls}" data-i="${i}" ${answered ? 'disabled' : ''} ${q.source === 'bank' ? 'lang="en"' : ''}><span class="letter">${'ABCD'[i]}</span>${esc(opt)}</button>`;
      }).join('')}</div>
      ${answered ? `<p class="feedback ${z.picked === q.ans ? 'good' : 'bad'}">${esc(z.picked === q.ans ? t('quiz.right') : t('quiz.wrong', { a: q.opts[q.ans] }))}${q.why ? ` <span class="why">${esc(q.why)}</span>` : ''}</p>
        <div class="sheet-actions"><button class="btn primary" id="qzNext">${esc(t(z.i + 1 < z.qs.length ? 'quiz.next' : 'quiz.finish'))}</button></div>` : ''}`;
    this.wireRead('readQ', () => [q.q, q.quote || '', ...q.opts.map((x, i) => `${'ABCD'[i]}. ${x}`)], q.source === 'bank' ? 'en' : null);
    box.querySelectorAll('.qopt').forEach((b) => {
      b.onclick = () => {
        z.picked = Number(b.dataset.i);
        if (z.picked === q.ans) { z.score++; this.game.ep += 5; this.sound.success(); } else this.sound.fail();
        this.renderQuiz();
      };
    });
    if ($('qzNext')) $('qzNext').onclick = () => {
      this.speech.stop();
      z.picked = null;
      z.i++;
      if (z.i >= z.qs.length) {
        z.done = true;
        if (z.mode === 'final') this.game.ep += z.score * 10;
        this.game.save();
      }
      this.renderQuiz();
    };
  }

  // ---------- dialogs ----------
  dialog({ title, html, buttons }) {
    $('dlgTitle').textContent = title;
    $('dlgBody').innerHTML = html;
    const row = $('dlgButtons');
    row.innerHTML = '';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.className = `btn ${b.primary ? 'primary' : ''}`;
      el.textContent = b.label;
      el.onclick = () => { this.close('dialog'); if (b.onClick) b.onClick(); };
      row.appendChild(el);
    }
    this.open('dialog');
  }

  showTierIntro(i) {
    const tt = tierT(i);
    this.dialog({
      title: t('intro.title', { n: i + 1, name: tt.name }),
      html: `<p class="lead">${esc(tt.intro)}</p>
        <p class="world">${esc(tt.world)}</p>
        <ol class="steps">
          <li>${t('intro.s1')}</li>
          <li>${t('intro.s2')}</li>
          <li>${t('intro.s3', { c: tt.need.counters, a: tt.need.allies })}</li>
        </ol>`,
      buttons: [{ label: t('intro.enter'), primary: true }],
    });
  }

  confirmEvolve() {
    const g = this.game;
    if (g.tier >= TIERS.length - 1) return;
    const next = tierT(g.tier + 1);
    this.dialog({
      title: t('evolve.title', { name: next.name }),
      html: `<p class="lead">${esc(next.world)}.</p><p>${esc(t('evolve.body'))}</p><p><b>${esc(t('evolve.quiz'))}</b></p>`,
      buttons: [{ label: t('btn.notYet') }, { label: t('evolve.take'), primary: true, onClick: () => this.openQuiz('evolve') }],
    });
  }

  showOverwhelmed(names) {
    track('game_over', { tier: 'scientist', form: this.game.tier });
    let who = names.join(t('over.and')) || t('over.attackers');
    who = who.charAt(0).toUpperCase() + who.slice(1);
    this.dialog({
      title: t('over.title'),
      html: `<p class="lead">${esc(t('over.lead', { who }))}</p><p>${esc(t('over.body'))}</p>`,
      buttons: [
        ...(rewardUsed('form' + this.game.tier) ? [] : [{ label: tr('hk.second'), onClick: () => offerReward(() => this.game.revive(), 'form' + this.game.tier) }]),
        { label: t('over.codex'), onClick: () => { this.game.retry(); this.openCodex(); } }, { label: t('over.retry'), primary: true, onClick: () => this.game.retry() }],
    });
  }

  showComplete() {
    this.sound.evolve();
    this.dialog({
      title: t('done.title'),
      html: `<p class="lead">${esc(t('done.lead'))}</p><p>${esc(t('done.body'))}</p>`,
      buttons: [
        { label: t('done.truths'), onClick: () => { this.codexTab = 'truth'; this.openCodex(); } },
        { label: t('done.quiz'), onClick: () => this.openQuiz('final') },
        { label: t('done.keep'), primary: true },
      ],
    });
  }

  showHelp() {
    this.dialog({
      title: t('help.title'),
      html: `<ol class="steps">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<li>${t('help.' + i)}</li>`).join('')}</ol>`,
      buttons: [{ label: t('btn.gotIt'), primary: true }],
    });
  }
}
