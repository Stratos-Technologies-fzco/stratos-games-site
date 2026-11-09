/* CRYSTAL QUEST – THE LOST KINGDOM: screens, board, saving, rewards. The rules live in engine.js, the content in levels.js. */
(function () {
  'use strict';
  var E = window.CQEngine, LV = window.CQLevels, A = window.CQAudio;
  var SAVE_KEY = 'cq_save_v1';

  /* ---------- Stratos analytics and rewarded moments ---------- */
  function track(name, details) { try { var S = window.Stratos || parent.Stratos; if (S) S.track(name, details); } catch (e) {} }
  /* A rewarded moment the player chooses. Ads are not live yet, so the reward is free for now (CLAUDE.md: offerReward). */
  function offerReward(onDone, why) {
    try { var S = window.Stratos || parent.Stratos; if (S && S.offerReward) { S.offerReward(onDone); return; } } catch (e) {}
    track('reward_offered', { why: why }); track('reward_taken', { why: why }); onDone();
  }

  /* ---------- little helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var app = document.getElementById('app'), screen = document.getElementById('screen'), modalEl = document.getElementById('modal'), toastEl = document.getElementById('toast'), bgEl = document.getElementById('bg');
  var reduced = false; try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var T = reduced ? 0.25 : 1;
  function sleep(ms) { return new Promise(function (res) { setTimeout(res, ms * T); }); }
  var GLOW = ['#E5324B', '#2F7BFF', '#1FBF6A', '#F5A31A', '#7B5CFF', '#E8F6FF'];
  var SPART = { bomb: 'special_01_ruby_bomb', lightning: 'special_02_lightning_crystal', thunder: 'special_03_vertical_thunder', rainbow: 'special_04_rainbow_crystal', nova: 'special_05_crystal_nova', star: 'special_06_magic_star', fish: 'special_07_crystal_fish', super: 'special_08_super_crystal' };
  var SPNAME = { bomb: 'Ruby Bomb', lightning: 'Lightning Crystal', thunder: 'Vertical Thunder', rainbow: 'Rainbow Crystal', nova: 'Crystal Nova', star: 'Magic Star', fish: 'Crystal Fish', super: 'Super Crystal' };
  function crystalSrc(n) { return 'assets/crystals/' + LV.COLOR_ART[n] + '.svg'; }
  function spSrc(sp) { return 'assets/special/' + SPART[sp] + '.svg'; }
  function blkSrc(kind) { var d = E.BLOCKERS[kind]; return d && d.art ? 'assets/blockers/' + d.art + '.svg' : icon('level_node'); }
  function icon(n) { return 'assets/ui/icons/icon_' + n + '.svg'; }
  function im(src, cls) { return '<img alt="" ' + (cls ? 'class="' + cls + '" ' : '') + 'src="' + src + '">'; }
  function ic(n, cls) { return im(icon(n), cls); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayDiff(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }
  function fmtTime(s) { s = Math.max(0, s | 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  var toastT; function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600); }

  /* ---------- boosters: what exists, what it costs ---------- */
  /* key, picture, name, short name, price in coins, what it does, which tab of the shop */
  var BOOST = [
    ['hammer', icon('hammer'), 'Hammer', 'Hammer', 60, 'Smash one crystal or block.', 'game'],
    ['strike', icon('lightning'), 'Lightning Strike', 'Strike', 70, 'Clear a whole row.', 'game'],
    ['wand', icon('wand'), 'Magic Wand', 'Wand', 80, 'Turn a crystal into a special crystal.', 'game'],
    ['shuffle', icon('shuffle'), 'Shuffle', 'Shuffle', 50, 'Mix up all the crystals.', 'game'],
    ['moves', icon('extra_moves'), '+5 Moves', '+5', 80, '5 more moves (15 seconds in a Time Challenge).', 'game'],
    ['rainbow', icon('rainbow_blast'), 'Rainbow Blast', 'Rainbow', 90, 'Clear every crystal of one colour.', 'game'],
    ['s_bomb', 'assets/special/special_01_ruby_bomb.svg', 'Ruby Starter', 'Ruby', 70, 'Start a level with a Ruby Bomb on the board.', 'start'],
    ['s_lightning', 'assets/special/special_02_lightning_crystal.svg', 'Lightning Starter', 'Lightning', 80, 'Start with a Lightning Crystal on the board.', 'start'],
    ['s_rainbow', 'assets/special/special_04_rainbow_crystal.svg', 'Rainbow Starter', 'Rainbow', 110, 'Start with a Rainbow Crystal on the board.', 'start'],
    ['s_shield', icon('shield'), 'Magic Shield', 'Shield', 90, 'Blocks the first boss attack, or gives 3 extra moves.', 'start']
  ];
  var STARTER_KIND = { s_bomb: 'bomb', s_lightning: 'lightning', s_rainbow: 'rainbow', s_shield: 'shield' };
  function boost(k) { return BOOST.filter(function (b) { return b[0] === k; })[0]; }
  var GAME_BOOSTS = BOOST.filter(function (b) { return b[6] === 'game'; }), STARTERS = BOOST.filter(function (b) { return b[6] === 'start'; });

  /* ---------- saving (this phone only; no sign-up, no account) ---------- */
  function zeroBoosters() { var o = {}; BOOST.forEach(function (b) { o[b[0]] = 0; }); return o; }
  function defaults() {
    var b = zeroBoosters();                                   // a new player starts with none and earns them
    return { v: 1, coins: 100, noTips: false, stars: {}, best: {}, energy: [0, 0, 0, 0, 0], seen: {}, music: true, sfx: true, musicVol: 0.5, sfxVol: 0.5, lowfx: false,
      boosters: b, daily: { last: '', streak: 0 }, dc: { date: '', best: 0, paid: false },
      stats: { wins: 0, bestCascade: 0, specials: 0, bosses: {}, threeStars: 0 } };
  }
  var save = (function () {
    var d = defaults();
    try { var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && s.v === 1) { for (var k in s) d[k] = s[k]; d.boosters = Object.assign(zeroBoosters(), s.boosters); d.stats = Object.assign(defaults().stats, s.stats); } } catch (e) {}
    return d;
  })();
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

  var PROJ_T = [60, 140, 240, 360, 500];            // crystal energy needed for each restoration project of a world
  function worldOf(id) { return Math.floor((id - 1) / 20); }
  function done(id) { return (save.stars[id] || 0) > 0; }
  function unlocked(id) { return id === 1 || done(id - 1); }
  function nextLevelId() { for (var i = 1; i <= 100; i++) if (!done(i)) return i; return 100; }
  function totalStars() { var n = 0; for (var k in save.stars) n += save.stars[k]; return n; }
  function restoredCount(w) { var n = 0; PROJ_T.forEach(function (t) { if (save.energy[w] >= t) n++; }); return n; }
  function worldFrac(w) { return Math.min(1, save.energy[w] / PROJ_T[4]); }

  /* ---------- screen plumbing ---------- */
  var cur = { name: '', world: 0 };
  function setBg(bg, frac) {
    bgEl.style.backgroundImage = bg ? 'url(assets/backgrounds/' + bg + '.svg)' : '';
    bgEl.style.filter = frac === undefined ? '' : 'saturate(' + (0.55 + 0.45 * frac).toFixed(2) + ') brightness(' + (0.82 + 0.18 * frac).toFixed(2) + ')';
  }
  function openModal(html, opts) {
    modalEl.innerHTML = '<div class="card panel">' + html + '</div>'; modalEl.hidden = false; modalEl.onclick = function (e) { if (e.target === modalEl && !(opts && opts.sticky)) closeModal(); };
    return modalEl.firstChild;
  }
  function closeModal() { modalEl.hidden = true; modalEl.innerHTML = ''; modalEl.onclick = null; }
  function click(el, fn) { if (el) el.addEventListener('click', function (e) { e.stopPropagation(); A.sfx('button'); fn(e); }); }
  function setScreen(name, cls, html) { cur.name = name; screen.className = cls || ''; screen.innerHTML = html; }

  /* ---------- who is who: characters with a little idle animation ---------- */
  function charCard(who, text, opts) {
    opts = opts || {}; var c = LV.CHAR[who] || { name: '', role: '' }, isNew = !save.seen['char_' + who];
    return '<div class="who' + (opts.cheer ? ' cheer' : '') + '"><img alt="" src="assets/characters/' + who + '.svg"><div><b>' + esc(c.name) + '</b> <span class="role">' + esc(c.role) + '</span>' +
      (isNew && !opts.noNew ? ' <span class="new">NEW</span>' : '') + '<div class="small-text">' + esc(text) + '</div></div></div>';
  }
  function markSeen(who) { if (who && !save.seen['char_' + who]) { save.seen['char_' + who] = 1; persist(); } }

  /* ---------- sound controls shared by Settings and Pause ---------- */
  function soundHtml() {
    return '<div class="tog"><span>Music <em id="sMusic">' + (save.music ? 'on' : 'off') + '</em></span><button class="tick' + (save.music ? ' on' : '') + '" id="tMusic" aria-label="Music on or off"></button></div>' +
      '<label class="slide"><span>Music volume</span><input type="range" min="0" max="100" value="' + Math.round(save.musicVol * 100) + '" id="vMusic" aria-label="Music volume"></label>' +
      '<div class="tog"><span>Sound effects <em id="sSfx">' + (save.sfx ? 'on' : 'off') + '</em></span><button class="tick' + (save.sfx ? ' on' : '') + '" id="tSfx" aria-label="Sound effects on or off"></button></div>' +
      '<label class="slide"><span>Effects volume</span><input type="range" min="0" max="100" value="' + Math.round(save.sfxVol * 100) + '" id="vSfx" aria-label="Effects volume"></label>';
  }
  function bindSound(c) {
    click($('#tMusic', c), function (e) { save.music = !save.music; A.set('music', save.music); persist(); e.target.classList.toggle('on', save.music); $('#sMusic', c).textContent = save.music ? 'on' : 'off'; });
    click($('#tSfx', c), function (e) { save.sfx = !save.sfx; A.set('sfx', save.sfx); persist(); e.target.classList.toggle('on', save.sfx); $('#sSfx', c).textContent = save.sfx ? 'on' : 'off'; });
    var vm = $('#vMusic', c), vs = $('#vSfx', c);
    vm.addEventListener('input', function () { save.musicVol = vm.value / 100; A.setVolume('music', save.musicVol); });
    vm.addEventListener('change', function () { persist(); });
    vs.addEventListener('input', function () { save.sfxVol = vs.value / 100; A.setVolume('sfx', save.sfxVol); });
    vs.addEventListener('change', function () { persist(); A.sfx('match3'); });
  }
  function settings() {
    var c = openModal('<h2>Settings</h2>' + soundHtml() +
      '<div class="tog"><span>Skip the tips and hints</span><button class="tick' + (save.noTips ? ' on' : '') + '" id="tTips" aria-label="Skip tips"></button></div>' +
      '<div class="tog"><span>Calmer effects (for slow phones)</span><button class="tick' + (save.lowfx ? ' on' : '') + '" id="tFx" aria-label="Calmer effects"></button></div>' +
      '<div class="btns"><button class="btn ghost small" id="mX">Close</button></div>');
    bindSound(c);
    click($('#tTips', c), function (e) { save.noTips = !save.noTips; persist(); e.target.classList.toggle('on', save.noTips); });
    click($('#tFx', c), function (e) { save.lowfx = !save.lowfx; document.body.classList.toggle('lowfx', save.lowfx); persist(); e.target.classList.toggle('on', save.lowfx); });
    click($('#mX', c), closeModal);
  }

  /* ---------- splash and loading ---------- */
  function splash() {
    setBg('bg_01_crystal_valley', 1);
    var list = [], i;
    for (i = 0; i < 6; i++) list.push(crystalSrc(i));
    Object.keys(SPART).forEach(function (k) { list.push(spSrc(k)); });
    Object.keys(E.BLOCKERS).forEach(function (k) { if (E.BLOCKERS[k].art) list.push(blkSrc(k)); });
    ['hammer', 'lightning', 'wand', 'shuffle', 'extra_moves', 'rainbow_blast', 'shield', 'coin', 'star', 'star_empty', 'play', 'pause', 'home', 'map', 'gift', 'trophy', 'person', 'music', 'sound', 'sound_off', 'gear', 'shop', 'lock', 'chest', 'heart', 'crown', 'shard', 'book', 'level_node'].forEach(function (n) { list.push(icon(n)); });
    Object.keys(LV.CHAR).forEach(function (k) { list.push('assets/characters/' + k + '.svg'); });
    LV.WORLDS.forEach(function (w) { list.push('assets/bosses/' + w.boss.art + '.svg'); });
    list.push('assets/ui/logo_emblem.svg'); list.push('assets/backgrounds/' + LV.WORLDS[0].bg + '.svg');
    setScreen('splash', 'splash',
      '<div class="spl"><img class="logo" alt="" src="assets/ui/logo_emblem.svg"><div class="brand">STRATOS.GAMES PRESENTS</div><h1>CRYSTAL QUEST</h1><div class="sub">THE LOST KINGDOM</div>' +
      '<div class="loadbar" aria-label="Loading"><i id="ldFill"></i></div><div class="small-text" id="ldText">Gathering crystals…</div></div>');
    var loaded = 0, started = Date.now(), gone = false;
    function finish() { if (gone) return; gone = true; home(); }
    function step() {
      loaded++; var f = $('#ldFill'); if (f) f.style.width = Math.round(loaded / list.length * 100) + '%';
      if (loaded >= list.length) { var t = $('#ldText'); if (t) t.textContent = 'Ready!'; setTimeout(finish, Math.max(150, 1300 - (Date.now() - started))); }
    }
    list.forEach(function (src) { var m = new Image(); m.onload = m.onerror = step; m.src = src; });
    setTimeout(finish, 4500);                      // never keep a player waiting
    screen.addEventListener('pointerdown', function skip() { screen.removeEventListener('pointerdown', skip); if (loaded >= list.length * 0.6) finish(); });
  }

  /* ---------- home ---------- */
  function canClaimDaily() { return save.daily.last !== today(); }
  function allMuted() { return !save.music && !save.sfx; }
  function home() {
    leaveGame(); closeModal();
    var nid = nextLevelId(), w = worldOf(nid);
    setBg(LV.WORLDS[w].bg, worldFrac(w)); A.music('music_01_main_menu');
    var first = totalStars() === 0;
    setScreen('home', 'home',
      '<div class="row"><span class="chip">' + ic('coin') + '<b id="coins">' + save.coins + '</b></span><span class="grow"></span>' +
      '<button class="iconbtn" id="bShop" aria-label="Booster shop">' + ic('shop') + '</button>' +
      '<button class="iconbtn" id="bProfile" aria-label="Profile">' + ic('person') + '</button>' +
      '<button class="iconbtn" id="bMute" aria-label="Mute or unmute">' + ic(allMuted() ? 'sound_off' : 'sound') + '</button>' +
      '<button class="iconbtn" id="bSet" aria-label="Settings">' + ic('gear') + '</button></div>' +
      '<div class="center"><img class="logo" alt="" src="assets/ui/logo_emblem.svg"><h1>CRYSTAL QUEST</h1><div class="sub">THE LOST KINGDOM</div>' +
      '<div class="goal small-text">Match 3 crystals, beat the bosses and rebuild the broken Crystal Heart.</div></div>' +
      '<div class="menu"><button class="btn gold" id="bPlay">' + ic('play') + (first ? 'PLAY' : 'CONTINUE · LEVEL ' + nid) + '</button>' +
      '<button class="btn blue" id="bMap">' + ic('map') + 'WORLD MAP</button>' +
      '<div class="row"><button class="btn small ghost grow" id="bDaily">' + ic('gift') + 'Daily reward' + (canClaimDaily() ? ' ●' : '') + '</button>' +
      '<button class="btn small ghost grow" id="bChallenge">' + ic('trophy') + 'Daily puzzle</button></div></div>' +
      '<div class="by">by Nikhat Sultana · Stratos Games</div>');
    click($('#bPlay'), function () { showIntro(LV.LEVELS[nid - 1]); });
    click($('#bMap'), function () { map(w); });
    click($('#bDaily'), dailyReward); click($('#bChallenge'), dailyChallengeIntro); click($('#bProfile'), profile);
    click($('#bShop'), function () { shop('game'); }); click($('#bSet'), settings);
    click($('#bMute'), function () { var m = !allMuted(); save.music = !m; save.sfx = !m; A.set('music', save.music); A.set('sfx', save.sfx); persist(); toast(m ? 'Sound off' : 'Sound on'); home(); });
    if (canClaimDaily() && !first && !save.seen['dailyShown_' + today()]) { save.seen['dailyShown_' + today()] = 1; persist(); setTimeout(function () { if (cur.name === 'home' && modalEl.hidden) dailyReward(); }, 500); }
  }

  /* ---------- world map ---------- */
  function map(w) {
    leaveGame(); closeModal(); cur.world = w;
    var W = LV.WORLDS[w], nid = nextLevelId(), nodes = '';
    setBg(W.bg, worldFrac(w)); A.music(W.music);
    for (var i = 1; i <= 20; i++) {
      var id = w * 20 + i, d = done(id), u = unlocked(id), st = save.stars[id] || 0, boss = i === 20;
      nodes += '<button class="node' + (d ? ' done' : '') + (id === nid ? ' next' : '') + (!u ? ' locked' : '') + (boss ? ' boss' : '') + '" data-id="' + id + '" aria-label="Level ' + i + '">' +
        (u ? (boss ? '<img style="width:78%" alt="" src="assets/bosses/' + W.boss.art + '.svg">' : i) : ic('lock', 'lk')) +
        (d ? '<span class="st">' + [1, 2, 3].map(function (n) { return ic(n <= st ? 'star' : 'star_empty'); }).join('') + '</span>' : '') + '</button>';
    }
    var proj = W.projects.map(function (p, k) { return '<div class="project' + (save.energy[w] >= PROJ_T[k] ? ' on' : '') + '"><div class="pi">' + ic(['map', 'crown', 'gift', 'shard', 'chest'][k]) + '</div>' + esc(p) + '</div>'; }).join('');
    var dots = LV.WORLDS.map(function (_, k) { return '<span class="wd' + (k === w ? ' on' : '') + '"></span>'; }).join('');
    setScreen('map', '',
      '<div class="map-head"><button class="iconbtn" id="bBack" aria-label="Home">' + ic('home') + '</button><h2>' + W.name + '</h2><button class="iconbtn" id="bShop" aria-label="Booster shop">' + ic('shop') + '</button><span class="chip">' + ic('coin') + '<b>' + save.coins + '</b></span></div>' +
      '<div class="row" style="justify-content:space-between;margin:6px 0"><button class="btn small ghost" id="bPrev" ' + (w === 0 ? 'disabled' : '') + '>‹</button><div class="worldtabs">' + dots + '</div><button class="btn small ghost" id="bNext" ' + (w === 4 || !unlocked((w + 1) * 20 + 1) ? 'disabled' : '') + '>›</button></div>' +
      '<div class="grow mapfit"><div class="levels">' + nodes + '</div></div>' +
      '<button class="panel restore" id="bKingdom" aria-label="See the kingdom"><div class="row" style="justify-content:space-between"><span>Restore the kingdom</span><span class="small-text">' + restoredCount(w) + ' / 5 · tap to see</span></div>' +
      '<div class="bar"><i style="width:' + Math.round(worldFrac(w) * 100) + '%"></i></div><div class="projects">' + proj + '</div></button>' +
      '<div class="soon">Coming soon: ' + LV.LOCKED_WORLDS.slice(0, 4).join(' · ') + '</div>');
    click($('#bBack'), home); click($('#bShop'), function () { shop('game'); }); click($('#bKingdom'), function () { kingdom(w); });
    click($('#bPrev'), function () { map(w - 1); }); click($('#bNext'), function () { map(w + 1); });
    Array.prototype.forEach.call(screen.querySelectorAll('.node'), function (n) {
      click(n, function () { var id = +n.dataset.id; if (!unlocked(id)) { toast('Finish the level before to unlock this one.'); return; } showIntro(LV.LEVELS[id - 1]); });
    });
  }

  /* ---------- the kingdom: before and after pictures, restored a little more with every level ---------- */
  function kingdom(w, fromE) {
    leaveGame(); closeModal(); cur.world = w;
    var W = LV.WORLDS[w], e = save.energy[w], to = Math.min(1, e / PROJ_T[4]), from = fromE === undefined ? to : Math.min(1, fromE / PROJ_T[4]);
    setBg(W.bg, 1); A.music(W.music);
    var bgurl = 'url(assets/backgrounds/' + W.bg + '.svg)';
    var icons = ['map', 'crown', 'gift', 'shard', 'chest'];
    var marks = PROJ_T.map(function (t, k) { return '<div class="kmark' + (e >= t ? ' on' : '') + '" style="left:' + (t / PROJ_T[4] * 100) + '%"><div class="pi">' + ic(icons[k]) + '</div></div>'; }).join('');
    var rows = W.projects.map(function (p, k) {
      var ok = e >= PROJ_T[k];
      return '<div class="krow' + (ok ? ' ok' : '') + '">' + ic(icons[k]) + '<span class="grow">' + esc(p) + '</span><span class="small-text">' + (ok ? 'Restored ✓' : 'needs ' + (PROJ_T[k] - e) + ' more energy') + '</span></div>';
    }).join('');
    setScreen('kingdom', '',
      '<div class="map-head"><button class="iconbtn" id="bBack" aria-label="Back">' + ic('map') + '</button><h2>' + W.name + '</h2><span class="chip">' + ic('shard') + '<b>' + e + '</b></span></div>' +
      '<div class="kview" id="kview"><div class="klayer before" style="background-image:' + bgurl + '"></div>' +
      '<div class="klayer after" id="kafter" style="background-image:' + bgurl + ';clip-path:inset(0 ' + (100 - from * 100) + '% 0 0)"></div>' +
      '<div class="kedge" id="kedge" style="left:' + from * 100 + '%"></div>' + marks +
      '<span class="klabel l">Before</span><span class="klabel r">After</span></div>' +
      '<div class="small-text center">Win levels to earn crystal energy. Every project you finish makes the kingdom shine.</div>' +
      '<div class="klist">' + rows + '</div><button class="btn gold" id="bOk">Back to the map</button>');
    click($('#bBack'), function () { map(w); }); click($('#bOk'), function () { map(w); });
    setTimeout(function () {
      var a = $('#kafter'), g = $('#kedge'); if (!a) return;
      a.style.clipPath = 'inset(0 ' + (100 - to * 100) + '% 0 0)'; g.style.left = to * 100 + '%';
      if (fromE !== undefined && to > from) A.sfx('reward');
    }, 250);
  }

  /* ---------- level intro (goal, story, one short lesson, starters) ---------- */
  function objInfo(o, L_) {
    var lvl = L_ || L, k;
    switch (o.type) {
      case 'collect': return { img: crystalSrc(o.color), txt: 'Collect ' + o.n + ' ' + LV.COLOR_NAMES[o.color] };
      case 'blockers': return { img: blkSrc(o.kind || 'stone'), txt: 'Break ' + o.n + ' ' + (o.kind ? E.BLOCKERS[o.kind].name : 'blockers') };
      case 'score': return { img: icon('star'), txt: 'Score ' + o.n };
      case 'boss': return { img: 'assets/bosses/' + lvl.boss.art + '.svg', txt: 'Defeat ' + lvl.boss.name };
      case 'treasure': return { img: icon('chest'), txt: 'Bring down ' + o.n + ' treasure' + (o.n > 1 ? 's' : '') };
      case 'rescue': return { img: blkSrc('cage'), txt: 'Free ' + o.n + ' caged crystals' };
      case 'path': return { img: icon('level_node'), txt: 'Light ' + o.n + ' path tiles' };
      case 'restore': return { img: icon('heart'), txt: 'Heal ' + o.n + ' forest patches' };
      case 'energy': return { img: icon('lightning'), txt: 'Collect ' + o.n + ' crystal energy' };
      case 'portal': return { img: blkSrc('portal'), txt: 'Close ' + o.n + ' shadow portals' };
    }
    return { img: icon('star'), txt: '' };
  }
  function goalHtml(o, L_) { var i = objInfo(o, L_); return '<div class="obj">' + im(i.img) + esc(i.txt) + '</div>'; }
  var TYPE_NAME = { collect: 'Crystal Collection', blockers: 'Block Breaker', score: 'Score Challenge', mixed: 'Mixed Challenge', time: 'Time Challenge', treasure: 'Ancient Treasure', rescue: 'Magic Rescue', path: 'Crystal Path', restore: 'Forest Restoration', energy: 'Energy Collection', portal: 'Portal Challenge', boss: 'Boss Battle' };

  function showIntro(level, isDaily) {
    var w = level.world - 1, W = LV.WORLDS[w], tip = level.tip && !save.noTips && !save.seen['tip_' + level.tip] ? LV.TIPS[level.tip] : null;
    var dlg = LV.DIALOGUE[level.id], boss = level.boss, who = '';
    if (boss) { who = charCard('character_05_shadow_lord', LV.BOSS_TAUNT[w] || '', { noNew: true }).replace('assets/characters/character_05_shadow_lord.svg', 'assets/bosses/' + boss.art + '.svg').replace('<b>Shadow Lord</b> <span class="role">The villain</span>', '<b>' + esc(boss.name) + '</b> <span class="role">Boss</span>'); }
    else if (dlg) who = charCard(dlg[0], dlg[1]);
    var goals = level.objectives.map(function (o) { return goalHtml(o, level); }).join('');
    var dstat = isDaily ? (save.dc.date === today() ? save.dc : { best: 0 }) : null;
    var starsLine = '<div class="small-text center">' + ic('star', 'inl') + ' goals · ' + ic('star', 'inl') + ic('star', 'inl') + ' ' + level.stars[1] + ' · ' + ic('star', 'inl') + ic('star', 'inl') + ic('star', 'inl') + ' ' + level.stars[2] + ' points' +
      (dstat ? ' · best today ' + (dstat.best || 0) : save.stars[level.id] ? ' · your best ' + (save.best[level.id] || 0) : '') + '</div>';
    var ownsStarter = STARTERS.some(function (b) { return (save.boosters[b[0]] || 0) > 0; });
    var showStarters = level.id >= 7 || isDaily || ownsStarter;
    var picks = {};
    var startersHtml = showStarters ? '<div class="starters"><div class="small-text center">Starter boosters (optional)</div><div class="row" style="justify-content:center">' +
      STARTERS.map(function (b) { return '<button class="stbtn" data-k="' + b[0] + '" aria-label="' + b[2] + '">' + im(b[1]) + '<small>' + b[3] + '</small><b>×' + (save.boosters[b[0]] || 0) + '</b></button>'; }).join('') + '</div></div>' : '';
    var sub = (isDaily ? 'One puzzle a day, the same for everyone' : TYPE_NAME[level.type] + ' · ' + W.name) + ' · ' + (level.time ? level.time + ' seconds' : level.moves + ' moves');
    var c = openModal('<h2>' + (isDaily ? 'Daily Puzzle' : (boss ? 'BOSS · ' : '') + 'Level ' + level.num) + '</h2><div class="small-text center">' + esc(sub) + '</div>' + who +
      '<div class="goals">' + goals + '</div>' + starsLine +
      (tip ? '<div class="who">' + ic('book') + '<div><b>' + esc(tip.title) + '</b><div class="small-text">' + esc(tip.text) + '</div></div></div>' : '') + startersHtml +
      '<div class="btns"><button class="btn gold" id="mGo">' + ic('play') + 'START</button><button class="btn ghost small" id="mX">Back</button></div>');
    Array.prototype.forEach.call(c.querySelectorAll('.stbtn'), function (b) {
      click(b, function () {
        var k = b.dataset.k;
        if (!(save.boosters[k] || 0)) { toast('None left. Get some in the shop.'); return; }
        picks[k] = !picks[k]; b.classList.toggle('on', !!picks[k]);
      });
    });
    click($('#mGo', c), function () {
      if (dlg) markSeen(dlg[0]); if (boss) markSeen('character_05_shadow_lord');
      if (tip) { save.seen['tip_' + level.tip] = 1; }
      var chosen = Object.keys(picks).filter(function (k) { return picks[k] && (save.boosters[k] || 0) > 0; });
      chosen.forEach(function (k) { save.boosters[k]--; track('starter_used', { booster: k, level: String(level.id) }); });
      persist(); closeModal(); startLevel(level, isDaily, chosen.map(function (k) { return STARTER_KIND[k]; }));
    });
    click($('#mX', c), closeModal);
  }

  /* ---------- the board ---------- */
  var eng, L, cell = 44, rows = 8, cols = 8, tiles = {}, blks = {}, boardEl, wrapEl, layerU, layerT, layerL, layerF, busy = false, sel = null, armed = null, hintT = null, tickT = null, revived = false, attemptStart = 0, isDailyRun = false, coachOn = false, lostSent = false, lastRestore = null;
  var drag = null, ro = null;

  function leaveGame() { clearTimeout(hintT); clearInterval(tickT); tickT = null; eng = null; busy = false; armed = null; try { if (ro) ro.disconnect(); } catch (e) {} ro = null; window.removeEventListener('resize', layout); }

  function el(cls, html) { var d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; }
  function setPos(d, r, c) { var tf = 'translate(' + (c * cell) + 'px,' + (r * cell) + 'px)'; d.style.transform = tf; d.style.setProperty('--tf', tf); d._r = r; d._c = c; }
  function look(d, t) {
    var sp = t.sp; d.innerHTML = '<img alt="" src="' + (t.item ? icon('chest') : sp ? spSrc(sp) : crystalSrc(t.color)) + '">';
    d.classList.toggle('sp', !!sp); d.classList.toggle('item', !!t.item); d.style.setProperty('--glow', sp ? (t.color >= 0 ? GLOW[t.color] : '#ffffff') : 'transparent');
  }
  function mkTile(t, r, c) { var d = el('t'); d.dataset.id = t.id; look(d, t); setPos(d, r, c); layerT.appendChild(d); tiles[t.id] = d; return d; }
  function mkBlk(b, r, c) {
    var def = E.BLOCKERS[b.kind], d = el('b ' + def.mode + (def.css ? ' css ' + def.css : ''), (def.css ? '' : '<img alt="" src="' + blkSrc(b.kind) + '">') + (b.hp > 1 ? '<span class="hp">' + b.hp + '</span>' : ''));
    setPos(d, r, c); (def.mode === 'lock' ? layerL : layerU).appendChild(d); blks[r + ',' + c] = d; d._kind = b.kind; return d;
  }
  function updBlk(d, hp) { var h = d.querySelector('.hp'); if (hp > 1) { if (!h) { h = document.createElement('span'); h.className = 'hp'; d.appendChild(h); } h.textContent = hp; } else if (h) h.remove(); }

  function buildBoard(wrap, engine) {
    wrapEl = wrap; rows = engine.rows; cols = engine.cols; tiles = {}; blks = {};
    wrap.innerHTML = '';
    boardEl = el(''); boardEl.id = 'board';
    var bgl = el('bgl'); boardEl.appendChild(bgl);
    layerU = el('layer'); layerT = el('layer'); layerL = el('layer'); layerF = el('layer'); layerT.style.pointerEvents = 'none';
    [layerU, layerT, layerL, layerF].forEach(function (l) { boardEl.appendChild(l); });
    wrap.appendChild(boardEl);
    boardEl._bgl = bgl; layout(true);
    window.addEventListener('resize', layout);
    try { ro = new ResizeObserver(function () { layout(); }); ro.observe(wrap); } catch (e) {}
    boardEl.addEventListener('pointerdown', onDown); boardEl.addEventListener('pointermove', onMove); boardEl.addEventListener('pointerup', onUp); boardEl.addEventListener('pointercancel', function () { drag = null; });
  }
  var lastCell = -1;
  function layout(force) {
    if (!wrapEl || !eng) return;
    var w = wrapEl.clientWidth, h = wrapEl.clientHeight; if (!w || !h) return;
    var c = Math.max(14, Math.floor(Math.min((w - 10) / cols, (h - 10) / rows)));
    if (c === lastCell && force !== true) return; lastCell = c; cell = c;
    app.style.setProperty('--cell', c + 'px'); boardEl.style.width = c * cols + 'px'; boardEl.style.height = c * rows + 'px';
    var bgl = boardEl._bgl; bgl.innerHTML = '';
    for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) if (!eng.hole[r][cc]) { var b = el('cellbg' + ((r + cc) % 2 ? ' alt' : '')); b.style.transform = 'translate(' + cc * c + 'px,' + r * c + 'px)'; bgl.appendChild(b); }
    Object.keys(tiles).forEach(function (id) { var d = tiles[id]; d.style.transition = 'none'; setPos(d, d._r, d._c); d.offsetWidth; d.style.transition = ''; });
    Object.keys(blks).forEach(function (k) { var d = blks[k]; setPos(d, d._r, d._c); });
  }
  /* make the screen match the engine exactly (used after every move, so a missed animation can never leave a wrong board) */
  function sync() {
    if (!eng) return;
    var seen = {}, r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      var t = eng.grid[r][c];
      if (t) { seen[t.id] = 1; var d = tiles[t.id]; if (!d) d = mkTile(t, r, c); else { d.classList.remove('pop', 'drop', 'shake', 'sel', 'hint'); look(d, t); if (d._r !== r || d._c !== c) setPos(d, r, c); } }
    }
    Object.keys(tiles).forEach(function (id) { if (!seen[id]) { tiles[id].remove(); delete tiles[id]; } });
    var bseen = {};
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      var b = eng.blk[r][c], k = r + ',' + c;
      if (b) { bseen[k] = 1; var bd = blks[k]; if (bd && bd._kind !== b.kind) { bd.remove(); delete blks[k]; bd = null; } if (!bd) bd = mkBlk(b, r, c); else { bd.classList.remove('hit', 'gone'); updBlk(bd, b.hp); } }
    }
    Object.keys(blks).forEach(function (k) { if (!bseen[k]) { blks[k].remove(); delete blks[k]; } });
  }
  function centre(r, c) { return { x: c * cell + cell / 2, y: r * cell + cell / 2 }; }

  /* ---------- starting a level ---------- */
  function startLevel(level, daily, starters) {
    L = JSON.parse(JSON.stringify(level)); isDailyRun = !!daily; revived = false; lostSent = false; armed = null; sel = null; busy = false; attemptStart = Date.now();
    clearInterval(tickT); tickT = null;
    var W = LV.WORLDS[L.world - 1];
    eng = new E(L, daily ? L.seed : (Math.floor(Math.random() * 1e9) + 1));
    if (starters && starters.length) eng.applyStarters(starters);
    setBg(W.bg, worldFrac(L.world - 1));
    A.music(L.boss ? 'music_07_boss_battle' : W.music);
    track('level_start', { level: String(L.id), world: L.world, type: L.type, boss: !!L.boss, daily: !!daily, starters: (starters || []).length });
    setScreen('play', '',
      '<div class="hud"><button class="iconbtn" id="bPause" aria-label="Pause">' + ic('pause') + '</button>' +
      '<div class="lv">' + (isDailyRun ? 'Daily Puzzle' : W.name) + '<b>' + (isDailyRun ? 'Score big!' : (L.boss ? 'BOSS' : 'Level ' + L.num)) + '</b></div>' +
      '<div class="row"><div class="stat" id="stMoves"><small>MOVES</small><b>0</b></div><div class="stat"><small>SCORE</small><b id="stScore">0</b></div></div></div>' +
      '<div class="objs" id="objs"></div>' +
      '<div class="starbar" id="starbar" aria-label="Star goals"><div class="fill" id="sbFill"></div><span class="m" id="sb2"></span><span class="m" id="sb3"></span></div>' +
      (L.boss ? '<div class="bossbar"><img alt="" src="assets/bosses/' + L.boss.art + '.svg"><div class="bar red"><i id="bossFill" style="width:100%"></i></div></div>' : '') +
      '<div class="grow" id="boardWrap"></div><div class="arm-note" id="armNote"></div>' +
      '<div class="boosters" id="boosters"></div>');
    buildBoard($('#boardWrap'), eng);
    coachOn = !save.noTips && !save.seen.firstMove && L.id === 1;
    sync(); setHud(eng.hud()); drawBoosters();
    click($('#bPause'), pauseMenu);
    armHint();
    if (L.time) tickT = setInterval(onTick, 1000);
  }
  /* the clock of a Time Challenge only runs while the player can actually move */
  function onTick() {
    if (!eng || !eng.timed || eng.state !== 'ready' || busy || !modalEl.hidden || cur.name !== 'play' || document.hidden) return;
    var st = eng.tick(1); setHud(eng.hud());
    if (st && st.length) { busy = true; clearHintMark(); run(st).then(afterRun); }
  }

  /* ---------- HUD ---------- */
  function setHud(h) {
    if (!eng) return;
    var m = $('#stMoves');
    if (m) {
      m.querySelector('small').textContent = h.timed ? 'TIME' : 'MOVES';
      m.querySelector('b').textContent = h.timed ? fmtTime(h.time) : h.moves;
      m.classList.toggle('low', h.timed ? h.time <= 10 : h.moves <= 5);
    }
    var s = $('#stScore'); if (s) s.textContent = h.score;
    var o = $('#objs'); if (o) o.innerHTML = h.obj.map(function (g, i) {
      var info = objInfo(L.objectives[i]);
      var txt = g.type === 'score' ? Math.min(h.score, g.need) + '/' + g.need : g.type === 'boss' ? (g.done ? 'Defeated!' : 'Boss HP ' + h.bossHp) : g.cur + '/' + g.need;
      return '<div class="obj' + (g.done ? ' done' : '') + '">' + im(info.img) + txt + (g.done ? ' ✓' : '') + '</div>';
    }).join('');
    var sf = $('#sbFill'); if (sf && L.stars) {
      var top = L.stars[2] || 1; sf.style.width = Math.min(100, Math.round(h.score / top * 100)) + '%';
      var m2 = $('#sb2'), m3 = $('#sb3');
      m2.style.left = Math.round(L.stars[1] / top * 100) + '%'; m3.style.left = '100%';
      m2.classList.toggle('on', h.score >= L.stars[1]); m3.classList.toggle('on', h.score >= L.stars[2]);
    }
    var bf = $('#bossFill'); if (bf && L.boss) bf.style.width = Math.max(0, Math.round(h.bossHp / L.boss.hp * 100)) + '%';
  }
  var TAP_BOOST = { hammer: 'Tap a crystal or block to smash it', strike: 'Tap a crystal: its whole row goes', wand: 'Tap a crystal to turn it into a special crystal', rainbow: 'Tap a crystal: every crystal of that colour goes' };
  function drawBoosters() {
    var b = $('#boosters'); if (!b) return;
    if (L && !isDailyRun && L.id <= 2) { b.innerHTML = ''; b.style.display = 'none'; var nt = $('#armNote'); if (nt) nt.textContent = coachOn ? 'Swap the two glowing crystals!' : ''; return; }
    b.style.display = '';
    b.innerHTML = GAME_BOOSTS.map(function (x) {
      var n = save.boosters[x[0]] || 0, label = x[0] === 'moves' && L && L.time ? '+15s' : x[3];
      return '<button class="boost' + (n ? '' : ' zero') + (armed === x[0] ? ' armed' : '') + '" data-k="' + x[0] + '" aria-label="' + x[2] + '">' + im(x[1]) + '<span class="n">' + (n || '+') + '</span><small>' + label + '</small></button>';
    }).join('');
    Array.prototype.forEach.call(b.querySelectorAll('.boost'), function (btn) { click(btn, function () { onBooster(btn.dataset.k); }); });
    var note = $('#armNote'); if (note) note.textContent = armed ? TAP_BOOST[armed] : coachOn ? 'Swap the two glowing crystals!' : '';
  }

  /* ---------- touching the board ---------- */
  function cellAt(e) {
    var rect = boardEl.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
    var c = Math.floor(x / cell), r = Math.floor(y / cell);
    return (r >= 0 && c >= 0 && r < rows && c < cols) ? [r, c] : null;
  }
  function onDown(e) {
    A.unlock(); if (!eng || busy || eng.state !== 'ready') return;
    var p = cellAt(e); if (!p) return; clearHintMark();
    if (armed) { useBoosterAt(p); return; }
    if (!eng.tile(p[0], p[1])) return;
    drag = { x: e.clientX, y: e.clientY, p: p, moved: false, wasSel: sel && sel[0] === p[0] && sel[1] === p[1] };
    if (sel && !drag.wasSel && Math.abs(sel[0] - p[0]) + Math.abs(sel[1] - p[1]) === 1) { var a = sel; drag = null; select(null); trySwap(a, p); return; }
    select(p); A.sfx('select');
  }
  function onMove(e) {
    if (!drag || busy) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y, th = cell * 0.4;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
    var p = drag.p, q = Math.abs(dx) > Math.abs(dy) ? [p[0], p[1] + (dx > 0 ? 1 : -1)] : [p[0] + (dy > 0 ? 1 : -1), p[1]];
    drag = null; select(null);
    if (q[0] >= 0 && q[1] >= 0 && q[0] < rows && q[1] < cols) trySwap(p, q);
  }
  function onUp() { if (!drag) return; if (drag.wasSel) select(null); drag = null; }
  function select(p) {
    if (sel) { var o = eng.tile(sel[0], sel[1]); if (o && tiles[o.id]) tiles[o.id].classList.remove('sel'); }
    sel = p; if (p) { var t = eng.tile(p[0], p[1]); if (t && tiles[t.id]) tiles[t.id].classList.add('sel'); }
  }
  function clearHintMark() { clearTimeout(hintT); Array.prototype.forEach.call(document.querySelectorAll('.t.hint'), function (d) { d.classList.remove('hint'); }); }
  function armHint() {
    clearTimeout(hintT);
    hintT = setTimeout(function () {
      if (!eng || busy || eng.state !== 'ready' || !modalEl.hidden) { armHint(); return; }
      var h = eng.findHint(); if (!h) return;
      h.forEach(function (p) { var t = eng.tile(p[0], p[1]); if (t && tiles[t.id]) tiles[t.id].classList.add('hint'); });
    }, coachOn ? 1800 : 6000);
  }

  async function trySwap(a, b) {
    var res = eng.trySwap(a, b);
    if (!res.steps.length) return;
    busy = true; clearHintMark();
    if (res.ok && coachOn) { coachOn = false; save.seen.firstMove = 1; persist(); drawBoosters(); }
    await run(res.steps);
    afterRun();
  }
  function afterRun() {
    if (!eng) return;
    sync(); setHud(eng.hud());
    busy = eng.state !== 'ready';
    if (eng.state === 'ready') armHint();
  }

  /* ---------- boosters in a level ---------- */
  function onBooster(k) {
    A.unlock(); if (!eng || busy || eng.state !== 'ready') return;
    var n = save.boosters[k] || 0;
    if (n <= 0) { getBooster(k); return; }
    if (TAP_BOOST[k]) { armed = armed === k ? null : k; drawBoosters(); return; }
    var res = eng.useBooster(k); if (!res.ok) { toast('Not now.'); return; }
    spendBooster(k); A.sfx('booster'); runBooster(res);
  }
  function useBoosterAt(p) {
    var k = armed; armed = null;
    var res = eng.useBooster(k, p);
    if (!res.ok) { toast(k === 'rainbow' || k === 'wand' ? 'Tap a normal crystal.' : 'Tap a crystal or block.'); drawBoosters(); return; }
    spendBooster(k); runBooster(res);
  }
  function spendBooster(k) { save.boosters[k]--; persist(); drawBoosters(); track('booster_used', { booster: k, level: String(L.id) }); }
  async function runBooster(res) { busy = true; clearHintMark(); await run(res.steps); afterRun(); }
  function getBooster(k) {
    var x = boost(k), price = x[4];
    var c = openModal('<h2>' + x[2] + '</h2><div class="center">' + im(x[1], 'big') + '</div><div class="small-text center">' + esc(x[5]) + ' You have none left. Get one:</div>' +
      '<div class="btns"><button class="btn gold" id="mWatch">' + ic('play') + 'Free: watch a short video</button><button class="btn blue" id="mBuy" ' + (save.coins < price ? 'disabled' : '') + '>' + ic('coin') + 'Buy for ' + price + ' coins</button><button class="btn ghost small" id="mX">Not now</button></div>');
    click($('#mWatch', c), function () { offerReward(function () { save.boosters[k] = (save.boosters[k] || 0) + 1; persist(); closeModal(); drawBoosters(); toast('Got 1 ' + x[2] + '!'); A.sfx('reward'); }, 'booster_' + k); });
    click($('#mBuy', c), function () { if (save.coins >= price) { save.coins -= price; save.boosters[k] = (save.boosters[k] || 0) + 1; persist(); closeModal(); drawBoosters(); A.sfx('reward'); track('shop_buy', { booster: k, where: 'level' }); } });
    click($('#mX', c), closeModal);
  }

  /* ---------- the booster shop ---------- */
  function shop(tab) {
    tab = tab || 'game';
    var items = BOOST.filter(function (b) { return b[6] === tab; });
    var rows_ = items.map(function (b) {
      return '<div class="srow">' + im(b[1]) + '<div class="grow"><b>' + esc(b[2]) + '</b><div class="small-text">' + esc(b[5]) + '</div></div><span class="own">×' + (save.boosters[b[0]] || 0) + '</span>' +
        '<button class="btn small gold buy" data-k="' + b[0] + '" ' + (save.coins < b[4] ? 'disabled' : '') + '>' + ic('coin') + b[4] + '</button></div>';
    }).join('');
    var c = openModal('<h2>Booster Shop</h2><div class="row" style="justify-content:space-between"><span class="chip">' + ic('coin') + '<b>' + save.coins + '</b></span>' +
      '<div class="row"><button class="btn small ' + (tab === 'game' ? 'blue' : 'ghost') + '" id="tabG">In a level</button><button class="btn small ' + (tab === 'start' ? 'blue' : 'ghost') + '" id="tabS">Starters</button></div></div>' +
      '<div class="small-text center">' + (tab === 'game' ? 'Use these while you play.' : 'Pick these before a level starts.') + '</div><div class="slist">' + rows_ + '</div>' +
      '<div class="btns"><button class="btn gold small" id="mGift">' + ic('gift') + 'Free: 100 coins (watch a video)</button><button class="btn ghost small" id="mX">Close</button></div>');
    click($('#tabG', c), function () { shop('game'); }); click($('#tabS', c), function () { shop('start'); });
    Array.prototype.forEach.call(c.querySelectorAll('.buy'), function (b) {
      click(b, function () {
        var k = b.dataset.k, x = boost(k); if (save.coins < x[4]) return;
        save.coins -= x[4]; save.boosters[k] = (save.boosters[k] || 0) + 1; persist(); A.sfx('reward'); track('shop_buy', { booster: k, where: 'shop' });
        shop(tab); var ch = $('#coins'); if (ch) ch.textContent = save.coins;
      });
    });
    click($('#mGift', c), function () { offerReward(function () { save.coins += 100; persist(); A.sfx('reward'); shop(tab); var ch = $('#coins'); if (ch) ch.textContent = save.coins; }, 'shop_coins'); });
    click($('#mX', c), function () { closeModal(); if (cur.name === 'home') home(); else if (cur.name === 'map') map(cur.world); });
  }

  /* ---------- playing the steps the engine gives us ---------- */
  async function run(steps) {
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      if (s.k === 'bad') {
        A.sfx('select'); var ta = eng.tile(s.a[0], s.a[1]), tb = eng.tile(s.b[0], s.b[1]);
        if (ta && tb && tiles[ta.id] && tiles[tb.id]) { setPos(tiles[ta.id], s.b[0], s.b[1]); setPos(tiles[tb.id], s.a[0], s.a[1]); await sleep(150); setPos(tiles[ta.id], s.a[0], s.a[1]); setPos(tiles[tb.id], s.b[0], s.b[1]); tiles[ta.id].classList.add('shake'); await sleep(260); tiles[ta.id].classList.remove('shake'); }
      } else if (s.k === 'swap') {
        if (tiles[s.ta] && tiles[s.tb]) { setPos(tiles[s.ta], s.b[0], s.b[1]); setPos(tiles[s.tb], s.a[0], s.a[1]); }
        A.sfx('move'); await sleep(200);
      } else if (s.k === 'clear') await doClear(s);
      else if (s.k === 'fall') await doFall(s);
      else if (s.k === 'boss') await doBoss(s);
      else if (s.k === 'item') {
        var di = tiles[s.id]; if (di) { di.classList.add('pop'); setTimeout(function () { di.remove(); }, 270 * T); delete tiles[s.id]; }
        A.sfx('reward'); setHud(s.hud); toast('Treasure found!'); await sleep(320);
      } else if (s.k === 'wand') {
        var dw = tiles[s.id]; if (dw) { look(dw, { sp: s.sp, color: s.color }); dw.classList.add('born'); setTimeout(function () { dw.classList.remove('born'); }, 450); }
        A.sfx('booster'); toast('Magic Wand! ' + SPNAME[s.sp]); await sleep(380);
      } else if (s.k === 'shield') { toast('Your Magic Shield blocked the attack!'); A.sfx('booster'); await sleep(450); }
      else if (s.k === 'shuffle') {
        toast('No moves left, shuffling!'); A.sfx('booster');
        s.moves.forEach(function (m) { if (tiles[m.id]) setPos(tiles[m.id], m.r, m.c); }); await sleep(450);
      } else if (s.k === 'hud' || s.k === 'ready') setHud(s.hud);
      else if (s.k === 'end') await doEnd(s);
    }
  }
  function fxEl(cls, x, y, w, h, html) {
    var d = el('fx ' + cls, html || ''); d.style.left = x + 'px'; d.style.top = y + 'px'; if (w) d.style.width = w + 'px'; if (h) d.style.height = h + 'px';
    layerF.appendChild(d); setTimeout(function () { d.remove(); }, 1000 * T + 100); return d;
  }
  function showFx(f) {
    var p = centre(f.r, f.c), W = cols * cell, H = rows * cell;
    switch (f.type) {
      case 'lightning': fxEl('beamh', 0, f.r * cell + cell * 0.1, W); A.sfx('lightning'); break;
      case 'thunder': fxEl('beamv', f.c * cell + cell * 0.1, 0, 0, H); A.sfx('lightning'); break;
      case 'bomb': fxEl('ring', p.x, p.y, cell * 3, cell * 3); A.sfx('explosion'); break;
      case 'nova': fxEl('ring', p.x, p.y, cell * 5, cell * 5); fxEl('flash', 0, 0); A.sfx('explosion'); break;
      case 'star': fxEl('beamh', 0, f.r * cell + cell * 0.1, W); fxEl('beamv', f.c * cell + cell * 0.1, 0, 0, H); fxEl('ring', p.x, p.y, cell * 4, cell * 4); A.sfx('lightning'); break;
      case 'rainbow': fxEl('rainbowfx', 0, 0); A.sfx('rainbow'); break;
      case 'fish': (f.targets || []).forEach(function (t, i) { var q = centre(t[0], t[1]), d = fxEl('fish', p.x - cell / 2, p.y - cell / 2, 0, 0, '<img alt="" src="' + spSrc('fish') + '">'); setTimeout(function () { d.style.transform = 'translate(' + (q.x - p.x) + 'px,' + (q.y - p.y) + 'px) scale(.7)'; }, 20 + i * 60); }); A.sfx('booster'); break;
      case 'super': fxEl('flash', 0, 0); fxEl('ring', p.x, p.y, cell * 8, cell * 8); A.sfx('explosion'); break;
      case 'combo': fxEl('flash', 0, 0); fxEl('ring', p.x, p.y, cell * 6, cell * 6); A.sfx('explosion'); if (f.a === 'rainbow' || f.b === 'rainbow') fxEl('rainbowfx', 0, 0); break;
      case 'hammer': fxEl('hammer', p.x - cell / 2, p.y - cell / 2 - 4, 0, 0, '<img alt="" src="' + icon('hammer') + '">'); A.sfx('booster'); break;
    }
  }
  async function doClear(s) {
    var n = s.cells.length, big = false;
    s.fx.forEach(function (f) { showFx(f); if (f.type === 'nova' || f.type === 'combo' || f.type === 'super') big = true; });
    if (!s.fx.length) A.sfx(n >= 5 ? 'match5' : n === 4 ? 'match4' : 'match3');
    if (big) { boardEl.classList.remove('bossshake'); void boardEl.offsetWidth; boardEl.classList.add('bossshake'); }
    var sx = 0, sy = 0;
    s.cells.forEach(function (c) { var d = tiles[c.id]; sx += c.c; sy += c.r; if (d) { d.classList.add('pop'); setTimeout(function () { d.remove(); }, 270 * T); delete tiles[c.id]; } });
    s.blk.forEach(function (b) {
      var d = blks[b.r + ',' + b.c]; if (!d) return;
      if (b.gone) { d.classList.add('gone'); delete blks[b.r + ',' + b.c]; setTimeout(function () { d.remove(); }, 320 * T); A.sfx(E.BLOCKERS[b.kind].css ? 'select' : 'explosion'); }
      else { updBlk(d, b.hp); d.classList.remove('hit'); void d.offsetWidth; d.classList.add('hit'); }
    });
    if (n) { var p = centre(sy / n, sx / n); fxEl('pts', p.x, p.y, 0, 0, '+' + s.pts); }
    if (s.cascade >= 2) { toast(['', '', 'Nice!', 'Great!', 'Awesome!', 'Crystal Master!'][Math.min(s.cascade, 5)]); }
    s.makes.forEach(function (m) {
      var d = tiles[m.id]; if (d) { look(d, { sp: m.sp, color: m.color }); d.classList.add('born'); setTimeout(function () { d.classList.remove('born'); }, 450); }
      if (!save.seen.spMade) { save.seen.spMade = 1; persist(); setTimeout(function () { toast(SPNAME[m.sp] + ' made! Swap it to set it off.'); }, 500 * T); }
    });
    setHud(s.hud);
    await sleep(s.fx.length ? 420 : 280);
  }
  async function doFall(s) {
    s.moves.forEach(function (m) { var d = tiles[m.id]; if (d) { d.classList.add('drop'); setPos(d, m.r, m.c); } });
    s.spawn.forEach(function (n) { var t = { id: n.id, color: n.color, sp: null }, d = mkTile(t, n.fromR, n.c); d.classList.add('drop'); });
    void boardEl.offsetWidth;
    s.spawn.forEach(function (n) { var d = tiles[n.id]; if (d) setPos(d, n.r, n.c); });
    await sleep(340);
    Object.keys(tiles).forEach(function (id) { tiles[id].classList.remove('drop'); });
  }
  async function doBoss(s) {
    A.sfx('bossAttack'); boardEl.classList.remove('bossshake'); void boardEl.offsetWidth; boardEl.classList.add('bossshake');
    toast(L.boss.name + ' freezes some crystals! Clear them to break the frost.');
    s.cells.forEach(function (p) { var b = eng.blk[p[0]][p[1]]; if (b && !blks[p[0] + ',' + p[1]]) { var d = mkBlk(b, p[0], p[1]); d.classList.add('hit'); } });
    await sleep(500);
  }
  async function doEnd(s) {
    setHud(s.hud);
    if (s.result === 'win') { A.sfx(L.boss ? 'bossDefeat' : 'win'); await sleep(700); showWin(s); }
    else { A.sfx('fail'); await sleep(600); showLose(); }
  }

  /* ---------- win, lose, pause ---------- */
  function addBooster(k, n) { save.boosters[k] = (save.boosters[k] || 0) + n; }
  var TEACH_GIFTS = { 2: 'hammer', 4: 'shuffle', 6: 'strike', 8: 'wand', 10: 'moves', 12: 'rainbow', 14: 's_bomb', 16: 's_shield' };   // the first boosters are earned, one at a time
  var PRIZES = ['hammer', 'strike', 'wand', 'shuffle', 'rainbow', 's_bomb', 's_lightning', 's_rainbow', 's_shield'];
  function stars3(stars) { return '<div class="stars">' + [1, 2, 3].map(function (n) { return '<img alt="" class="' + (n <= stars ? '' : 'off') + '" src="' + icon(n <= stars ? 'star' : 'star_empty') + '">'; }).join('') + '</div>'; }
  function showWin(s) {
    var stars = s.stars, id = L.id, lines = [], coinsGain = 20 + stars * 10, firstTime = false, oldStars = save.stars[id] || 0, hero = LV.WORLDS[L.world - 1].hero;
    if (isDailyRun) {
      var dc = save.dc; if (dc.date !== today()) save.dc = dc = { date: today(), best: 0, paid: false };
      dc.best = Math.max(dc.best, eng.score);
      if (!dc.paid) { dc.paid = true; coinsGain = 100; addBooster('hammer', 1); lines.push('Daily bonus: 100 coins and a Hammer!'); } else coinsGain = 0;
      save.coins += coinsGain; persist();
      track('level_complete', { level: String(id), world: L.world, daily: true, score: eng.score, stars: stars });
      A.sfx('reward');
      var c0 = openModal('<h2>Daily Puzzle done!</h2>' + stars3(stars) +
        '<div class="center"><b style="font-size:26px">' + eng.score + '</b><div class="small-text">Best today: ' + dc.best + '</div></div><div class="small-text center">' + (lines.join(' ') || 'Come back tomorrow for a new puzzle!') + '</div>' +
        '<div class="btns"><button class="btn gold" id="mHome">Home</button></div>', { sticky: true });
      click($('#mHome', c0), home); return;
    }
    firstTime = oldStars === 0;
    var world = L.world - 1, gained = (firstTime ? 10 : 0) + 5 * Math.max(0, stars - oldStars);
    if (firstTime) coinsGain += 20;
    var before = save.energy[world]; save.energy[world] = before + gained;
    save.stars[id] = Math.max(oldStars, stars); save.best[id] = Math.max(save.best[id] || 0, eng.score); save.coins += coinsGain;
    save.stats.wins++; save.stats.bestCascade = Math.max(save.stats.bestCascade, eng.stats.bestCascade); save.stats.specials += eng.stats.specials;
    if (stars === 3 && oldStars < 3) save.stats.threeStars++;
    if (L.boss) save.stats.bosses[world + 1] = true;
    if (stars === 3) { var prize = PRIZES[id % PRIZES.length]; addBooster(prize, 1); lines.push('3 stars: you found a ' + boost(prize)[2] + '!'); }
    else if (L.num % 5 === 0) { addBooster('hammer', 1); lines.push('Bonus Hammer!'); }
    if (firstTime && TEACH_GIFTS[L.num] && L.world === 1) { addBooster(TEACH_GIFTS[L.num], 1); lines.push('New booster: ' + boost(TEACH_GIFTS[L.num])[2] + '! ' + boost(TEACH_GIFTS[L.num])[5]); }
    if (id === 3 && firstTime) track('tutorial_completed', { level: '3' });
    var restored = false;
    PROJ_T.forEach(function (t, k) { if (before < t && save.energy[world] >= t) { restored = true; save.coins += 50 * (k + 1); lines.push('Restored: ' + LV.WORLDS[world].projects[k] + '! +' + 50 * (k + 1) + ' coins'); } });
    lastRestore = restored ? { w: world, before: before } : null;
    if (L.boss && firstTime) lines.push(L.boss.name + ' is beaten!');
    var newWorld = L.num === 20 && firstTime && world < 4;
    markSeen(hero); persist();
    track('level_complete', { level: String(id), world: L.world, type: L.type, stars: stars, score: eng.score, moves_left: eng.moves, best_cascade: eng.stats.bestCascade, seconds: Math.round((Date.now() - attemptStart) / 1000) });
    if (L.boss) track('boss_beaten', { boss: L.boss.name, world: L.world });
    if (newWorld) track('world_unlocked', { world: L.world + 1 });
    if (lines.length) A.sfx('reward');
    var nextId = id < 100 ? id + 1 : null, say = LV.VICTORY[id % LV.VICTORY.length];
    var c = openModal('<h2>' + (L.boss ? 'BOSS DEFEATED!' : 'Level Complete!') + '</h2>' + stars3(stars) +
      charCard(hero, say, { cheer: true, noNew: true }) +
      '<div class="center"><b style="font-size:26px">' + eng.score + '</b><div class="small-text">Best ' + save.best[id] + ' · +' + coinsGain + ' coins · +' + gained + ' crystal energy</div></div>' +
      (lines.length ? '<div class="small-text center">' + lines.map(esc).join('<br>') + '</div>' : '') + (newWorld ? '<div class="small-text center"><b>New world unlocked: ' + LV.WORLDS[world + 1].name + '!</b></div>' : '') +
      '<div class="btns"><button class="btn gold" id="mNext" ' + (nextId ? '' : 'disabled') + '>' + ic('play') + (nextId ? 'NEXT LEVEL' : 'THE END… FOR NOW') + '</button>' +
      (restored ? '<button class="btn blue small" id="mKing">' + ic('crown') + 'See the kingdom come back!</button>' : '') +
      '<div class="btns two"><button class="btn blue small" id="mAgain">Replay</button><button class="btn ghost small" id="mMap">Map</button></div></div>', { sticky: true });
    click($('#mNext', c), function () { closeModal(); showIntro(LV.LEVELS[nextId - 1]); });
    click($('#mKing', c), function () { kingdom(lastRestore.w, lastRestore.before); });
    click($('#mAgain', c), function () { closeModal(); track('level_retry', { level: String(id) }); startLevel(LV.LEVELS[id - 1]); });
    click($('#mMap', c), function () { map(world); });
  }
  function showLose() {
    if (!lostSent) { lostSent = true; track('game_over', { level: String(L.id), world: L.world, type: L.type, score: eng.score, seconds: Math.round((Date.now() - attemptStart) / 1000) }); }
    var stuck = eng.objectiveProgress().filter(function (o) { return !o.done; }).length, hero = LV.WORLDS[L.world - 1].hero;
    var c = openModal('<h2>' + (L.time ? 'Time is up!' : 'Out of moves') + '</h2>' + charCard(hero, 'Do not give up, Guardian! ' + stuck + ' goal' + (stuck === 1 ? '' : 's') + ' left. You were close.', { noNew: true }) +
      '<div class="btns">' + (!revived ? '<button class="btn gold" id="mSecond">' + ic('extra_moves') + (L.time ? 'Second chance: +20 seconds' : 'Second chance: +5 moves') + '</button>' : '') +
      '<div class="btns two"><button class="btn blue small" id="mAgain">Try again</button><button class="btn ghost small" id="mMap">Map</button></div></div>', { sticky: true });
    click($('#mSecond', c), function () {
      offerReward(function () {
        var st = eng.reviveWithMoves(5); if (!st) return; revived = true; closeModal(); busy = true;
        run(st).then(function () { afterRun(); toast(L.time ? '+20 seconds. Go!' : '+5 moves. Go!'); });
      }, 'second_chance');
    });
    click($('#mAgain', c), function () { closeModal(); track('level_retry', { level: String(L.id) }); if (isDailyRun) startLevel(L, true); else startLevel(LV.LEVELS[L.id - 1]); });
    click($('#mMap', c), function () { if (isDailyRun) home(); else map(L.world - 1); });
  }
  function pauseMenu() {
    if (!eng) return; A.unlock();
    var c = openModal('<h2>Paused</h2>' + soundHtml() +
      '<div class="btns"><button class="btn gold" id="mGo">Resume</button><div class="btns two"><button class="btn blue small" id="mRe">Restart</button><button class="btn ghost small" id="mQ">' + (isDailyRun ? 'Home' : 'Map') + '</button></div></div>');
    bindSound(c);
    click($('#mGo', c), closeModal);
    click($('#mRe', c), function () { closeModal(); track('level_retry', { level: String(L.id) }); if (isDailyRun) startLevel(L, true); else startLevel(LV.LEVELS[L.id - 1]); });
    click($('#mQ', c), function () { if (isDailyRun) home(); else map(L.world - 1); });
  }

  /* ---------- daily reward (7-day streak, one missed day forgiven) and daily puzzle ---------- */
  var DAYS = [{ t: '100 coins', coins: 100, i: 'coin' }, { t: '150 coins', coins: 150, i: 'coin' }, { t: 'Hammer', b: 'hammer', i: 'hammer' }, { t: '200 coins', coins: 200, i: 'coin' },
    { t: 'Lightning Starter', b: 's_lightning', i: 'lightning' }, { t: '300 coins', coins: 300, i: 'coin' }, { t: 'Treasure chest', chest: true, i: 'chest' }];
  function prospectiveStreak() {
    var d = save.daily; if (!d.last) return 1; var gap = dayDiff(d.last, today());
    if (gap <= 0) return d.streak; if (gap <= 2) return d.streak + 1; return 1;      // gap of 2 = one forgiven missed day
  }
  function dailyReward() {
    var can = canClaimDaily(), st = can ? prospectiveStreak() : save.daily.streak, idx = (st - 1) % 7;
    var c = openModal('<h2>Daily Reward</h2><div class="small-text center">' + (can ? 'Come back every day. Miss one day and your streak stays safe!' : 'Claimed today. Come back tomorrow!') + '</div>' +
      '<div class="days">' + DAYS.map(function (d, k) { return '<div class="day' + (k === idx ? ' now' : '') + (k < idx || (k === idx && !can) ? ' past' : '') + '">' + ic(d.i) + 'Day ' + (k + 1) + '<br>' + d.t + (k < idx || (k === idx && !can) ? ' ✓' : '') + '</div>'; }).join('') + '</div>' +
      '<div class="btns"><button class="btn gold" id="mClaim" ' + (can ? '' : 'disabled') + '>' + ic('gift') + (can ? 'CLAIM' : 'Claimed') + '</button><button class="btn ghost small" id="mX">Close</button></div>');
    click($('#mClaim', c), function () {
      if (!canClaimDaily()) return;
      var s2 = prospectiveStreak(), d = DAYS[(s2 - 1) % 7];
      save.daily = { last: today(), streak: s2 };
      if (d.coins) save.coins += d.coins; if (d.b) addBooster(d.b, 1); if (d.chest) { save.coins += 500; ['hammer', 'strike', 'wand', 'shuffle', 'rainbow', 's_bomb'].forEach(function (k) { addBooster(k, 1); }); }
      persist(); A.sfx('reward'); track('reward_claimed', { kind: 'daily', day: ((s2 - 1) % 7) + 1, streak: s2 });
      toast('Claimed: ' + (d.chest ? '500 coins and a booster pack!' : d.t)); if (cur.name === 'home') home(); else closeModal();
    });
    click($('#mX', c), closeModal);
  }
  function dailyChallengeIntro() { showIntro(LV.daily(today()), true); }

  /* ---------- profile and achievements ---------- */
  function profile() {
    var st = save.stats, done_ = 0; for (var i = 1; i <= 100; i++) if (done(i)) done_++;
    var ACH = [['First Crystal', st.wins >= 1], ['Crystal Master', done_ >= 25], ['Combo King', st.bestCascade >= 4], ['Treasure Hunter', st.specials >= 10],
      ['Kingdom Builder', restoredCount(0) >= 5], ['Dragon Slayer', !!st.bosses[5] || !!st.bosses[2]], ['Perfect Guardian', st.threeStars >= 10]];
    var c = openModal('<h2>Crystal Guardian</h2><div class="row" style="justify-content:space-around"><span class="chip">' + ic('star') + totalStars() + '</span><span class="chip">' + ic('map') + done_ + '/100</span><span class="chip">' + ic('heart') + save.daily.streak + ' day streak</span></div>' +
      '<div class="small-text center">Best combo chain: ' + st.bestCascade + ' · Special crystals made: ' + st.specials + '</div>' +
      ACH.map(function (a) { return '<div class="ach' + (a[1] ? ' on' : '') + '">' + ic(a[1] ? 'trophy' : 'lock') + a[0] + '</div>'; }).join('') +
      '<div class="btns"><button class="btn ghost small" id="mX">Close</button></div>');
    click($('#mX', c), closeModal);
  }

  /* ---------- cover picture for stratos.games (?cover=1) ---------- */
  function coverView() {
    var W = LV.WORLDS[0]; setBg(W.bg, 1);
    var level = JSON.parse(JSON.stringify(LV.LEVELS[10])); level.rows = 7; level.cols = 7; level.holes = []; level.items = 0; level.blockers = [{ r: 2, c: 5, kind: 'wood' }, { r: 4, c: 1, kind: 'cage' }, { r: 5, c: 2, kind: 'path' }, { r: 5, c: 3, kind: 'path' }];
    level.objectives = [{ type: 'score', n: 3000 }]; level.time = 0; level.moves = 30;
    eng = new E(level, 77);
    var spec = [[1, 1, 'lightning'], [3, 3, 'rainbow'], [5, 4, 'bomb'], [1, 4, 'star']];
    spec.forEach(function (s) { var t = eng.grid[s[0]][s[1]]; if (t) { t.sp = s[2]; if (s[2] === 'rainbow') t.color = -2; } });
    setScreen('cover', 'cover', '<div class="ctitle"><img alt="" src="assets/ui/logo_emblem.svg"><div><h1>CRYSTAL QUEST</h1><div class="sub">THE LOST KINGDOM</div></div><img alt="" src="assets/ui/logo_emblem.svg"></div><div class="right" id="cvWrap" style="width:min(64vh,92vw);height:min(64vh,92vw)"></div>');
    L = level; buildBoard($('#cvWrap'), eng); sync();
  }

  /* ---------- test hook (used by the automatic check, harmless for players) ---------- */
  window.__cq = {
    info: function () { return eng ? { state: eng.state, moves: eng.moves, score: eng.score, busy: busy, level: L && L.id, time: eng.timeLeft, items: eng.itemsOut } : null; },
    botMove: function () { if (!eng || busy || eng.state !== 'ready') return false; var h = eng.findHint(); if (!h) return false; trySwap(h[0], h[1]); return true; },
    go: function (id, starters) { startLevel(LV.LEVELS[id - 1], false, starters); },
    save: function () { return save; }, screen: function () { return cur.name; },
    intro: function (id) { showIntro(LV.LEVELS[id - 1]); }, kingdom: function (w, f) { kingdom(w, f); }, shop: function (t) { shop(t); }, settings: settings, map: function (w) { map(w); },
    engine: function () { return eng; }, audio: function () { return A.debug(); },
    unlockAll: function () { for (var i = 1; i <= 100; i++) save.stars[i] = 2; persist(); }
  };

  /* ---------- go ---------- */
  function boot() {
    A.init({ music: save.music, sfx: save.sfx, musicVol: save.musicVol, sfxVol: save.sfxVol });
    try { if (save.lowfx || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 4) <= 1) document.body.classList.add('lowfx'); } catch (e) {}
    document.addEventListener('pointerdown', function () { A.unlock(); }, { once: false, capture: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!modalEl.hidden && !modalEl.querySelector('#mHome,#mNext,#mAgain')) closeModal(); else if (cur.name === 'play' && modalEl.hidden) pauseMenu(); } });
    track('game_start', { returning: totalStars() > 0 });
    if (/[?&]cover=1/.test(location.search)) coverView(); else if (/[?&]nosplash=1/.test(location.search)) home(); else splash();
  }
  boot();
})();
