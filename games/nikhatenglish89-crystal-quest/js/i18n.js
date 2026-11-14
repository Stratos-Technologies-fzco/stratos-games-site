/* Crystal Quest language layer. English is written once in the game; every screen is translated as it appears
   from a language file (js/lang-<code>.js). To add a language: copy lang-hi.js, translate the right-hand side, add it to LANGS in this file
   and load the file in index.html. Anything not translated simply stays in English.
   Phrases with numbers or names use templates: {n} = a number, {t} = a text that is translated too. In the translated line {1}, {2}... point at them. */
(function (root) {
  'use strict';
  var LANGS = [['en', 'English'], ['hi', 'हिन्दी']];
  var lang = 'en', packs = {}, exact = null, templates = [], cache = {}, seen = {}, record = false, observer = null;

  function esc(s) { return s.replace(/[.*+?^$()|[\]\\]/g, '\\$&'); }
  function compile(map) {
    exact = {}; templates = []; cache = {};
    Object.keys(map || {}).forEach(function (k) {
      if (/\{[nt]\}/.test(k)) {
        var re = '^' + esc(k).replace(/\{n\}/g, '([\\d.,:]+)').replace(/\{t\}/g, '(.+?)') + '$';
        templates.push({ re: new RegExp(re), out: map[k], types: (k.match(/\{[nt]\}/g) || []).map(function (x) { return x[1]; }) });
      } else exact[k] = map[k];
    });
    // longer templates first, so the most specific one wins
    templates.sort(function (a, b) { return b.re.source.length - a.re.source.length; });
  }
  /* translate one piece of text (no outer spaces); returns null when there is nothing to translate it to */
  function core(s) {
    if (!s) return null;
    if (record) seen[s.replace(/\d+/g, '{n}')] = 1;
    if (!exact) return null;
    if (Object.prototype.hasOwnProperty.call(exact, s)) return exact[s];
    if (cache[s] !== undefined) return cache[s];
    var out = null, i, m;
    for (i = 0; i < templates.length && out === null; i++) {
      m = templates[i].re.exec(s);
      if (m) {
        var t = templates[i];
        out = t.out.replace(/\{(\d)\}/g, function (_, d) { var idx = +d - 1, v = m[idx + 1]; if (t.types[idx] === 't') { var tv = whole(v); return tv === null ? v : tv; } return v; });
      }
    }
    if (out === null && s.indexOf(' · ') > -1) {       // "A · B · C": translate each part
      var parts = s.split(' · '), any = false, res = parts.map(function (p) { var r = whole(p); if (r !== null) { any = true; return r; } return p; });
      if (any) out = res.join(' · ');
    }
    cache[s] = out; return out;
  }
  /* same, keeping the spaces around the text */
  function whole(s) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), r = core(m[2]);
    return r === null ? null : m[1] + r + m[3];
  }
  function t(s) { var r = lang === 'en' ? null : whole(String(s)); return r === null ? String(s) : r; }

  function node(n) {
    if (n.nodeType === 3) {
      var d = n.data; if (n.__t === d) return;
      var r = lang === 'en' ? (record ? whole(d) && null : null) : whole(d);
      if (r !== null && r !== d) n.data = r;
      n.__t = n.data;
    } else if (n.nodeType === 1) {
      if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || (n.hasAttribute && n.hasAttribute('data-keep'))) return;
      if (n.hasAttribute('aria-label')) attr(n);
      for (var c = n.firstChild; c; c = c.nextSibling) node(c);
    }
  }
  function attr(n) {
    var v = n.getAttribute('aria-label'); if (n.__a === v) return;
    var r = lang === 'en' ? (record ? (whole(v), null) : null) : whole(v); if (r !== null && r !== v) n.setAttribute('aria-label', r);
    n.__a = n.getAttribute('aria-label');
  }
  function start(rootEl) {
    if (observer) return;
    observer = new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'childList') Array.prototype.forEach.call(m.addedNodes, node);
        else if (m.type === 'characterData') node(m.target);
        else if (m.type === 'attributes') attr(m.target);
      });
    });
    observer.observe(rootEl, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
    node(rootEl);
  }
  function setLang(code) {
    if (!packs[code] && code !== 'en') code = 'en';
    lang = code; compile(code === 'en' ? {} : packs[code]);
    try { document.documentElement.lang = code; } catch (e) {}
    return code;
  }
  function register(code, map) { packs[code] = map; }
  function pick(saved) {
    if (saved && (saved === 'en' || packs[saved])) return saved;
    try { var n = (navigator.language || 'en').toLowerCase().slice(0, 2); if (packs[n]) return n; } catch (e) {}
    return 'en';
  }
  /* numbers formatted for the language (4,250 / 4,250 / 1,00,000) */
  function num(n) { try { return Number(n).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US'); } catch (e) { return String(n); } }

  root.CQI18n = { LANGS: LANGS, register: register, setLang: setLang, pick: pick, start: start, t: t, num: num, retranslate: function (el) { node(el || document.body); },
    get lang() { return lang; }, record: function (on) { record = !!on; }, seen: function () { return Object.keys(seen); } };
})(window);
