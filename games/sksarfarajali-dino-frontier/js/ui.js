/* React-style UI layer: DOM screens layered over the canvas (App Flow section 4).
   Templates only. All rules live in the domain layer; clicks go out through UI.onAct / UI.onSet. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  var S = DF.S, T = {}, ui, cv, toastBox;
  var UI = DF.UI = { cur: '', p: {}, st: { obj: 'egg', tab: 'species', evo: 'swiftclaw', confirm: false, restartConfirm: false, newConfirm: false, modal: false }, touch: false, onAct: null, onSet: null, onBack: null };
  var BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F3EBD7" stroke-width="2.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var WARN = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F2B8B0" stroke-width="2" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>';

  function img(n) { return DF.Assets.url(n); }
  function F(t, v) { return DF.t(t, v); }
  function head(title, back, right, label) { return '<div class="hd"><button class="back" data-act="' + back + '" aria-label="' + (label || 'Back') + '">' + BACK + '</button><h2 class="h2">' + title + '</h2>' + (right || '') + '</div>'; }
  function res(label, v, color, onArt) { return '<span class="pill" style="color:' + color + (onArt ? ';background:rgba(14,23,18,.85)' : '') + '">' + label + ' ' + v + '</span>'; }
  function inv() { return DF.save.inventory; }

  /* ---------- SCR-02 Loading ---------- */
  T.loading = function (p) {
    var L = S.loading, pct = Math.round((p.pct || 0) * 100), tip = S.tips[(p.tip || 0) % S.tips.length];
    var body = p.error
      ? '<div class="row" style="gap:16px;padding:14px 16px;border-radius:14px;background:rgba(22,35,27,.95);border:1px solid var(--red)">' + WARN +
        '<div style="flex:1;font-size:14px;line-height:1.45"><b>' + L.errTitle + '</b>' + L.errBody + '</div>' +
        '<button class="btn pri" data-act="retryLoad" data-focus style="height:44px;font-size:15px">' + L.retry + '</button>' +
        '<button class="btn outl" data-act="stratos" style="height:44px;font-size:14px;font-weight:700;padding:0 14px">' + L.back + '</button></div>'
      : '<div class="col" style="gap:10px"><div class="row" style="justify-content:space-between;font-size:14px;font-weight:700"><span>' + L.title + '</span><span id="ld-pct">' + pct + '%</span></div>' +
        '<div role="progressbar" aria-label="Loading progress" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" id="ld-pb" style="height:10px;border-radius:99px;background:var(--line);overflow:hidden"><div id="ld-bar" style="height:100%;width:' + pct + '%;background:var(--gold);border-radius:99px;transition:width .2s"></div></div>' +
        '<div style="font-size:13.5px;color:var(--mut)"><b style="color:var(--gold)">' + L.tip + '</b> ' + tip + '</div></div>';
    return '<div class="scr solid"><img class="bgimg" src="' + img('canyon_styracosaur') + '" alt="" style="opacity:.55"><div class="fill" style="background:linear-gradient(to top,rgba(14,23,18,.95) 30%,rgba(14,23,18,.2))"></div>' +
      '<div class="col" style="position:absolute;left:48px;right:48px;bottom:36px;gap:14px"><div class="serif" style="font-size:34px;font-weight:700">' + S.game + '</div>' + body + '</div></div>';
  };

  /* ---------- SCR-16 Privacy ---------- */
  T.privacy = function () {
    var P = S.privacy;
    return '<div class="scr solid"><img class="bgimg" src="' + img('other_9') + '" alt="" style="opacity:.35">' +
      '<div class="fill row" style="justify-content:center;padding:20px"><div role="dialog" aria-labelledby="pv-title" class="col" style="width:560px;padding:22px 26px;border-radius:18px;background:var(--card);border:1px solid var(--line);gap:12px">' +
      '<h2 id="pv-title" class="serif" style="margin:0;font-size:22px">' + P.title + '</h2>' +
      '<p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--soft)">' + P.p1 + '</p>' +
      '<div class="row" style="gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg);font-size:13.5px"><span style="flex:none;font-weight:800;padding:3px 8px;border-radius:8px;border:1.5px solid var(--gold);color:var(--gold2)">13+</span><span>' + P.age + '</span></div>' +
      '<p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--soft)"><b style="color:var(--text)">' + P.p2a + '</b>' + P.p2b + '</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px"><button class="btn sec" data-act="consent" data-v="denied" data-focus>' + P.no + '</button><button class="btn sec" data-act="consent" data-v="granted">' + P.yes + '</button></div>' +
      '<button data-act="privacyFull" style="background:none;border:0;color:var(--gold);font-size:13px;font-weight:700;align-self:center;text-decoration:underline">' + P.more + '</button></div></div>' +
      (UI.st.modal ? modal(S.privacy.title, S.privacy.full) : '') + '</div>';
  };
  function modal(title, body) {
    return '<div class="dialog"><div class="box" role="dialog" aria-label="' + title + '"><h2 class="serif" style="margin:0;font-size:20px">' + title + '</h2><p style="margin:0;font-size:14px;line-height:1.55;color:var(--soft)">' + body + '</p><button class="btn pri" data-act="closeModal" data-focus>OK</button></div></div>';
  }

  /* ---------- SCR-03 Title ---------- */
  T.title = function () {
    var has = DF.hasSave, sv = DF.save, C = S.title;
    return '<div class="scr solid"><img class="bgimg" src="' + img('other_9') + '" alt="">' +
      '<div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,.94) 0%,rgba(14,23,18,.7) 42%,rgba(14,23,18,0) 75%)"></div>' +
      '<div class="col" style="position:absolute;left:44px;top:34px;bottom:28px;width:320px;gap:10px">' +
      '<h1 class="serif" style="margin:0;font-size:40px;font-weight:700;line-height:1">Dino<br>Frontier</h1>' +
      '<div style="font-size:12.5px;font-weight:800;letter-spacing:.16em;color:var(--gold);margin-bottom:10px">' + S.tagline.replace('&', '&amp;') + '</div>' +
      (has ? '<button class="btn pri" data-act="continue" data-focus style="justify-content:space-between"><span>' + C.cont + '</span><span style="font-size:12.5px;font-weight:700">Lv ' + sv.player.level + ' · Sanctuary</span></button>' : '') +
      '<button class="btn ' + (has ? 'sec' : 'pri') + '" data-act="newGame" ' + (has ? '' : 'data-focus') + ' style="justify-content:flex-start">' + C.newGame + '</button>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"><button class="btn ghost" data-act="lore" aria-label="' + C.storyAria + '" style="padding:0">' + C.story + '</button><button class="btn ghost" data-act="demo" aria-label="' + C.demoAria + '" style="padding:0">' + C.demo + '</button><button class="btn ghost" data-act="settings" style="padding:0">' + C.settings + '</button><button class="btn ghost" data-act="credits" style="padding:0">' + C.credits + '</button></div>' +
      (has ? '<div style="font-size:12px;color:var(--mut2);line-height:1.4">' + C.replaceNote + '</div>' : '') + '</div>' +
      '<button data-act="stratos" style="position:absolute;right:16px;top:14px;font-size:13px;font-weight:700;padding:10px 12px;border-radius:10px;background:rgba(14,23,18,.75);color:var(--text);border:0">' + C.stratos + '</button>' +
      '<div style="position:absolute;right:16px;bottom:12px;font-size:11.5px;color:var(--mut)">' + S.version + ' · English</div>' +
      (UI.st.newConfirm ? '<div class="dialog"><div class="box" role="dialog" aria-labelledby="nc"><h2 id="nc" class="serif" style="margin:0;font-size:22px">' + C.confirmTitle + '</h2><p style="margin:0;font-size:14px;line-height:1.5;color:var(--soft)">' + F(C.confirmBody, { lv: sv.player.level, tokens: sv.inventory.frontierTokens }) + '</p><button class="btn danger" data-act="newGameYes">' + C.confirmYes + '</button><button class="btn pri" data-act="newGameNo" data-focus style="height:44px;font-size:15px">' + C.confirmNo + '</button></div></div>' : '') + '</div>';
  };

  /* ---------- story card (App Flow first-time step 3) ---------- */
  T.story = function () {
    var C = S.story, skip = DF.save.profile.tutorialCompleted;
    return '<div class="scr solid"><img class="bgimg" src="' + img('lost_expedition_raptor') + '" alt="" style="opacity:.5">' +
      '<div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,.97) 45%,rgba(14,23,18,.3))"></div>' +
      '<div class="col" style="position:absolute;left:44px;top:0;bottom:0;width:480px;justify-content:center;gap:12px"><div class="eyebrow">' + C.eyebrow + '</div>' +
      '<h2 class="serif" style="margin:0;font-size:28px">' + C.title + '</h2><p style="margin:0;font-size:15px;line-height:1.6;color:var(--soft)">' + C.body + '</p>' +
      '<div class="row" style="gap:10px;margin-top:6px"><button class="btn pri" data-act="storyGo" data-focus style="padding:0 26px">' + C.go + '</button>' + (skip ? '<button class="btn outl" data-act="storySkip" style="padding:0 18px">' + C.skip + '</button>' : '') + '</div></div></div>';
  };

  /* ---------- Story (title screen) ---------- */
  T.lore = function () {
    var L = S.lore, goals = L.goals.map(function (g, i) {
      return '<div class="col" style="flex:1;padding:10px 12px;border-radius:12px;background:rgba(22,35,27,.92);border:1px solid var(--line);gap:3px"><span style="font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--gold)">' + (i + 1) + ' · ' + g[0].toUpperCase() + '</span><span style="font-size:12.5px;line-height:1.4;color:var(--soft)">' + g[1] + '</span></div>';
    }).join('');
    return '<div class="scr solid"><img class="bgimg" src="' + img('lost_expedition_raptor') + '" alt="" style="opacity:.55"><div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,.97) 52%,rgba(14,23,18,.25))"></div>' +
      '<div class="col" style="position:absolute;left:44px;top:22px;bottom:22px;width:560px;justify-content:center;gap:10px"><div class="eyebrow">' + L.eyebrow + '</div><h2 class="serif" style="margin:0;font-size:28px">' + L.title + '</h2>' +
      '<p style="margin:0;font-size:13.5px;line-height:1.55;color:var(--soft)">' + L.p1 + '</p><p style="margin:0;font-size:13.5px;line-height:1.55;color:var(--soft)">' + L.p2 + '</p>' +
      '<div class="row" style="gap:8px;align-items:stretch">' + goals + '</div>' +
      '<div class="row" style="gap:10px;margin-top:2px"><button class="btn pri" data-act="demo" style="padding:0 22px;height:44px;font-size:15px">' + L.demo + '</button><button class="btn outl" data-act="loreBack" data-focus style="padding:0 20px;height:44px">' + L.back + '</button></div></div></div>';
  };

  /* ---------- SCR-04/05 HUD (with tutorial card) ---------- */
  T.hud = function (p) {
    var H = S.hud, tut = p.tutorial, demo = p.demo, ret = DF.save.profile.tutorialCompleted, hideCtl = (tut ? 'display:none' : '');
    var heart = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#E5534B" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>';
    var bolt = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#4FD1C5" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>';
    var lock = '<svg class="lk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B9C2B0" stroke-width="2.5" aria-hidden="true" style="display:none"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';
    return '<div class="scr clear">' +
      '<div class="hudp" style="left:14px;top:12px;width:230px;padding:10px 12px;border-radius:14px;display:flex;flex-direction:column;gap:7px">' +
      '<div class="row" style="gap:8px">' + heart + '<div class="meter" role="meter" id="hp-m" aria-label="Health" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="background:#3A2724"><div id="hp-b" style="width:100%;height:100%;background:#E5534B"></div></div><span id="hp-t" style="font-size:12px;font-weight:800;width:48px;text-align:right">100/100</span></div>' +
      '<div class="row" style="gap:8px">' + bolt + '<div class="meter" role="meter" id="en-m" aria-label="Energy" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="background:#1F3533"><div id="en-b" style="width:100%;height:100%;background:#4FD1C5"></div></div><span id="en-t" style="font-size:12px;font-weight:800;width:48px;text-align:right">100/100</span></div>' +
      '<div id="en-msg" style="display:none;font-size:11.5px;font-weight:800;color:#9FE7DF">' + H.depleted + '</div></div>' +
      (tut ? '<div id="tut" class="hudp" role="status" aria-live="polite" style="left:50%;top:12px;transform:translateX(-50%);width:352px;padding:10px 14px;border-radius:14px;background:rgba(14,23,18,.92);border:1px solid var(--gold);display:flex;flex-direction:column;gap:6px"></div>'
        : '<div id="obj" class="hudp" style="left:50%;top:12px;transform:translateX(-50%);padding:8px 14px;border-radius:99px;font-size:13px;font-weight:700;white-space:nowrap"><span style="color:var(--gold);font-weight:800">' + H.objective + '</span> <span id="obj-t"></span></div>') +
      '<div class="hudp row" style="right:70px;top:12px;padding:8px 12px;border-radius:12px;gap:14px;font-size:13px;font-weight:800"><span title="Food" style="color:var(--food)">' + H.food + ' <span id="r-f">0</span></span><span title="DNA Fragments" style="color:var(--dna)">' + H.dna + ' <span id="r-d">0</span></span><span title="Frontier Tokens" style="color:var(--gold2)">◉ <span id="r-t">0</span></span></div>' +
      (demo ? '<button class="hudp hit btn" data-act="skipDemo" data-focus style="right:14px;top:12px;height:44px;padding:0 14px;border-radius:12px;font-size:13px;font-weight:800;border:1px solid var(--gold)">' + S.demo.skip + ' ✕</button><div class="hudp" style="left:14px;top:96px;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:800;letter-spacing:.14em;color:#1A1408;background:var(--gold)">' + S.demo.badge + '</div>' :
      '<button class="hudp hit row" data-act="pause" aria-label="' + H.pause + '" style="right:14px;top:12px;width:44px;height:44px;border-radius:12px;border:0;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="#F3EBD7" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button>') +
      '<div id="bossbar" class="hudp" style="display:none;left:50%;bottom:12px;transform:translateX(-50%);width:340px;padding:7px 12px;border-radius:12px"><div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--gold);margin-bottom:4px">THORNBACK</div><div class="meter" style="background:#3A2724;height:9px"><div id="boss-b" style="width:100%;height:100%;background:#C9A56A"></div></div></div>' +
      '<div id="joy" class="hit" aria-label="Move joystick" style="' + (UI.touch ? '' : 'display:none') + '"><i></i></div>' +
      '<div id="jlabel" style="position:absolute;left:34px;bottom:8px;font-size:11.5px;font-weight:700;width:120px;text-align:center;' + (UI.touch ? '' : 'display:none') + '">' + S.tutorial.dragOr.split(' · ')[0] + '</div>' +
      '<div style="position:absolute;right:24px;bottom:22px;width:200px;height:170px">' +
      '<button id="b-atk" class="hit circle" aria-label="Attack" style="right:0;bottom:0;width:84px;height:84px;border:3px solid var(--text);background:rgba(14,23,18,.8);font-size:12px">' + H.attack + '</button>' +
      '<button id="b-dash" class="hit circle on" style="right:96px;bottom:6px;width:64px;height:64px;' + (tut ? 'display:none' : '') + '">' + lock + '<span>' + H.dash + '</span><span id="dash-s" style="font-size:10px;font-weight:700">−15</span></button>' +
      '<button id="b-abil" class="hit circle on" style="right:52px;bottom:98px;width:64px;height:64px;' + (tut ? 'display:none' : '') + '">' + lock + '<span>' + H.ability + '</span><span id="abil-s" style="font-size:10px;font-weight:700">−30</span></button></div>' +
      '<div id="keys" style="position:absolute;left:14px;bottom:6px;font-size:11px;background:rgba(14,23,18,.7);padding:3px 8px;border-radius:6px;' + (UI.touch ? 'display:none' : '') + '">' + H.keys + '</div>' +
      (tut && ret ? '<button class="btn hit" data-act="skipTut" style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);height:44px;padding:0 16px;border-radius:12px;background:rgba(14,23,18,.85);font-size:14px;font-weight:700">' + S.tutorial.skip + '</button>' : '') +
      '</div>';
  };
  UI.tutCard = function (step) {
    var el = document.getElementById('tut'); if (!el) return; var C = S.tutorial, s = C.steps[Math.max(0, Math.min(3, step))], dots = '';
    for (var i = 0; i < 4; i++) dots += '<span style="display:block;width:' + (i === step ? 18 : 8) + 'px;height:8px;border-radius:99px;background:' + (i <= step ? '#E8B54A' : '#4A5A4E') + '"></span>';
    el.innerHTML = '<div class="row" style="justify-content:space-between"><span class="eyebrow">' + F(C.step, { n: step + 1 }) + '</span><div class="row" style="gap:6px" aria-hidden="true">' + dots + '</div></div><div style="font-size:16px;font-weight:800">' + s[0] + '</div><div style="font-size:13px;color:var(--soft);line-height:1.4">' + s[1] + '</div>';
  };
  UI.hudTick = function (s) {
    if (!s) return;
    var q = function (id) { return document.getElementById(id); }, H = S.hud;
    var hp = q('hp-b'); if (!hp) return;
    hp.style.width = (100 * s.hp / s.maxHp) + '%'; q('hp-t').textContent = s.hp + '/' + s.maxHp; q('hp-m').setAttribute('aria-valuenow', Math.round(100 * s.hp / s.maxHp));
    q('en-b').style.width = (100 * s.en / s.maxEn) + '%'; q('en-t').textContent = s.en + '/' + s.maxEn; q('en-m').setAttribute('aria-valuenow', Math.round(100 * s.en / s.maxEn));
    q('en-msg').style.display = s.en < s.dashCost ? 'block' : 'none';
    q('r-f').textContent = s.food; q('r-d').textContent = s.dna; q('r-t').textContent = s.tokens;
    var ot = q('obj-t'); if (ot) { var o = S.obj[s.objId]; ot.textContent = s.objId === 'boss' ? o.hud : F(o.hud, { b: Math.min(s.berries, s.need), n: s.need }); }
    var set = function (id, subId, ok, cost, label, cd) {
      var b = q(id); if (!b) return; var cls = 'hit circle ' + (ok ? 'on' : 'off') + (cd > 0 && ok ? ' cd' : '');
      if (b.className !== cls) b.className = cls;
      b.querySelector('.lk').style.display = ok ? 'none' : 'block'; q(subId).textContent = ok ? '−' + cost : H.noEnergy;
      b.setAttribute('aria-label', ok ? label + ', costs ' + cost + ' energy' : label + ' unavailable, no energy');
    };
    set('b-dash', 'dash-s', s.dashOk, s.dashCost, 'Dash', s.dashCd); set('b-abil', 'abil-s', s.abOk, s.abCost, s.abName, s.abCd);
    var bb = q('bossbar'); if (bb) { bb.style.display = s.boss ? 'block' : 'none'; if (s.boss) q('boss-b').style.width = (100 * s.boss.hp / s.boss.max) + '%'; }
  };
  /* touch controls (virtual joystick and buttons) */
  UI.bindHud = function (G) {
    var joy = document.getElementById('joy'), knob = joy && joy.firstChild, pid = null, cx0 = 0, cy0 = 0, R = 1;
    function move(e) {
      var sens = DF.save.settings.controlSensitivity, gain = 1.45 - sens * 0.06, dx = (e.clientX - cx0) / (R * gain), dy = (e.clientY - cy0) / (R * gain), l = Math.sqrt(dx * dx + dy * dy);
      if (l > 1) { dx /= l; dy /= l; l = 1; } if (l < 0.12) { dx = dy = 0; }
      G.setMove(dx, dy); knob.style.transform = 'translate(' + dx * 34 + 'px,' + dy * 34 + 'px)';
    }
    if (joy) {
      joy.addEventListener('pointerdown', function (e) { var r = joy.getBoundingClientRect(); R = r.width / 2; cx0 = r.left + R; cy0 = r.top + R; pid = e.pointerId; try { joy.setPointerCapture(pid); } catch (x) {} move(e); e.preventDefault(); });
      joy.addEventListener('pointermove', function (e) { if (e.pointerId === pid) move(e); });
      var up = function (e) { if (e.pointerId === pid) { pid = null; G.setMove(0, 0); knob.style.transform = ''; } };
      joy.addEventListener('pointerup', up); joy.addEventListener('pointercancel', up); joy.addEventListener('lostpointercapture', up);
    }
    var atk = document.getElementById('b-atk'), dash = document.getElementById('b-dash'), ab = document.getElementById('b-abil');
    atk.addEventListener('pointerdown', function (e) { G.press('attack'); G.hold('attack', true); e.preventDefault(); });
    var rel = function () { G.hold('attack', false); }; atk.addEventListener('pointerup', rel); atk.addEventListener('pointercancel', rel); atk.addEventListener('pointerleave', rel);
    dash.addEventListener('pointerdown', function (e) { G.press('dash'); e.preventDefault(); });
    ab.addEventListener('pointerdown', function (e) { G.press('ability'); e.preventDefault(); });
  };

  /* ---------- SCR-06 Pause ---------- */
  T.pause = function (p) {
    var C = S.pause, g = p.snap || { food: 0, dna: 0, tokens: 0 }, o = S.obj[p.objId || 'egg'];
    var objName = p.objId === 'boss' ? o.hud : o.hud.split(' ·')[0];
    var main = UI.st.restartConfirm
      ? '<p style="margin:0;font-size:14px;line-height:1.5;color:var(--soft);text-align:center">' + C.confirm + '</p><button class="btn danger" data-act="restartYes">' + C.yes + '</button><button class="btn pri" data-act="restartNo" data-focus style="height:44px;font-size:15px">' + C.keep + '</button>'
      : '<button class="btn pri" data-act="resume">' + C.resume + '</button><button class="btn dark" data-act="pauseSettings">' + C.settings + '</button><button class="btn dark" data-act="restartAsk">' + C.restart + '</button><button class="btn dark" data-act="exitTitle">' + C.exit + '</button>';
    return '<div class="scr"><div class="fill" style="background:rgba(14,23,18,.72)"></div><div class="fill row" style="justify-content:center;gap:28px">' +
      '<div role="dialog" aria-labelledby="pz" tabindex="-1" data-focus class="col" style="outline:none;width:300px;padding:20px;border-radius:18px;background:var(--card);border:1px solid var(--line);gap:10px"><h2 id="pz" class="serif" style="margin:0 0 4px;font-size:24px;text-align:center">' + C.title + '</h2>' + main + '</div>' +
      '<div class="col" style="width:230px;padding:16px;border-radius:16px;background:rgba(22,35,27,.85);border:1px solid var(--line);gap:8px;font-size:13px"><div class="eyebrow">' + C.panel + '</div>' +
      '<div class="row" style="justify-content:space-between;gap:8px"><span>' + C.objective + '</span><b style="text-align:right">' + objName + '</b></div>' +
      '<div class="row" style="justify-content:space-between"><span>' + C.food + '</span><b>' + g.food + '</b></div><div class="row" style="justify-content:space-between"><span>' + C.dna + '</span><b>' + g.dna + '</b></div><div class="row" style="justify-content:space-between"><span>' + C.tokens + '</span><b>' + g.tokens + '</b></div>' +
      '<div style="font-size:12px;color:var(--mut2);margin-top:4px">' + C.note + '</div></div></div></div>';
  };

  /* ---------- SCR-07 Summary ---------- */
  T.summary = function (p) {
    var C = S.summary, ok = p.outcome === 'success', r = p.reward, hero = p.objId === 'boss' ? 'volcanic_ruins_chasm' : (ok ? 'other_8' : 'canyon_styracosaur');
    var pill = 'font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px;';
    var cells = [[C.food, r.food, '#CFE8B0'], [C.dna, r.dna, '#CDB4F7'], [C.tokens, r.tokens, '#F5D27F'], [C.xp, r.xp, '#F3EBD7']].map(function (c) {
      return '<div class="col" style="padding:10px;border-radius:12px;background:var(--card);border:1px solid var(--line);gap:2px"><span style="font-size:11.5px;color:var(--mut2);font-weight:700">' + c[0] + '</span><span style="font-size:20px;font-weight:800;color:' + c[2] + '">+' + c[1] + '</span></div>';
    }).join('');
    var next = p.next;
    var disc = p.newEgg && ok ? '<div style="position:absolute;left:14px;bottom:14px;padding:8px 12px;border-radius:12px;background:rgba(14,23,18,.88);border:1px solid var(--gold);font-size:13px;font-weight:800">' + F(C.discovery, { name: S.codex.eggs[p.newEgg].name }) + '<div style="font-size:11.5px;font-weight:600;color:var(--mut)">' + C.addedCodex + '</div></div>' : '';
    var lvl = p.levelUp ? '<span style="' + pill + 'background:var(--gold);color:#1A1408">' + F(C.levelUp, { lv: p.levelUp }) + '</span>' : '';
    return '<div class="scr solid row" style="align-items:stretch"><div style="position:relative;width:330px;flex:none"><img class="bgimg" src="' + img(hero) + '" alt="' + (ok ? 'A newly discovered dinosaur egg' : 'Verdant Valley') + '"><div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,0) 60%,#0E1712)"></div>' + disc + '</div>' +
      '<div class="col" style="flex:1;padding:22px 26px;gap:12px"><div class="row" style="gap:10px"><span style="' + pill + (ok ? 'background:#CFE8B0;color:#1C2A10' : 'background:#F2B8B0;color:#3A0E09') + '">' + (ok ? C.okBadge : C.failBadge) + '</span><span style="font-size:13px;color:var(--mut2)">' + F(C.where, { n: p.n }) + '</span>' + lvl + '</div>' +
      '<h2 class="serif" style="margin:0;font-size:26px">' + (ok ? C.okHead[p.objId] : (p.objId === 'boss' ? C.failHeadBoss : C.failHead)) + '</h2><div style="font-size:14px;color:var(--soft);line-height:1.45">' + (ok ? C.okSub : C.failSub) + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' + cells + '</div>' +
      '<div style="padding:10px 12px;border-radius:12px;background:var(--card);border:1px dashed var(--gold);font-size:13.5px"><b style="color:var(--gold)">' + C.next + '</b> ' + next + '</div>' +
      '<div class="row" style="gap:10px;margin-top:auto"><button class="btn pri" data-act="' + (ok ? 'toSanctuary' : 'retry') + '" data-focus style="flex:1;font-size:15px">' + (ok ? C.sanctuary : C.retry) + '</button><button class="btn outl" data-act="' + (ok ? 'again' : 'toSanctuary') + '" style="flex:1;font-weight:800">' + (ok ? C.again : C.sanctuaryShort) + '</button></div></div></div>';
  };

  /* ---------- SCR-08 Sanctuary ---------- */
  T.sanctuary = function () {
    var C = S.sanctuary, sv = DF.save, st = DF.playerStats(sv), xp = DF.xpProgress(sv.player.experience), I = sv.inventory;
    var canEvo = sv.profile.firstExpeditionCompleted, choice = canEvo && !sv.profile.selectedEvolution;
    var pathName = sv.profile.selectedEvolution ? S.evo.paths[sv.profile.selectedEvolution].name : C.notChosen;
    var affordable = Object.keys(DF.balance.upgrades).filter(function (k) { var l = sv.upgrades[k] || 0; return l < DF.balance.upgrades[k].max && I.frontierTokens >= DF.upgradeCost(k, l); }).length;
    var ms = sv.missions, claimable = 0, done = 0; ms.active.forEach(function (id) { var d = DF.missionDef(id), c = (ms.progress[id] || 0) >= d.goal; if (c) { done++; if (ms.claimedRewardIds.indexOf(ms.resetKey + ':' + id) < 0) claimable++; } });
    var disc = sv.discoveries.codexSpecies.length + sv.discoveries.eggs.length + 1;
    var tile = function (act, name, meta, hot, color) { return '<button class="col" data-act="' + act + '" style="position:relative;padding:10px 12px;border-radius:12px;background:var(--card);border:' + (hot ? '2px solid var(--gold)' : '1px solid var(--line)') + ';text-align:left;gap:2px"><span style="font-weight:800;font-size:14.5px">' + name + '</span><span style="font-size:12px;color:' + (color || 'var(--mut)') + ';font-weight:' + (color ? 700 : 400) + '">' + meta + '</span></button>'; };
    var objs = ['egg', 'forage', 'boss'].map(function (id) {
      var o = DF.balance.objectives[id], locked = !DF.objectiveUnlocked(sv, id), sel = UI.st.obj === id && !locked, d = S.obj[id];
      var style = 'height:40px;padding:0 12px;border-radius:10px;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;text-align:left;' + (locked ? 'background:#121D16;border:1px dashed #4A5A4E;color:#9AA597' : sel ? 'background:#2A2410;border:2px solid var(--gold)' : 'background:var(--card);border:1px solid var(--line)');
      return '<button data-act="pickObj" data-id="' + id + '" ' + (locked ? 'disabled' : '') + ' aria-pressed="' + sel + '" style="' + style + '"><span style="font-weight:800">' + (locked ? '×' : sel ? '●' : '○') + ' ' + d.name + '</span><span style="font-size:12px;font-weight:700">' + (locked ? F(d.locked || S.obj.locked, { lv: o.minLevel }) : d.meta) + '</span></button>';
    }).join('');
    var evoMeta = canEvo ? (choice ? C.evoReady : F(C.evoChosen, { p: pathName })) : C.evoLocked;
    return '<div class="scr solid"><img class="bgimg" src="' + img('raptor_nursery_sanctuary') + '" alt="The Sanctuary: a jungle shrine with eggs"><div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,.15) 0%,rgba(14,23,18,.55) 45%,rgba(14,23,18,.95) 62%)"></div>' +
      '<div class="row" style="position:absolute;left:14px;right:14px;top:10px;justify-content:space-between"><button class="back big" data-act="toTitle" aria-label="' + C.back + '">' + BACK + '</button><div class="row" style="gap:8px">' + res('Food', I.food, '#CFE8B0', 1) + res('DNA', I.dnaFragments, '#CDB4F7', 1) + res('◉', I.frontierTokens + ' ' + C.tokensLabel, '#F5D27F', 1) + '</div></div>' +
      '<div class="col" style="position:absolute;left:14px;bottom:14px;width:250px;padding:12px 14px;border-radius:14px;background:rgba(14,23,18,.88);gap:6px"><div class="row" style="justify-content:space-between;align-items:baseline"><span class="serif" style="font-size:18px;font-weight:700">' + C.yourDino + '</span><span style="font-size:13px;font-weight:800;color:var(--gold)">' + F(C.lv, { lv: sv.player.level }) + '</span></div>' +
      '<div role="meter" aria-label="Experience" aria-valuenow="' + xp.pct + '" aria-valuemin="0" aria-valuemax="100" style="height:6px;border-radius:99px;background:var(--line);overflow:hidden"><div style="width:' + xp.pct + '%;height:100%;background:var(--gold)"></div></div>' +
      '<div style="font-size:12.5px;color:var(--mut)">' + F(C.status, { hp: st.maxHealth, en: st.maxEnergy }) + ' <b style="color:var(--text)">' + pathName + '</b></div></div>' +
      '<div class="col" style="position:absolute;right:16px;top:64px;bottom:14px;width:320px;gap:8px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      tile('evo', C.evo, evoMeta, choice, choice ? 'var(--gold2)' : '') + tile('upgrades', C.upgrades, affordable ? F(C.affordable, { n: affordable }) : C.none) +
      tile('codex', C.codex, F(C.discovered, { a: disc, b: 9 })) + tile('missions', C.missions, claimable || done ? F(C.missionsMeta, { d: done, t: ms.active.length, c: claimable }) : F(C.missionsMeta0, { d: 0, t: ms.active.length })) + '</div>' +
      '<div class="eyebrow" style="margin-top:2px">' + S.obj.choose + '</div>' + objs + '<button class="btn pri" data-act="start" data-focus style="margin-top:auto">' + S.obj.start + '</button></div></div>';
  };

  /* ---------- SCR-09 Evolution ---------- */
  T.evolution = function () {
    var E = S.evo, sv = DF.save, can = sv.profile.firstExpeditionCompleted, cur = sv.profile.selectedEvolution, sel = UI.st.evo, cost = DF.evolveCost(sv), costLabel = cost.dna ? cost.dna + ' DNA' : '◉ ' + cost.tokens;
    var imgs = { swiftclaw: 'swiftclaw', ironhide: 'crystal_magma_stegosaur', wildspark: 'wildspark' };
    var cards = ['swiftclaw', 'ironhide', 'wildspark'].map(function (id) {
      var d = E.paths[id], isSel = sel === id;
      return '<button data-act="pickEvo" data-id="' + id + '" aria-pressed="' + isSel + '" class="col" style="padding:0;border-radius:14px;overflow:hidden;background:var(--card);' + (isSel ? 'border:3px solid var(--gold)' : 'border:1px solid var(--line)') + ';text-align:left"><div style="position:relative;height:112px"><img src="' + img(imgs[id]) + '" alt="' + d.alt + '" style="width:100%;height:100%;object-fit:cover;display:block"><span style="position:absolute;left:8px;top:8px;font-size:11px;font-weight:800;padding:3px 8px;border-radius:99px;background:rgba(14,23,18,.85)">' + d.role + '</span>' + (cur === id ? '<span style="position:absolute;right:8px;top:8px;font-size:10.5px;font-weight:800;padding:3px 7px;border-radius:99px;background:var(--gold2);color:#2A1F05">' + E.current + '</span>' : '') + '</div>' +
        '<div class="col" style="padding:9px 11px;gap:4px"><div class="row" style="justify-content:space-between;align-items:baseline"><span class="serif" style="font-weight:700;font-size:17px">' + d.name + '</span><span style="font-size:12px;font-weight:800;color:var(--dna)">' + (cur === id ? '' : costLabel) + '</span></div>' +
        '<div style="font-size:12px;line-height:1.4"><b style="color:#CFE8B0">+ </b>' + d.strength + '</div><div style="font-size:12px;line-height:1.4"><b style="color:#F2B8B0">− </b>' + d.weakness + '</div><div style="font-size:12px;line-height:1.4;color:var(--mut)">' + E.signature + ' <b style="color:var(--text)">' + d.sig + '</b> · ' + E.energy + ' ' + d.energy + '</div></div></button>';
    }).join('');
    var n = E.paths[sel].name, afford = DF.canAfford(sv, cost), short = cost.dna ? { n: cost.dna - sv.inventory.dnaFragments, r: 'DNA Fragments' } : { n: cost.tokens - sv.inventory.frontierTokens, r: 'Frontier Tokens' };
    var action;
    if (!can) action = '<div style="flex:1;font-size:13px;font-weight:700;color:var(--gold2)">' + E.locked + '</div>';
    else if (cur === sel) action = '<div style="font-size:13px;font-weight:800;color:var(--food)">' + E.current + ' · ' + n + '</div>';
    else if (UI.st.confirm) action = '<div class="row" style="gap:10px;padding:6px 6px 6px 12px;border-radius:12px;background:var(--card);border:1px solid var(--gold)"><span style="font-size:13px;font-weight:700">' + F(E.confirm, { c: costLabel, n: n }) + '</span><button data-act="evoCancel" style="height:40px;padding:0 14px;border-radius:10px;border:1px solid #5A6B5E;background:transparent;font-weight:700">' + E.cancel + '</button><button class="btn pri" data-act="evoConfirm" data-focus style="height:40px;font-size:14px;padding:0 14px">' + E.confirmBtn + '</button></div>';
    else if (!afford) action = '<button class="btn" disabled style="height:44px;padding:0 20px;border:2px dashed #5A6B5E;color:#9AA597;font-size:14px">' + F(E.short, short) + '</button>';
    else action = '<button class="btn pri" data-act="evoAsk" data-focus style="height:44px;font-size:15px;padding:0 20px">' + F(cur ? E.switchTo : E.evolveInto, { n: n }) + '</button>';
    return '<div class="scr solid page">' + head(E.title, 'toSanctuary', '<span class="pill" style="color:var(--dna)">DNA ' + sv.inventory.dnaFragments + '</span>' + (cur ? '<span class="pill" style="color:var(--gold2)">◉ ' + sv.inventory.frontierTokens + '</span>' : ''), 'Back to Sanctuary') +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;flex:1;min-height:0">' + cards + '</div><div class="row" style="gap:12px"><div style="flex:1;font-size:12.5px;color:var(--mut)">' + E.switchNote + '</div>' + action + '</div></div>';
  };

  /* ---------- SCR-10 Upgrades ---------- */
  T.upgrades = function () {
    var U = S.upg, sv = DF.save, t = sv.inventory.frontierTokens;
    var rows = Object.keys(DF.balance.upgrades).map(function (id) {
      var def = DF.balance.upgrades[id], level = sv.upgrades[id] || 0, maxed = level >= def.max, cost = maxed ? 0 : DF.upgradeCost(id, level), short = !maxed && t < cost, txt = U.list[id];
      var btn = maxed ? '<button class="btn" disabled style="min-width:104px;height:44px;border:1px solid #5A6B5E;color:var(--food);font-size:14px">' + U.maxed + '</button>'
        : '<button data-act="buy" data-id="' + id + '" ' + (short ? 'disabled' : '') + ' aria-label="' + F(short ? U.short : U.buy, { n: txt.name, c: cost }) + '" class="btn" style="min-width:104px;height:44px;font-size:15px;' + (short ? 'background:transparent;border:2px dashed #5A6B5E;color:#9AA597' : 'background:var(--gold);color:#1A1408') + '">◉ ' + cost + '</button>';
      return '<div class="row" style="gap:14px;padding:12px 14px;border-radius:14px;background:var(--card);border:1px solid var(--line)"><div class="serif" style="width:52px;height:52px;flex:none;border-radius:12px;background:var(--bg);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--gold)">L' + level + '</div>' +
        '<div class="col" style="flex:1;gap:3px"><div style="font-weight:800;font-size:15.5px">' + txt.name + ' <span style="font-size:12px;color:var(--mut2);font-weight:700">' + F(U.level, { l: level, m: def.max }) + '</span></div><div style="font-size:13px;color:var(--soft)">' + (maxed ? '' : F(U.next, { t: txt.next })) + '</div>' +
        (short ? '<div style="font-size:12.5px;color:#F2B8B0;font-weight:700">' + F(U.need, { n: cost - t }) + '</div>' : '') + '</div>' + btn + '</div>';
    }).join('');
    return '<div class="scr solid page">' + head(U.title, 'toSanctuary', '<span class="pill" style="color:var(--gold2)">◉ ' + t + ' Tokens</span>', 'Back to Sanctuary') + '<div class="col" style="gap:8px;flex:1">' + rows + '</div><div style="font-size:12px;color:var(--mut2)">' + U.note + '</div></div>';
  };

  /* ---------- SCR-11 Codex ---------- */
  T.codex = function () {
    var C = S.codex, sv = DF.save, tab = UI.st.tab, items = [], a = 0, b = 0, tag;
    var D = { tag: C.found, border: '1px solid var(--line)' }, U = { tag: C.unknown, border: '1px dashed #4A5A4E' }, L = { tag: C.later, border: '1px dashed #4A5A4E' };
    var artFor = { starter: 'pt-dino-starter', raider: 'pt-enemy-raider', spitter: 'pt-enemy-spitter', skimmer: 'pt-enemy-skimmer', thornback: 'pt-boss-thornback', shadowscale: 'pt-egg-shadowscale', glade: 'pt-egg-glade', prism: 'pt-egg-shadowscale' };
    if (tab === 'species') DF.SPECIES.forEach(function (id) { var f = sv.discoveries.codexSpecies.indexOf(id) >= 0, d = C.species[id]; b++; if (f) a++; items.push(f ? { s: D, name: d.name, text: d.text, img: artFor[id], art: false } : { s: U, name: C.unknownName, text: d.clue, img: artFor[id], art: false, sil: true }); });
    else if (tab === 'eggs') DF.EGGS.forEach(function (id) { var f = sv.discoveries.eggs.indexOf(id) >= 0, d = C.eggs[id]; b++; if (f) a++; items.push(f ? { s: D, name: d.name, text: d.text, img: artFor[id], art: false, hue: id === 'prism' } : { s: U, name: C.unknownName, text: d.clue, img: id === 'prism' ? 'other_5' : artFor[id], art: false, sil: true }); });
    else { var bm = { verdant: 'canyon_styracosaur', ember: 'volcanic_ruins_chasm', frost: 'aurora_celestial_sanctuary', mire: 'bioluminescent_spino_swamp', crater: 'celestial_sky_citadel' };
      Object.keys(bm).forEach(function (id) { var d = C.biomes[id], here = id === 'verdant'; b++; if (here) a++; items.push({ s: here ? { tag: C.here, border: '1px solid var(--line)' } : L, name: d.name, text: d.text, img: bm[id], dim: !here }); }); }
    var cards = items.map(function (c) {
      var style = 'width:100%;height:100%;display:block;' + (c.art ? 'object-fit:contain;padding:6px 6px 0;background:radial-gradient(circle at 50% 75%,#3E4A30,#16231B 72%);' : 'object-fit:cover;') + (c.sil ? 'filter:blur(5px) brightness(.4) saturate(.4);transform:scale(1.08);' : c.dim ? 'filter:grayscale(.85) brightness(.55);' : c.hue ? 'filter:hue-rotate(150deg);' : '');
      return '<div class="col" style="border-radius:14px;overflow:hidden;background:var(--card);border:' + c.s.border + '"><div style="position:relative;height:150px;background:var(--bg);overflow:hidden"><img src="' + img(c.img) + '" alt="' + (c.sil ? 'Undiscovered silhouette' : c.name) + '" style="' + style + '"><span style="position:absolute;left:8px;top:8px;font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:99px;background:rgba(14,23,18,.88)">' + c.s.tag + '</span></div>' +
        '<div class="col" style="padding:9px 11px;gap:3px"><span style="font-weight:800;font-size:14px">' + c.name + '</span><span style="font-size:12px;line-height:1.4;color:var(--mut)">' + c.text + '</span></div></div>';
    }).join('');
    var tabs = ['species', 'eggs', 'biomes'].map(function (id) { var on = tab === id; return '<button role="tab" aria-selected="' + on + '" data-act="tab" data-id="' + id + '" style="height:36px;padding:0 14px;border-radius:10px;font-weight:800;font-size:13px;' + (on ? 'background:var(--gold);color:#1A1408;border:0' : 'background:var(--card);border:1px solid var(--line)') + '">' + C.tabs[id] + '</button>'; }).join('');
    return '<div class="scr solid page"><div class="hd"><button class="back" data-act="toSanctuary" aria-label="Back to Sanctuary">' + BACK + '</button><h2 class="h2" style="flex:none">' + C.title + '</h2><div role="tablist" class="row" style="gap:6px;margin-left:12px">' + tabs + '</div><span style="margin-left:auto;font-size:13px;font-weight:800;color:var(--mut)">' + F(C.prog[tab], { a: a, b: b }) + '</span></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;flex:1;min-height:0">' + cards + '</div></div>';
  };

  /* ---------- SCR-12 Missions ---------- */
  function hms(ms) { var m = Math.floor(ms / 60000); return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; }
  UI.missionClock = function () { var el = document.getElementById('mis-t'); if (el) el.textContent = hms(DF.msToMidnight()); };
  function rewardText(r) { var o = []; if (r.tokens) o.push('◉ ' + r.tokens + ' Tokens'); if (r.dna) o.push('+' + r.dna + ' DNA Fragments'); return o.join(' · '); }
  T.missions = function () {
    var M = S.missions, ms = DF.save.missions;
    var rows = ms.active.map(function (id) {
      var d = DF.missionDef(id), done = Math.min(d.goal, ms.progress[id] || 0), complete = done >= d.goal, claimed = ms.claimedRewardIds.indexOf(ms.resetKey + ':' + id) >= 0, pct = Math.round(100 * done / d.goal), name = F(M.names[id], { n: d.goal });
      var btn = '<button data-act="claim" data-id="' + id + '" ' + (!complete || claimed ? 'disabled' : '') + ' class="btn" style="min-width:110px;height:44px;font-size:14px;' + (claimed ? 'background:transparent;border:1px solid #5A6B5E;color:var(--food)' : complete ? 'background:var(--gold);color:#1A1408' : 'background:transparent;border:2px dashed #5A6B5E;color:#9AA597') + '">' + (claimed ? M.claimed : complete ? M.claim : M.progress) + '</button>';
      return '<div class="row" style="gap:14px;padding:12px 14px;border-radius:14px;background:var(--card);border:' + (complete && !claimed ? '2px solid var(--gold)' : '1px solid var(--line)') + '"><div class="col" style="flex:1;gap:6px"><div class="row" style="justify-content:space-between;font-size:15px;font-weight:800"><span>' + name + '</span><span style="font-size:13px;color:var(--mut)">' + done + ' / ' + d.goal + '</span></div>' +
        '<div role="progressbar" aria-label="' + name + ' progress" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" style="height:8px;border-radius:99px;background:var(--line);overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + (complete ? '#CFE8B0' : 'var(--gold)') + '"></div></div><div style="font-size:12.5px;color:var(--gold2);font-weight:700">' + M.reward + ' ' + rewardText(d.reward) + '</div></div>' + btn + '</div>';
    }).join('');
    return '<div class="scr solid page">' + head(M.title, 'toSanctuary', '<span class="pill row" style="gap:6px;font-weight:700;color:var(--soft)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E8B54A" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' + F(M.reset, { t: '<span id="mis-t">' + hms(DF.msToMidnight()) + '</span>' }) + '</span>', 'Back to Sanctuary') + '<div class="col" style="gap:8px;flex:1">' + rows + '</div><div style="font-size:12px;color:var(--mut2)">' + M.note + '</div></div>';
  };

  /* ---------- SCR-13 Settings ---------- */
  T.settings = function () {
    var C = S.settings, s = DF.save.settings, an = DF.save.consent.analytics === 'granted';
    var lab = 'display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700', w = 'width:110px;flex:none';
    return '<div class="scr solid page">' + head(C.title, 'settingsBack', '<span style="font-size:12px;color:var(--mut2)">' + C.autosave + '</span>') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1"><div class="col card" style="padding:12px 14px;gap:10px"><div class="eyebrow">' + C.sound + '</div>' +
      '<label style="' + lab + '"><span style="' + w + '">' + C.music + '</span><input type="range" min="0" max="100" value="' + s.musicVolume + '" data-set="musicVolume" aria-label="' + C.music + '"></label>' +
      '<label style="' + lab + '"><span style="' + w + '">' + C.sfx + '</span><input type="range" min="0" max="100" value="' + s.sfxVolume + '" data-set="sfxVolume" aria-label="' + C.sfx + '"></label>' +
      '<label style="' + lab + '"><span style="' + w + '">' + C.mute + '</span><input type="checkbox" data-set="muteAll" ' + (s.muteAll ? 'checked' : '') + '></label>' +
      '<label style="' + lab + '"><span style="' + w + '">' + C.vibration + '</span><input type="checkbox" data-set="vibrationEnabled" ' + (s.vibrationEnabled ? 'checked' : '') + '><span style="font-size:12px;color:var(--mut2);font-weight:600">' + C.vibrationHint + '</span></label>' +
      '<label style="' + lab + '"><span style="' + w + '">' + C.reduced + '</span><input type="checkbox" data-set="reducedEffects" ' + (s.reducedEffects ? 'checked' : '') + '><span style="font-size:12px;color:var(--mut2);font-weight:600">' + C.reducedHint + '</span></label></div>' +
      '<div class="col card" style="padding:12px 14px;gap:10px"><div class="eyebrow">' + C.controls + '</div><label style="' + lab + '"><span style="' + w + '">' + C.sens + '</span><input type="range" min="1" max="10" value="' + s.controlSensitivity + '" data-set="controlSensitivity" aria-label="' + C.sens + '"></label>' +
      '<div style="font-size:12px;color:var(--mut2)">' + C.keys + '</div><div class="eyebrow" style="margin-top:4px">' + C.privacy + '</div>' +
      '<label style="display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:700"><input type="checkbox" data-set="analytics" ' + (an ? 'checked' : '') + '><span>' + C.analytics + '<br><span style="font-size:12px;color:var(--mut2);font-weight:600">' + C.analyticsHint + '</span></span></label>' +
      '<button data-act="privacyView" style="background:none;border:0;color:var(--gold);font-size:13px;font-weight:700;text-align:left;text-decoration:underline;padding:0">' + C.viewPrivacy + '</button></div></div>' +
      (UI.st.modal ? modal(S.privacy.title, S.privacy.full) : '') + '</div>';
  };

  /* ---------- SCR-14 Error / recovery ---------- */
  T.error = function (p) {
    var v = p.variant || 'invalid-save', E = S.error[v], info = E.info, primary = E.primary, sec = '<button class="btn outl" data-act="errTitle" style="padding:0 18px">' + S.error.return + '</button>';
    if (v === 'invalid-save') { if (p.backup) info = F(E.info, { when: p.when || 'earlier', lv: p.backup.player.level, tokens: p.backup.inventory.frontierTokens }); else { info = E.infoNone; primary = E.primaryNone; } }
    if (v === 'storage-full') sec = '<button class="btn outl" data-act="errPlay" style="padding:0 18px">' + E.secondary + '</button>';
    if (v === 'offline') sec = '';
    return '<div class="scr solid"><img class="bgimg" src="' + img('lost_expedition_raptor') + '" alt="" style="opacity:.4"><div class="fill" style="background:linear-gradient(to right,rgba(14,23,18,.97) 50%,rgba(14,23,18,.4))"></div>' +
      '<div class="col" style="position:absolute;left:44px;top:0;bottom:0;width:470px;justify-content:center;gap:12px"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E8B54A" stroke-width="2" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>' +
      '<h2 class="serif" style="margin:0;font-size:26px">' + E.title + '</h2><p style="margin:0;font-size:14.5px;line-height:1.55;color:var(--soft)">' + E.body + '</p><div style="padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:13px;color:var(--mut)">' + info + '</div>' +
      '<div class="row" style="gap:10px;margin-top:4px"><button class="btn pri" data-act="errPrimary" data-focus style="padding:0 20px;font-size:15px">' + primary + '</button>' + sec + '</div></div></div>';
  };

  /* ---------- SCR-15 Credits ---------- */
  T.credits = function () {
    var C = S.credits, box = 'padding:14px;border-radius:14px;background:rgba(22,35,27,.92);border:1px solid var(--line);display:flex;flex-direction:column;gap:6px;font-size:13.5px';
    return '<div class="scr solid"><img class="bgimg" src="' + img('other_1') + '" alt="" style="opacity:.3"><div class="fill" style="background:rgba(14,23,18,.6)"></div><div class="fill page">' + head(C.title, 'toTitle', '<span style="font-size:12.5px;color:var(--mut)">' + F(C.build, { b: DF.build }) + '</span>', 'Back to title') +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;flex:1"><div style="' + box + '"><div class="eyebrow">' + C.made + '</div><div style="font-weight:800">' + C.studio + '</div><div class="muted">' + C.design + '</div><div class="muted">' + C.eng + '</div><div class="muted">' + C.art + '</div><div class="muted">' + C.audio + '</div></div>' +
      '<div style="' + box + '"><div class="eyebrow">' + C.lic + '</div><div>' + C.licBody + '</div><div class="muted">' + C.licNote + '</div></div><div style="' + box + '"><div class="eyebrow">' + C.attr + '</div><div class="muted">' + C.attrBody + '</div><div class="muted">' + C.fonts + '</div></div></div></div></div>';
  };

  /* ---------- infrastructure ---------- */
  UI.init = function () {
    ui = document.getElementById('ui'); cv = document.getElementById('cv'); toastBox = document.getElementById('toast');
    ui.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
      if (DF.Audio) DF.Audio.sfx('click');
      if (UI.onAct) UI.onAct(t.getAttribute('data-act'), t.dataset, e);
    });
    var setter = function (e) {
      var t = e.target; if (!t.getAttribute || !t.getAttribute('data-set')) return;
      if (UI.onSet) UI.onSet(t.getAttribute('data-set'), t.type === 'checkbox' ? t.checked : Number(t.value));
    };
    ui.addEventListener('input', setter); ui.addEventListener('change', function (e) { if (e.target.type === 'checkbox') setter(e); });
    window.addEventListener('touchstart', function () { if (!UI.touch) { UI.touch = true; var j = document.getElementById('joy'); if (j) { j.style.display = ''; var l = document.getElementById('jlabel'); if (l) l.style.display = ''; var k = document.getElementById('keys'); if (k) k.style.display = 'none'; } } }, { passive: true });
    UI.touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  };
  UI.show = function (name, p) {
    UI.cur = name; UI.p = p || {};
    ui.innerHTML = T[name](UI.p);
    var gameView = name === 'hud' || name === 'pause';
    cv.classList.toggle('on', gameView); cv.classList.toggle('blur', name === 'pause');
    var f = ui.querySelector('[data-focus]'); if (f && name !== 'hud') { try { f.focus({ preventScroll: true }); } catch (e) {} }
  };
  /* demo: hide touch controls and the resource pill, add a caption bar */
  UI.demoMode = function () {
    ['joy', 'jlabel', 'b-atk', 'b-dash', 'b-abil', 'keys'].forEach(function (id) { var e = document.getElementById(id); if (e) e.style.display = 'none'; });
    var rf = document.getElementById('r-f'); if (rf) rf.parentNode.parentNode.style.display = 'none';
    var cap = document.createElement('div'); cap.id = 'cap'; cap.setAttribute('role', 'status');
    cap.style.cssText = 'position:absolute;left:50%;bottom:22px;transform:translateX(-50%);max-width:640px;padding:10px 18px;border-radius:14px;background:rgba(14,23,18,.92);border:1px solid var(--gold);font-size:15px;font-weight:800;text-align:center';
    ui.firstChild.appendChild(cap);
  };
  UI.caption = function (t) { var c = document.getElementById('cap'); if (c && c.textContent !== t) c.textContent = t; };
  UI.refresh = function () { UI.show(UI.cur, UI.p); };
  UI.setProgress = function (pct) {
    var b = document.getElementById('ld-bar'), t = document.getElementById('ld-pct'), pb = document.getElementById('ld-pb');
    if (b) b.style.width = Math.round(pct * 100) + '%'; if (t) t.textContent = Math.round(pct * 100) + '%'; if (pb) pb.setAttribute('aria-valuenow', Math.round(pct * 100));
  };
  UI.toast = function (msg, kind) {
    var d = document.createElement('div'); d.textContent = msg; if (kind) d.className = kind; toastBox.appendChild(d);
    while (toastBox.children.length > 3) toastBox.removeChild(toastBox.firstChild);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2600);
  };
})(window.DF);
