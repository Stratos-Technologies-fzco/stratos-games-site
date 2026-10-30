/* Boot, typed screen navigation and run lifecycle (App Flow sections 2, 3, 7).
   Screens are a closed set of states, not scattered booleans. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var S = DF.S, UI = DF.UI, G = DF.Game, A = DF.Audio, B = DF.balance;
  DF.build = '20261030'; DF.save = null; DF.hasSave = false;
  var STATES = ['loading', 'privacy', 'title', 'story', 'lore', 'hud', 'pause', 'summary', 'sanctuary', 'evolution', 'upgrades', 'codex', 'missions', 'settings', 'credits', 'error'];
  var M = { title: '01-title-genesis-pulse', sanctuary: '05-sanctuary-dawn', hud: '02-explore-verdant-valley' };
  var MUSIC = { loading: M.title, privacy: M.title, title: M.title, story: M.title, lore: M.title, sanctuary: M.sanctuary, evolution: M.sanctuary, upgrades: M.sanctuary, codex: M.sanctuary, missions: M.sanctuary, credits: M.sanctuary };
  var Nav = DF.Nav = { state: 'loading', run: null, settingsFrom: 'title', errCtx: null, warned: false, summary: null, scale: 1, hudTimer: 0 };

  function sv() { return DF.save; }
  function refreshHasSave() { var s = DF.save; DF.hasSave = !!(s && (s.progress.expeditions > 0 || s.profile.tutorialCompleted)); }
  function persist() { return DF.Store.saveNow(DF.save); }

  /* ---------- navigation ---------- */
  function go(state, p, opts) {
    if (STATES.indexOf(state) < 0) throw new Error('bad state ' + state);
    opts = opts || {};
    var st = UI.st; st.confirm = false; st.newConfirm = false; st.modal = false; st.restartConfirm = false;
    Nav.state = state;
    var m = MUSIC[state]; if (m && !opts.keepMusic) A.play(m, 900);
    if (state === 'sanctuary' || state === 'missions') { if (DF.rollDaily(sv())) DF.Store.saveSoon(sv()); }
    if (state === 'sanctuary' && !DF.objectiveUnlocked(sv(), st.obj)) st.obj = 'egg';
    if (state === 'evolution') st.evo = sv().profile.selectedEvolution || st.evo || 'swiftclaw';
    UI.show(state, p);
    if (state === 'hud') { UI.bindHud(G); if (G.S && G.S.tut) UI.tutCard(G.S.tut.step); UI.hudTick(G.snapshot()); }
  }
  DF.go = go;

  /* ---------- boot ---------- */
  function boot() {
    UI.init(); fit(); G.init(document.getElementById('cv'), DF.Assets);
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, function () { A.unlock(); }, { passive: true }); });
    UI.onAct = onAct; UI.onSet = onSet;
    G.onToast = function (m, k) { UI.toast(m, k); };
    G.onTutorial = function (step) { UI.tutCard(step); };
    G.onCombat = function (on) { A.play(on ? '03-combat-raider-ambush' : M.hud, 1000); };
    G.onEnd = endRun; G.onPauseRequest = pause;
    DF.onSaveStatus = function (ok) {
      if (ok) { Nav.warned = false; return; }
      if (Nav.warned) return; Nav.warned = true;
      UI.toast('Progress may not be saving. Open Settings or free up space.', '');
      if (Nav.state !== 'hud' && Nav.state !== 'loading' && Nav.state !== 'error') { Nav.errCtx = { variant: 'storage-full', from: Nav.state }; go('error', { variant: 'storage-full' }, { keepMusic: true }); }
    };
    DF.save = DF.defaultSave(); // placeholder until the real save is read; also gives audio default settings
    runBoot();
  }
  function runBoot() {
    var t0 = Date.now(), tip = 0, tipTimer;
    go('loading', { pct: 0, tip: 0 });
    tipTimer = setInterval(function () { if (Nav.state === 'loading' && !UI.p.error) { tip++; UI.p.tip = tip; var el = document.querySelector('.scr b'); /* tip rotates on next render */ } }, 2500);
    DF.Assets.load(function (p) { UI.setProgress(p * 0.85); }).then(function () {
      return DF.Store.init();
    }).then(function (res) {
      UI.setProgress(1);
      var wait = Math.max(0, 900 - (Date.now() - t0));
      return new Promise(function (r) { setTimeout(function () { r(res); }, wait); });
    }).then(function (res) {
      clearInterval(tipTimer);
      applyLoad(res);
    }).catch(function (e) {
      clearInterval(tipTimer);
      go('loading', { pct: 0.4, error: true }, { keepMusic: true });
    });
    A.preload(M.title);
  }
  function applyLoad(res) {
    Nav.errCtx = null;
    if (res.status === 'ok') { DF.save = res.save; }
    else if (res.status === 'none') { DF.save = DF.defaultSave(); }
    else if (res.status === 'invalid') {
      DF.save = DF.defaultSave(); Nav.errCtx = { variant: 'invalid-save', backup: res.backup, boot: true };
      go('error', { variant: 'invalid-save', backup: res.backup, when: res.backup ? new Date(res.backup.updatedAt).toLocaleString() : '' }); return;
    } else if (res.status === 'unavailable') {
      DF.save = DF.defaultSave(); Nav.errCtx = { variant: 'storage-full', boot: true };
      go('error', { variant: 'storage-full' }); return;
    }
    afterLoad();
  }
  function afterLoad() {
    var s = sv(); refreshHasSave(); DF.rollDaily(s); document.body.classList.toggle('rm', s.settings.reducedEffects || reducedMotionPref());
    A.refresh();
    if (s.consent.analytics === 'unset') go('privacy'); else go('title');
    A.preload('05-sanctuary-dawn'); A.preload('02-explore-verdant-valley');
  }
  function reducedMotionPref() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  /* ---------- run lifecycle ---------- */
  function startRun(objId, tutorial, restart) {
    var s = sv(), resumingTutorial = tutorial && s.progress.expeditions > 0 && !s.profile.tutorialCompleted;
    if (!restart && !resumingTutorial) { s.progress.expeditions++; refreshHasSave(); persist(); }
    var base = 'exp-' + s.progress.expeditions;
    Nav.restarts = restart ? (Nav.restarts || 0) + 1 : 0;
    Nav.run = { objId: objId, tutorial: !!tutorial, runId: base + (Nav.restarts ? '-r' + Nav.restarts : '') };
    A.setDuck(1); A.stopStinger && A.stopStinger();
    A.play(M.hud, 900); A.preload('03-combat-raider-ambush');
    if (objId === 'boss') A.preload('04-boss-thornback');
    go('hud', { tutorial: !!tutorial, objId: objId }, { keepMusic: true });
    G.resize(Nav.scale);
    G.start({ objective: objId, tutorial: !!tutorial, runId: Nav.run.runId });
    clearInterval(Nav.hudTimer);
    Nav.hudTimer = setInterval(function () { if (Nav.state === 'hud' && !G.isPaused()) UI.hudTick(G.snapshot()); }, 100);
    DF.track('expedition_started', { objective: objId });
  }
  function pause() {
    if (Nav.state !== 'hud' || !G.isRunning()) return;
    G.pause(); var snap = G.snapshot(); A.setDuck(0.3);
    UI.st.restartConfirm = false; go('pause', { snap: snap, objId: Nav.run.objId, demo: !!Nav.demo }, { keepMusic: true });
  }
  function resume() { A.setDuck(1); go('hud', { tutorial: Nav.run.tutorial, objId: Nav.run.objId, demo: !!Nav.demo }, { keepMusic: true }); if (Nav.demo) UI.demoMode(); G.resume(); }
  function leaveRun() { clearInterval(Nav.hudTimer); G.quitRun(); G.clear(); A.setDuck(1); }

  /* Commit rewards once, update progress, then show the summary (SCR-07). */
  function endRun(res) {
    if (Nav.demo) { endDemo(); return; }
    clearInterval(Nav.hudTimer);
    var s = sv(), ok = res.outcome === 'success', before = s.player.level;
    var o = res.tutorial ? B.objectives.egg : B.objectives[res.objectiveId], r = { food: res.gained.food, dna: res.gained.dna, tokens: res.gained.tokens, xp: res.gained.xp };
    var firstExp = !s.profile.firstExpeditionCompleted;
    if (ok) {
      r.food += o.bonus.food; r.dna += o.bonus.dna; r.tokens += o.bonus.tokens; r.xp += o.bonus.xp;
      if (res.objectiveId === 'boss' && s.progress.grantedRewardIds.indexOf('boss-thornback-first') < 0) {
        DF.commitGrant(s, 'boss-thornback-first', { dna: 0 }); r.dna += o.firstKill.dna; r.tokens += o.firstKill.tokens;
      }
      if (firstExp) { var need = B.evolution.dnaCost - (s.inventory.dnaFragments + r.dna); if (need > 0) r.dna += need; } // guarantees the first evolution is affordable
    }
    var applied = DF.commitGrant(s, res.runId, r) || { food: 0, dna: 0, tokens: 0, xp: 0 };
    if (!applied.xp && !applied.food && !applied.dna && !applied.tokens) r = { food: 0, dna: 0, tokens: 0, xp: 0 };
    if (ok) {
      s.profile.firstExpeditionCompleted = true; if (res.tutorial) { s.profile.tutorialCompleted = true; s.profile.tutorialStep = 4; }
      if (res.bossDown && s.progress.bossesDefeated.indexOf('thornback') < 0) s.progress.bossesDefeated.push('thornback');
      DF.missionEvent(s, 'expedition', 1);
    }
    res.newEggs.forEach(function (id) { DF.discover(s, 'egg', id); });
    res.seen.forEach(function (id) { if (DF.SPECIES.indexOf(id) >= 0) DF.discover(s, 'species', id); });
    if (res.bossDown) DF.discover(s, 'species', 'thornback');
    DF.missionEvent(s, 'berry', res.berries); DF.missionEvent(s, 'kill:raider', res.kills.raider || 0); DF.missionEvent(s, 'kill', res.kills.total || 0); DF.missionEvent(s, 'dodge', res.dodges); DF.missionEvent(s, 'ability', res.abilities);
    persist();
    var after = s.player.level, next;
    if (!ok) next = S.summary.nextTip;
    else if (!s.profile.selectedEvolution) next = S.summary.nextEvo;
    else if (res.objectiveId !== 'boss' && DF.objectiveUnlocked(s, 'boss')) next = S.summary.nextBoss;
    else next = S.summary.nextGeneric;
    var p = { outcome: res.outcome, objId: res.tutorial ? 'egg' : res.objectiveId, reward: r, n: s.progress.expeditions, newEgg: res.newEggs[0] || '', levelUp: after > before ? after : 0, next: next };
    Nav.summary = p; Nav.run.objId = res.tutorial ? 'egg' : res.objectiveId; Nav.run.tutorial = false;
    DF.track(ok ? 'expedition_complete' : 'expedition_failed', { objective: res.objectiveId, ms: Math.round(res.duration) });
    if (res.bossDown) DF.track('boss_result', { result: 'win' }); else if (res.objectiveId === 'boss') DF.track('boss_result', { result: 'loss' });
    if (res.tutorial && ok) DF.track('tutorial_complete', {});
    G.quitRun(); G.clear();
    A.setDuck(1);
    A.stinger(ok ? '06-stinger-victory' : '07-stinger-defeat', { stopMusic: true, onEnd: function () { if (Nav.state === 'summary') A.play(M.sanctuary, 1400); } });
    go('summary', p, { keepMusic: true });
    if (p.levelUp) setTimeout(function () { A.sfx('levelup'); }, 600);
  }

  /* ---------- demo: the game plays a short scripted run by itself ---------- */
  function startDemo() {
    Nav.demo = true; Nav.demoStage = -1; Nav.demoStageAt = 0; Nav.run = { objId: 'demo', tutorial: false, runId: 'demo' };
    A.setDuck(1); A.play(M.hud, 900); A.preload('03-combat-raider-ambush');
    go('hud', { demo: true, objId: 'demo' }, { keepMusic: true });
    UI.demoMode(); G.resize(Nav.scale);
    G.start({ demo: true, runId: 'demo' });
    clearInterval(Nav.hudTimer);
    Nav.hudTimer = setInterval(function () {
      if (Nav.state !== 'hud' || !Nav.demo) return;
      var s = G.snapshot(); UI.hudTick(s); if (!s) return;
      var want = s.eggReady ? 3 : s.abilitiesUsed > 0 ? 2 : (s.combat || s.kills > 0) ? 1 : 0, now = Date.now();
      if (want > Nav.demoStage && now - Nav.demoStageAt > 3000) { Nav.demoStage = Math.min(want, Nav.demoStage + 1 > want ? want : Nav.demoStage + 1); Nav.demoStageAt = now; }
      if (Nav.demoStage < 0) { Nav.demoStage = 0; Nav.demoStageAt = now; }
      UI.caption(S.demo.caps[Nav.demoStage]);
    }, 100);
  }
  function endDemo() {
    if (!Nav.demo) return; Nav.demo = false; leaveRun();
    go('title'); UI.toast(S.demo.end, 'egg');
  }

  /* ---------- actions from the UI ---------- */
  function newGameStart() {
    var old = sv(), fresh = DF.defaultSave();
    fresh.installId = old.installId; fresh.settings = old.settings; fresh.consent = old.consent;
    if (DF.hasSave) DF.Store.backupOf(old);
    DF.save = fresh; DF.rollDaily(fresh); refreshHasSave(); persist(); go('story');
  }
  /* Back to the Stratos Games site: leave the play-page frame and load the full address (works on localhost too). */
  function toStratos() {
    var url = S.stratosLink;
    try { window.top.location.href = url; } catch (e) {
      try { window.open(url, '_top'); } catch (e2) { window.location.href = url; }
    }
  }
  function settingsBack() { if (Nav.settingsFrom === 'pause') go('pause', { snap: G.snapshot(), objId: Nav.run.objId, demo: !!Nav.demo }, { keepMusic: true }); else go('title'); }

  var acts = {
    stratos: toStratos,
    lore: function () { go('lore'); },
    loreBack: function () { go('title'); },
    demo: function () { startDemo(); },
    skipDemo: function () { endDemo(); },
    retryLoad: function () { runBoot(); },
    consent: function (d) { var c = sv().consent; c.analytics = d.v; c.decidedAt = new Date().toISOString(); c.policyVersion = 1; persist(); DF.track('consent_set', {}); go('title'); },
    privacyFull: function () { UI.st.modal = true; UI.refresh(); },
    privacyView: function () { UI.st.modal = true; UI.refresh(); },
    closeModal: function () { UI.st.modal = false; UI.refresh(); },
    continue: function () { var s = sv(); DF.rollDaily(s); if (!s.profile.tutorialCompleted) startRun('egg', true); else go('sanctuary'); },
    newGame: function () { if (DF.hasSave) { UI.st.newConfirm = true; UI.refresh(); } else newGameStart(); },
    newGameYes: function () { newGameStart(); },
    newGameNo: function () { UI.st.newConfirm = false; UI.refresh(); },
    settings: function () { Nav.settingsFrom = 'title'; go('settings', {}, { keepMusic: true }); },
    credits: function () { go('credits'); },
    toTitle: function () { go('title'); },
    storyGo: function () { sv().profile.storySeen = true; persist(); startRun('egg', true); },
    storySkip: function () { sv().profile.storySeen = true; persist(); startRun('egg', true); },
    pause: pause, resume: resume,
    pauseSettings: function () { Nav.settingsFrom = 'pause'; go('settings', {}, { keepMusic: true }); },
    restartAsk: function () { UI.st.restartConfirm = true; UI.refresh(); },
    restartNo: function () { UI.st.restartConfirm = false; UI.refresh(); },
    restartYes: function () { leaveRun(); startRun(Nav.run.objId, Nav.run.tutorial, true); },
    exitTitle: function () { if (Nav.demo) { endDemo(); return; } leaveRun(); go('title'); },
    hudSettings: function () { pause(); if (Nav.state === 'pause') acts.pauseSettings(); },
    skipTut: function () { leaveRun(); sv().profile.tutorialCompleted = true; persist(); startRun('egg', false); },
    toSanctuary: function () { go('sanctuary'); },
    again: function () { startRun(Nav.summary.objId, false); },
    retry: function () { startRun(Nav.summary.objId, false); },
    evo: function () { go('evolution'); },
    upgrades: function () { go('upgrades'); },
    codex: function () { go('codex'); },
    missions: function () { go('missions'); },
    pickObj: function (d) { UI.st.obj = d.id; UI.refresh(); },
    start: function () { var id = UI.st.obj; if (!DF.objectiveUnlocked(sv(), id)) id = 'egg'; startRun(id, false); },
    pickEvo: function (d) { UI.st.evo = d.id; UI.st.confirm = false; UI.refresh(); },
    evoAsk: function () { UI.st.confirm = true; UI.refresh(); },
    evoCancel: function () { UI.st.confirm = false; UI.refresh(); },
    evoConfirm: function () {
      var s = sv(), id = UI.st.evo, cost = DF.evolveCost(s);
      if (!s.profile.firstExpeditionCompleted || s.profile.selectedEvolution === id || !DF.spend(s, cost)) { A.sfx('deny'); UI.st.confirm = false; UI.refresh(); return; }
      s.profile.selectedEvolution = id; persist(); DF.track('evolution_chosen', { path: id });
      A.stinger('09-stinger-evolution'); UI.toast('You evolved into ' + S.evo.paths[id].name + '!', 'egg'); go('sanctuary', {}, { keepMusic: true });
    },
    buy: function (d) {
      var s = sv(), id = d.id, def = B.upgrades[id], lv = s.upgrades[id] || 0; if (lv >= def.max) return;
      if (!DF.spend(s, { tokens: DF.upgradeCost(id, lv) })) { A.sfx('deny'); return; }
      s.upgrades[id] = lv + 1; persist(); A.sfx('claim'); UI.refresh();
    },
    tab: function (d) { UI.st.tab = d.id; UI.refresh(); },
    claim: function (d) { var r = DF.claimMission(sv(), d.id); if (r) { persist(); A.sfx('claim'); UI.refresh(); } },
    settingsBack: settingsBack,
    errTitle: function () { go('title'); },
    errPlay: function () { Nav.warned = true; if (Nav.errCtx && Nav.errCtx.boot) afterLoad(); else go(Nav.errCtx && Nav.errCtx.from || 'title'); },
    errPrimary: function () {
      var c = Nav.errCtx || {};
      if (c.variant === 'invalid-save') {
        if (c.backup) { DF.save = c.backup; } else { DF.save = DF.defaultSave(); }
        refreshHasSave(); persist().then(function () { afterLoad(); });
      } else if (c.variant === 'storage-full') {
        if (c.boot) { DF.Store.init().then(function (res) { if (res.status === 'unavailable') UI.toast('Storage is still unavailable.', ''); else applyLoad(res); }); }
        else persist().then(function (ok) { if (ok) { Nav.warned = false; go(c.from || 'title'); } else UI.toast('Still can’t save. Check browser storage and retry.', ''); });
      } else go('title');
    }
  };
  function onAct(name, d) { if (acts[name]) acts[name](d || {}); }

  function onSet(key, v) {
    var s = sv(), st = s.settings;
    if (key === 'analytics') { s.consent.analytics = v ? 'granted' : 'denied'; s.consent.decidedAt = new Date().toISOString(); persist(); return; }
    st[key] = v;
    if (key === 'reducedEffects') document.body.classList.toggle('rm', v || reducedMotionPref());
    A.refresh(); DF.Store.saveSoon(s, 400);
  }

  /* ---------- keyboard in menus ---------- */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && !(e.code === 'KeyP' && Nav.state === 'pause')) return;
    var back = { evolution: 'toSanctuary', upgrades: 'toSanctuary', codex: 'toSanctuary', missions: 'toSanctuary', sanctuary: 'toTitle', settings: 'settingsBack', credits: 'toTitle', pause: 'resume', lore: 'loreBack' }[Nav.state];
    if (UI.st.modal) { UI.st.modal = false; UI.refresh(); return; }
    if (back) { e.stopImmediatePropagation(); onAct(back); } // keep the game's own Esc/P handler from re-pausing in the same key press
  });

  /* ---------- focus, resize, visibility ---------- */
  function fit() {
    var iw = window.innerWidth, ih = window.innerHeight, sc = Math.min(iw / 844, ih / 390), st = document.getElementById('stage');
    Nav.scale = sc; st.style.transform = 'translate(' + Math.round((iw - 844 * sc) / 2) + 'px,' + Math.round((ih - 390 * sc) / 2) + 'px) scale(' + sc + ')';
    if (G.resize) G.resize(sc);
  }
  window.addEventListener('resize', function () { fit(); if (Nav.state === 'hud') pause(); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { fit(); if (Nav.state === 'hud') pause(); }, 200); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && Nav.state === 'hud') pause(); });
  window.addEventListener('blur', function () { if (Nav.state === 'hud') pause(); });
  window.addEventListener('offline', function () { UI.toast('You’re offline. Expeditions still work.', ''); });
  window.addEventListener('pagehide', function () { if (DF.save && DF.hasSave) DF.Store.saveNow(DF.save); });
  document.addEventListener('contextmenu', function (e) { if (Nav.state === 'hud') e.preventDefault(); });
  setInterval(function () { if (Nav.state === 'missions') UI.missionClock(); }, 30000);
  document.getElementById('rotate-msg').textContent = S.rotate;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.DF);
