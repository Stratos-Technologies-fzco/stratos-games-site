// Shell.js - the path screen: language, who is playing, the three tiers with
// their unlock state, and the placement tests that open a tier early.
import { LANGS, getLang, setLang } from '../i18n.js';
import { tr } from './strings.js';
import {
  profiles, activeProfile, setActive, createProfile, removeProfile, saveProfiles, progress,
  tierOpen, EXPLORER_MODULES, saveKeyFor, scientistDone,
} from './Profile.js';
import { bankItems } from '../Quiz.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (id) => document.getElementById(id);

const ICON = { explorer: '🌱', scientist: '🔬', professional: '🩺' };

export class Shell {
  // tiers: { explorer: { available, start(profile) }, ... }; extras: functions adding footer buttons.
  constructor(tiers) {
    this.tiers = tiers;
    this.footer = [];
    this.el = document.createElement('section');
    this.el.id = 'paths';
    document.body.appendChild(this.el);
    this.modal = document.createElement('section');
    this.modal.id = 'shellModal';
    this.modal.className = 'modal';
    this.modal.hidden = true;
    document.body.appendChild(this.modal);
  }

  addFooter(fn) { this.footer.push(fn); }

  show() {
    this.el.hidden = false;
    if (!activeProfile()) createProfile(`${tr('shell.player')} 1`, 5);
    this.render();
  }

  hide() { this.el.hidden = true; this.modal.hidden = true; }

  render() {
    const p = activeProfile();
    const langs = Object.entries(LANGS).map(([k, v]) => `<button class="tab ${k === getLang() ? 'on' : ''}" data-l="${k}" lang="${k}">${v.label}</button>`).join('');
    const who = p ? `<b>${esc(p.name)}</b> · ${esc(p.cls > 12 ? tr('shell.college') : tr('shell.class', { c: p.cls }))}` : '';
    this.el.innerHTML = `
      <div class="paths-inner">
        <div class="paths-top">
          <div class="lang-row" id="pathLang">${langs}</div>
          <div class="who">${who} <button class="mini-btn" id="btnWho">${esc(tr('shell.switch'))}</button></div>
        </div>
        <h1 class="paths-title">Ecos-Synthetica<span>${esc(tr('shell.tag'))}</span></h1>
        <p class="thesis">${esc(tr('shell.lead'))}</p>
        <div class="path-cards">${['explorer', 'scientist', 'professional'].map((k) => this.card(k, p)).join('<div class="path-arrow" aria-hidden="true">→</div>')}</div>
        <div class="paths-foot" id="pathsFoot"></div>
      </div>`;
    this.el.querySelectorAll('#pathLang button').forEach((b) => { b.onclick = () => { setLang(b.dataset.l); this.render(); }; });
    $('btnWho').onclick = () => this.pickProfile();
    this.el.querySelectorAll('[data-play]').forEach((b) => { b.onclick = () => this.play(b.dataset.play); });
    this.el.querySelectorAll('[data-place]').forEach((b) => { b.onclick = () => this.placement(b.dataset.place); });
    const foot = $('pathsFoot');
    for (const fn of this.footer) fn(foot, p, this);
  }

  progressText(k, p) {
    if (!p) return '';
    const pr = progress(p);
    if (k === 'explorer') return tr('tier.progress', { d: EXPLORER_MODULES.filter((id) => pr.modules[id] && pr.modules[id].status === 'done').length, n: EXPLORER_MODULES.length });
    if (k === 'scientist') {
      let s = null;
      try { s = JSON.parse(localStorage.getItem(saveKeyFor(p)) || 'null'); } catch (e) { /* ignore */ }
      if (!s) return '';
      return tr('tier.progress', { d: scientistDone(p) ? 4 : (s.tier || 0), n: 4 });
    }
    const done = Object.values(pr.cases || {}).filter((c) => c.status === 'done').length;
    return done ? tr('tier.progress', { d: done, n: this.tiers.professional.total || done }) : '';
  }

  card(k, p) {
    const t = this.tiers[k];
    const open = tierOpen(k, p);
    const prog = this.progressText(k, p);
    let action;
    if (!t.available) action = `<p class="path-note">${esc(tr('shell.soon'))}</p>`;
    else if (open) action = `<button class="btn primary path-play" data-play="${k}">${esc(prog ? tr('shell.continue') : tr('shell.play'))}</button>`;
    else {
      action = `<p class="path-note">🔒 ${esc(tr(k === 'scientist' ? 'tier.unlockScientist' : 'tier.unlockProfessional'))}</p>
        <p class="path-note small">${esc(tr('shell.placementWhy'))}</p>
        <button class="btn" data-place="${k}">${esc(tr('shell.placement'))}</button>`;
    }
    return `<article class="path-card ${open ? '' : 'locked'}" data-tier="${k}">
      <div class="path-icon" aria-hidden="true">${ICON[k]}</div>
      <p class="eyebrow">${esc(tr(`tier.${k}Age`))}</p>
      <h2>${esc(tr(`tier.${k}`))}</h2>
      <p>${esc(tr(`tier.${k}Text`))}</p>
      ${prog ? `<p class="path-prog">${esc(prog)}</p>` : ''}
      ${action}
    </article>`;
  }

  play(k) {
    const p = activeProfile();
    if (!p || !tierOpen(k, p) || !this.tiers[k].available) return;
    this.hide();
    this.tiers[k].start(p);
  }

  // ---------- profiles ----------
  openModal(html) {
    this.modal.innerHTML = `<div class="panel shell-panel">${html}</div>`;
    this.modal.hidden = false;
  }
  closeModal() { this.modal.hidden = true; this.modal.innerHTML = ''; }

  classOptions(sel) {
    const opts = [];
    for (let c = 1; c <= 12; c++) opts.push(`<option value="${c}" ${c === sel ? 'selected' : ''}>${esc(tr('shell.class', { c }))}</option>`);
    opts.push(`<option value="13" ${sel === 13 ? 'selected' : ''}>${esc(tr('shell.college'))}</option>`);
    return opts.join('');
  }

  editProfile(required = false) {
    this.openModal(`
      <header><h2>${esc(tr('shell.newPlayer'))}</h2></header>
      <form class="scroll profile-form" id="pfForm">
        <label>${esc(tr('shell.name'))}<input id="pfName" maxlength="24" autocomplete="off" placeholder="${esc(tr('shell.namePh'))}" required></label>
        <label>${esc(tr('shell.classLabel'))}<select id="pfClass">${this.classOptions(5)}</select></label>
        <div class="sheet-actions">
          <button class="btn primary" type="submit">${esc(tr('shell.create'))}</button>
          ${required ? '' : `<button class="btn" type="button" id="pfCancel">${esc(tr('shell.cancel'))}</button>`}
        </div>
      </form>`);
    $('pfForm').onsubmit = (e) => {
      e.preventDefault();
      const name = $('pfName').value.trim();
      if (!name) return;
      createProfile(name, Number($('pfClass').value));
      this.closeModal();
      this.render();
    };
    if ($('pfCancel')) $('pfCancel').onclick = () => this.closeModal();
    setTimeout(() => $('pfName') && $('pfName').focus(), 50);
  }

  pickProfile() {
    const list = profiles();
    this.openModal(`
      <header><h2>${esc(tr('shell.whoPlays'))}</h2><button class="x" id="pfClose">${esc(tr('common.close'))}</button></header>
      <div class="scroll">
        <div class="pf-list">${list.map((p) => `
          <div class="pf-row ${p.id === (activeProfile() || {}).id ? 'on' : ''}">
            <button class="pf-pick" data-id="${p.id}"><b>${esc(p.name)}</b><i>${esc(p.cls > 12 ? tr('shell.college') : tr('shell.class', { c: p.cls }))}</i></button>
            <select class="pf-cls" data-id="${p.id}" aria-label="${esc(tr('shell.classLabel'))}">${this.classOptions(p.cls)}</select>
            <button class="mini-btn" data-del="${p.id}">${esc(tr('shell.delete'))}</button>
          </div>`).join('')}</div>
        <div class="sheet-actions"><button class="btn primary" id="pfNew">${esc(tr('shell.newPlayer'))}</button></div>
      </div>`);
    $('pfClose').onclick = () => this.closeModal();
    $('pfNew').onclick = () => this.editProfile();
    this.modal.querySelectorAll('.pf-pick').forEach((b) => { b.onclick = () => { setActive(b.dataset.id); this.closeModal(); this.render(); }; });
    this.modal.querySelectorAll('.pf-cls').forEach((s) => {
      s.onchange = () => { const p = profiles().find((x) => x.id === s.dataset.id); p.cls = Number(s.value); saveProfiles(); this.render(); };
    });
    this.modal.querySelectorAll('[data-del]').forEach((b) => {
      b.onclick = () => {
        const p = profiles().find((x) => x.id === b.dataset.del);
        if (!window.confirm(tr('shell.deleteAsk', { name: p.name }))) return;
        removeProfile(p.id);
        if (!activeProfile()) { this.closeModal(); this.editProfile(true); return; }
        this.pickProfile();
        this.render();
      };
    });
  }

  // ---------- placement test ----------
  async placementQuestions(tier) {
    const get = (u) => fetch(u).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    if (tier === 'professional') {
      const own = await get('content/questions/professional/placement.json');
      if (own.length >= 10) return bankItems(own, 10);
    }
    const packs = await Promise.all([0, 1, 2, 3].map((f) => get(`content/questions/scientist/form-${f}.json`)));
    const pool = packs.flat().filter((q) => q.cls >= (tier === 'professional' ? 12 : 11));
    return bankItems(pool, 10);
  }

  async placement(tier) {
    this.openModal(`<header><h2>${esc(tr('pl.title', { tier: tr(`tier.${tier}`) }))}</h2></header><div class="scroll"><p>${esc(tr('pl.loading'))}</p></div>`);
    const qs = await this.placementQuestions(tier);
    const z = { qs, i: 0, score: 0, picked: null };
    const draw = () => {
      if (z.i >= z.qs.length) {
        const pass = z.score >= 7;
        if (pass) { const p = activeProfile(); p.placement[tier] = true; saveProfiles(); }
        this.openModal(`<header><h2>${esc(tr('pl.title', { tier: tr(`tier.${tier}`) }))}</h2></header>
          <div class="scroll"><p class="score">${z.score} / ${z.qs.length}</p>
          <p class="lead">${esc(tr(pass ? 'pl.pass' : 'pl.fail', { s: z.score, n: z.qs.length, tier: tr(`tier.${tier}`) }))}</p>
          <div class="sheet-actions"><button class="btn primary" id="plDone">${esc(tr('pl.close'))}</button></div></div>`);
        $('plDone').onclick = () => { this.closeModal(); this.render(); };
        return;
      }
      const q = z.qs[z.i];
      const answered = z.picked !== null;
      this.openModal(`<header><h2>${esc(tr('pl.title', { tier: tr(`tier.${tier}`) }))}</h2><button class="x" id="plClose">${esc(tr('common.close'))}</button></header>
        <div class="scroll">
          <p class="eyebrow">${esc(tr('pl.q', { i: z.i + 1, n: z.qs.length }))}${getLang() !== 'en' ? ' ' + esc(tr('pl.en')) : ''}</p>
          <h3 class="question" lang="en">${esc(q.q)}</h3>
          <div class="qopts">${q.opts.map((o, i) => `<button class="qopt ${answered && i === q.ans ? 'right' : answered && i === z.picked ? 'wrong' : ''}" data-i="${i}" ${answered ? 'disabled' : ''} lang="en"><span class="letter">${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>
          ${answered ? `<p class="feedback ${z.picked === q.ans ? 'good' : 'bad'}">${esc(z.picked === q.ans ? tr('pl.right') : tr('pl.wrong', { a: q.opts[q.ans] }))}${q.why ? ` <span class="why" lang="en">${esc(q.why)}</span>` : ''}</p>
          <div class="sheet-actions"><button class="btn primary" id="plNext">${esc(tr(z.i + 1 < z.qs.length ? 'pl.next' : 'pl.finish'))}</button></div>` : ''}
        </div>`);
      $('plClose').onclick = () => this.closeModal();
      this.modal.querySelectorAll('.qopt').forEach((b) => { b.onclick = () => { z.picked = Number(b.dataset.i); if (z.picked === q.ans) z.score++; draw(); }; });
      if ($('plNext')) $('plNext').onclick = () => { z.i++; z.picked = null; draw(); };
    };
    draw();
  }
}
