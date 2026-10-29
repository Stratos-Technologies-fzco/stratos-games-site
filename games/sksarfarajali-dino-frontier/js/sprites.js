/* In-game creature sprites: original side-view vector art generated in code (facing right, viewBox 800x600,
   feet on y=540). Palettes follow the Game Art Kit. The painted portraits in assets/portraits are for menus only. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';
  function grad(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
  function shade(hex, k) { // k<0 darker, k>0 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = k < 0 ? 0 : 255, p = Math.abs(k);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function wrap(defs, body, glow) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><defs>' + defs + (glow ? '<filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>' : '') + '</defs>' + body + '</svg>';
  }
  function leg(x, top, c, dark, flip) {
    var d = flip ? -1 : 1;
    return '<path d="M' + (x - 30) + ' ' + top + ' Q' + (x - 46) + ' ' + (top + 60) + ' ' + (x - 12) + ' ' + (top + 105) + ' L' + (x - 22 * d) + ' 528 L' + (x + 28) + ' 528 L' + (x + 22) + ' ' + (top + 100) + ' Q' + (x + 58) + ' ' + (top + 50) + ' ' + (x + 34) + ' ' + top + ' Z" fill="' + c + '"/>' +
      '<path d="M' + (x - 26) + ' 528 L' + (x - 42) + ' 545 L' + (x + 40) + ' 545 L' + (x + 28) + ' 528 Z" fill="' + dark + '"/>' +
      '<path d="M' + (x + 22) + ' 540 l12 6 M' + (x + 8) + ' 541 l10 6 M' + (x - 8) + ' 541 l8 6" stroke="#F3EBD7" stroke-width="4" stroke-linecap="round"/>';
  }
  /* Bipedal theropod. o: body, belly, accent, dark, eye, scale, crest:'spines'|'leaf'|'plates'|'feathers'|'crystal', horn, glow */
  function theropod(o) {
    var s = o.scale || 1, bodyTop = function (x) { var u = (x - 400) / 150; return 330 - 92 * Math.sqrt(Math.max(0, 1 - u * u)); };
    var defs = grad('b', shade(o.body, 0.18), o.body) + grad('bl', shade(o.belly, 0.1), o.belly), g = '';
    g += '<g transform="translate(400 540) scale(' + s + ') translate(-400 -540)">';
    g += '<path d="M280 300 C200 300 110 335 36 430 C120 392 205 386 282 372 Z" fill="url(#b)"/>';
    if (o.crest === 'feathers') g += '<path d="M120 380 q-40 -4 -70 20 q40 -4 70 -6 M160 372 q-34 -16 -66 -6 q38 4 66 12" fill="none" stroke="' + o.accent + '" stroke-width="7" stroke-linecap="round"/>';
    g += leg(350, 395, o.dark, o.dark, true);
    g += '<path d="M500 300 C545 255 565 222 595 190 L650 218 C615 255 590 298 540 350 Z" fill="url(#b)"/>';
    g += '<ellipse cx="400" cy="330" rx="152" ry="93" fill="url(#b)"/>';
    g += '<clipPath id="cp"><ellipse cx="400" cy="330" rx="152" ry="93"/></clipPath><ellipse cx="420" cy="385" rx="125" ry="52" fill="url(#bl)" clip-path="url(#cp)"/>';
    if (o.crest === 'plates') for (var p = 0; p < 6; p++) { var px = 300 + p * 34; g += '<ellipse cx="' + px + '" cy="' + (bodyTop(px) + 8) + '" rx="22" ry="15" fill="' + o.accent + '" stroke="' + shade(o.accent, -0.35) + '" stroke-width="3"/>'; }
    else if (o.crest === 'crystal') {
      if (o.glow) for (var q = 0; q < 8; q++) { var qx = 270 + q * 30, qh = 54 - Math.abs(q - 3.5) * 5; g += '<path d="M' + (qx - 14) + ' ' + (bodyTop(qx) + 8) + ' L' + qx + ' ' + (bodyTop(qx) - qh) + ' L' + (qx + 14) + ' ' + (bodyTop(qx) + 8) + ' Z" fill="' + o.accent + '" filter="url(#gl)" opacity=".75"/>'; }
      for (var c = 0; c < 8; c++) { var cx2 = 270 + c * 30, ch = 54 - Math.abs(c - 3.5) * 5; g += '<path d="M' + (cx2 - 13) + ' ' + (bodyTop(cx2) + 10) + ' L' + cx2 + ' ' + (bodyTop(cx2) - ch) + ' L' + (cx2 + 13) + ' ' + (bodyTop(cx2) + 10) + ' Z" fill="' + o.accent + '" stroke="' + shade(o.accent, 0.5) + '" stroke-width="2"/>'; }
    } else if (o.crest !== 'feathers') for (var i = 0; i < 9; i++) { var x = 268 + i * 28, h = 36 - Math.abs(i - 4) * 3.5; g += '<path d="M' + (x - 14) + ' ' + (bodyTop(x) + 8) + ' L' + (x + 2) + ' ' + (bodyTop(x) - h) + ' L' + (x + 16) + ' ' + (bodyTop(x) + 8) + ' Z" fill="' + o.accent + '"/>'; }
    if (o.crest === 'feathers') for (var f = 0; f < 6; f++) g += '<path d="M' + (300 + f * 36) + ' ' + (bodyTop(300 + f * 36) + 12) + ' q-8 -52 ' + (24 + f * 2) + ' -50" fill="none" stroke="' + o.accent + '" stroke-width="9" stroke-linecap="round"/>';
    g += leg(425, 398, o.body, o.dark, false);
    // head
    g += '<path d="M568 182 C598 146 664 146 704 172 C730 190 742 206 730 220 C700 226 662 228 626 222 C600 219 580 206 568 182 Z" fill="url(#b)"/>';
    g += '<path d="M626 222 C662 228 700 226 730 220 C742 206 736 200 728 198 C690 214 654 214 626 208 Z" fill="' + o.belly + '"/>';
    g += '<path d="M640 206 Q690 214 728 208" fill="none" stroke="' + shade(o.dark, -0.4) + '" stroke-width="4" stroke-linecap="round"/>';
    g += '<path d="M690 212 l6 10 l6 -10 M706 210 l6 10 l6 -10" fill="#F3EBD7"/>';
    g += '<circle cx="634" cy="178" r="12" fill="#fff"/><circle cx="638" cy="179" r="6.5" fill="' + o.eye + '"/><circle cx="640" cy="177" r="2" fill="#fff"/>';
    g += '<circle cx="716" cy="190" r="3" fill="' + shade(o.dark, -0.3) + '"/>';
    if (o.crest === 'leaf') g += '<path d="M575 170 C560 120 620 92 676 120 C650 118 620 128 600 160 Z" fill="' + o.accent + '"/><path d="M596 150 C620 126 648 120 668 124" fill="none" stroke="' + shade(o.accent, -0.35) + '" stroke-width="3"/>';
    if (o.horn) g += '<path d="M690 176 L742 130 L718 190 Z" fill="' + o.horn + '"/>';
    g += '<path d="M500 345 q40 6 52 40" fill="none" stroke="' + o.body + '" stroke-width="16" stroke-linecap="round"/><path d="M548 383 l12 10 M552 380 l16 4" stroke="#F3EBD7" stroke-width="4" stroke-linecap="round"/>';
    g += '</g>';
    return wrap(defs, g, o.glow);
  }
  function ankylo() {
    var defs = grad('b', '#6A523A', '#3F3022') + grad('bl', '#8A7352', '#5B4630'), g = '';
    g += '<path d="M190 380 C130 392 90 412 62 430" stroke="#4B3A28" stroke-width="40" stroke-linecap="round" fill="none"/><circle cx="64" cy="432" r="38" fill="#4B3A28"/>';
    for (var k = 0; k < 6; k++) { var a = k * 1.05; g += '<path d="M' + (64 + Math.cos(a) * 30) + ' ' + (432 + Math.sin(a) * 30) + ' L' + (64 + Math.cos(a) * 58) + ' ' + (432 + Math.sin(a) * 58) + ' L' + (64 + Math.cos(a + 0.5) * 30) + ' ' + (432 + Math.sin(a + 0.5) * 30) + ' Z" fill="#E6D3A3"/>'; }
    [[240, 5], [330, 5], [480, 5], [565, 5]].forEach(function (L, i) { g += '<rect x="' + (L[0] - 28) + '" y="430" width="56" height="112" rx="14" fill="' + (i % 2 ? '#3F3022' : '#4B3A28') + '"/><path d="M' + (L[0] - 30) + ' 540 l10 8 M' + (L[0]) + ' 541 l0 8 M' + (L[0] + 24) + ' 540 l-4 8" stroke="#E6D3A3" stroke-width="5" stroke-linecap="round"/>'; });
    g += '<ellipse cx="400" cy="360" rx="250" ry="140" fill="url(#b)"/><ellipse cx="410" cy="430" rx="215" ry="62" fill="url(#bl)" opacity=".7"/>';
    for (var i = 0; i < 9; i++) { var x = 220 + i * 44, y = 360 - 140 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 400) / 250, 2))), h = 62 - Math.abs(i - 4) * 5; g += '<path d="M' + (x - 22) + ' ' + (y + 14) + ' L' + x + ' ' + (y - h) + ' L' + (x + 22) + ' ' + (y + 14) + ' Z" fill="#E6D3A3" stroke="#8C7A52" stroke-width="3"/><path d="M' + x + ' ' + (y - h) + ' L' + (x + 22) + ' ' + (y + 14) + ' L' + (x + 4) + ' ' + (y + 14) + ' Z" fill="#B7A272"/>'; }
    g += '<path d="M590 380 C640 360 710 372 730 420 C735 452 700 478 650 478 C610 476 585 440 590 380 Z" fill="#5B4630"/>';
    g += '<path d="M606 458 Q660 474 722 440" fill="none" stroke="#2E2218" stroke-width="4" stroke-linecap="round"/><circle cx="676" cy="412" r="13" fill="#F6B73C"/><circle cx="680" cy="413" r="6" fill="#1A1408"/>';
    g += '<path d="M610 385 l-26 -46 l50 28 Z M650 372 l-6 -52 l40 44 Z" fill="#E6D3A3"/>';
    g += '<path d="M232 372 l-34 -10 l24 26 Z M570 360 l36 -14 l-20 34 Z" fill="#E6D3A3"/>';
    return wrap(defs, g, false);
  }
  var P = {
    'dino-starter': { body: '#2BA39B', belly: '#8ADBC1', accent: '#F0A93A', dark: '#1B6B66', eye: '#1A1408', crest: 'spines' },
    'enemy-raider': { body: '#B5482F', belly: '#DB8A6E', accent: '#7A2A1C', dark: '#7A2A1C', eye: '#E5534B', crest: 'spines' },
    'enemy-spitter': { body: '#5B3F9A', belly: '#8C6BC9', accent: '#5BD17A', dark: '#392870', eye: '#9BE070', crest: 'leaf' },
    'enemy-skimmer': { body: '#3D74B5', belly: '#79A8DC', accent: '#A8D6F8', dark: '#274F80', eye: '#1A1408', crest: 'spines', scale: 0.88 },
    'evo-swiftclaw': { body: '#1FB5A0', belly: '#86E3D2', accent: '#B6F6EC', dark: '#137265', eye: '#1A1408', crest: 'feathers' },
    'evo-ironhide': { body: '#6B7480', belly: '#A2AAB4', accent: '#C99B49', dark: '#3E454F', eye: '#F6B73C', crest: 'plates', horn: '#E6D3A3', scale: 1.05 },
    'evo-wildspark': { body: '#1F2E63', belly: '#43589F', accent: '#4FD1F5', dark: '#111A3D', eye: '#7DF0FF', crest: 'crystal', glow: true }
  };
  DF.Sprites = {
    names: Object.keys(P).concat(['boss-thornback']),
    svg: function (name) { return name === 'boss-thornback' ? ankylo() : theropod(P[name]); },
    dataUrl: function (name) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(DF.Sprites.svg(name)); }
  };
})(window.DF);
