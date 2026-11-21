// emblem.js - the game's emblem, no words (user, 01-Nov-2026: "icon / logo without any write up ... represents
// the theme"). Nature first: a seedling rises from a living sphere under the sun; below the soil its roots join a
// glowing fungal network that links tiny microbes; a golden energy stream circles from the sun through all
// life (energy flows); a ladybird on a leaf and a mushroom at the soil edge; the rim is a living cell membrane.
// Used on the path screen (animated) and for the app icons (static: tools/make_icons.mjs).
// 08-Nov-2026 (user: "clear icon / logo to identify clear mission"): five badges on the rim show the learning path,
// still with no words: atom = Physics, flask = Chemistry, DNA = Biology, leaf = Botany, and at the bottom the goal,
// a stethoscope = NEET / MBBS. badges = false keeps the plain emblem for tiny sizes (browser tab icon).
const BADGE_POS = { phy: [67, 147], chem: [445, 147], bio: [67, 365], bot: [445, 365], med: [256, 472] };
const badge = (k, ring, art) => {
  const [x, y] = BADGE_POS[k];
  return `<g transform="translate(${x} ${y})"><circle r="38" fill="#06181c"/><circle r="33" fill="#0d3236" stroke="${ring}" stroke-width="5"/>${art}</g>`;
};
function badges() {
  return [
    badge('phy', '#7fd7ff', `<g fill="none" stroke="#7fd7ff" stroke-width="3"><ellipse rx="23" ry="8"/><ellipse rx="23" ry="8" transform="rotate(60)"/><ellipse rx="23" ry="8" transform="rotate(120)"/></g><circle r="5" fill="#fff3b0"/>`),
    badge('chem', '#ff9f6a', `<path d="M-7 -21 H7 M-5 -21 V-8 L-18 14 Q-20 20 -13 20 H13 Q20 20 18 14 L5 -8 V-21" fill="none" stroke="#ffd9c2" stroke-width="3" stroke-linejoin="round"/><path d="M-11 4 H11 L16 14 Q17 17 13 17 H-13 Q-17 17 -16 14 Z" fill="#ff9f6a"/><circle cx="-3" cy="-1" r="2.4" fill="#ffd9c2"/><circle cx="4" cy="-6" r="1.8" fill="#ffd9c2"/>`),
    badge('bio', '#e46b86', `<g fill="none" stroke-width="3.4" stroke-linecap="round"><path d="M-10 -22 C 14 -12, 14 -2, -10 8 C -30 16, 8 20, 10 22" stroke="#ff9fb4"/><path d="M10 -22 C -14 -12, -14 -2, 10 8 C 30 16, -8 20, -10 22" stroke="#9b7be0"/></g><g stroke="#ffe0e8" stroke-width="2"><path d="M-6 -16 H6"/><path d="M-8 -3 H8"/><path d="M-6 13 H6"/></g>`),
    badge('bot', '#84c96b', `<path d="M-16 16 C -18 -8, 2 -22, 20 -20 C 20 2, 4 18, -16 16 Z" fill="#8fe06a"/><path d="M-16 16 C -4 4, 6 -6, 16 -16" fill="none" stroke="#2f6f2a" stroke-width="2.4"/><path d="M-4 4 L-10 -4 M4 -4 L2 -12 M2 -4 L10 -4" stroke="#2f6f2a" stroke-width="1.8"/>`),
    badge('med', '#ffd36a', `<g fill="none" stroke="#e8f4f0" stroke-width="3.2" stroke-linecap="round"><path d="M-13 -22 V-10 Q -13 2 -1 2 Q 11 2 11 -10 V-22"/><path d="M-1 2 V10 Q -1 20 9 20 Q 17 20 17 12"/></g><circle cx="-13" cy="-23" r="2.6" fill="#e8f4f0"/><circle cx="11" cy="-23" r="2.6" fill="#e8f4f0"/><circle cx="17" cy="7" r="7" fill="#ffd36a" stroke="#e8f4f0" stroke-width="2.4"/>`),
  ].join('');
}

export function ecosEmblem(animated = true, withBadges = true) {
  const a = (s) => (animated ? s : '');
  return `
<svg class="ecos-emblem" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ecos-Synthetica">
  <defs>
    <radialGradient id="ee-bg" cx="50%" cy="22%" r="85%">
      <stop offset="0%" stop-color="#2f7a6a"/>
      <stop offset="45%" stop-color="#0f3b3e"/>
      <stop offset="100%" stop-color="#06181c"/>
    </radialGradient>
    <radialGradient id="ee-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbe2"/>
      <stop offset="35%" stop-color="#ffd36a"/>
      <stop offset="100%" stop-color="#ffb02e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ee-globe" cx="40%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#8fd36a"/>
      <stop offset="45%" stop-color="#3f8a3a"/>
      <stop offset="100%" stop-color="#173f22"/>
    </radialGradient>
    <linearGradient id="ee-soil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a3e26"/>
      <stop offset="100%" stop-color="#22160c"/>
    </linearGradient>
    <linearGradient id="ee-leaf" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#3f9a3a"/>
      <stop offset="60%" stop-color="#8fe06a"/>
      <stop offset="100%" stop-color="#d8ff9a"/>
    </linearGradient>
    <linearGradient id="ee-flow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff3b0"/>
      <stop offset="50%" stop-color="#ffd36a"/>
      <stop offset="100%" stop-color="#ff9f3a"/>
    </linearGradient>
    <filter id="ee-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ee-soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <clipPath id="ee-clip"><circle cx="256" cy="256" r="214"/></clipPath>
    <clipPath id="ee-under"><path d="M0 330 Q 256 300 512 330 L 512 512 L 0 512 Z"/></clipPath>
  </defs>

  <!-- background: deep water-green light falling from above -->
  <circle cx="256" cy="256" r="232" fill="#06181c"/>
  <g clip-path="url(#ee-clip)">
    <rect width="512" height="512" fill="url(#ee-bg)"/>
    <g opacity="0.22" fill="#d8ffe8">
      <path d="M150 40 L190 40 L260 330 L230 330 Z"/><path d="M290 40 L320 40 L300 330 L280 330 Z"/><path d="M360 40 L380 40 L320 330 L310 330 Z"/>
    </g>
    <!-- sun -->
    <circle cx="256" cy="104" r="70" fill="url(#ee-sun)" filter="url(#ee-soft)"/>
    <circle cx="256" cy="104" r="26" fill="#fff6cc"${a(' class="ee-sun"')}/>

    <!-- the living sphere, half in the soil -->
    <circle cx="256" cy="330" r="120" fill="url(#ee-globe)"/>
    <path d="M150 300 Q 200 280 230 300 T 300 296 T 360 306" fill="none" stroke="#b9f08a" stroke-opacity="0.35" stroke-width="3"/>
    <path d="M168 340 Q 230 322 270 340 T 346 336" fill="none" stroke="#b9f08a" stroke-opacity="0.25" stroke-width="3"/>
    <!-- soil and the underground network -->
    <g clip-path="url(#ee-under)">
      <rect y="300" width="512" height="212" fill="url(#ee-soil)" opacity="0.92"/>
      <g fill="none" stroke="#c39bff" stroke-linecap="round" filter="url(#ee-glow)"${a(' class="ee-net"')}>
        <path d="M256 318 C 250 360, 220 380, 190 420 S 140 450, 110 470" stroke-width="3"/>
        <path d="M256 318 C 262 360, 296 384, 322 418 S 372 446, 404 462" stroke-width="3"/>
        <path d="M256 318 C 256 370, 252 410, 258 470" stroke-width="2.6"/>
        <path d="M222 384 C 200 392, 176 394, 150 392" stroke-width="2"/>
        <path d="M300 396 C 320 404, 346 404, 372 398" stroke-width="2"/>
        <path d="M190 420 C 214 440, 240 446, 258 446 S 300 440, 322 418" stroke-width="1.6" stroke-opacity="0.8"/>
      </g>
      <g fill="#e8d4ff" filter="url(#ee-glow)"${a(' class="ee-nodes"')}>
        <circle cx="190" cy="420" r="5"/><circle cx="322" cy="418" r="5"/><circle cx="258" cy="446" r="5"/>
        <circle cx="150" cy="392" r="4"/><circle cx="372" cy="398" r="4"/><circle cx="110" cy="470" r="3.5"/><circle cx="404" cy="462" r="3.5"/>
      </g>
      <!-- microbes: a rod bacterium and a spore -->
      <g transform="translate(206 470) rotate(-20)"><rect x="-14" y="-5" width="28" height="10" rx="5" fill="#5fc4d0"/><path d="M14 0 q 8 -4 14 2" fill="none" stroke="#5fc4d0" stroke-width="1.6"/></g>
      <circle cx="318" cy="470" r="7" fill="#e46b86"/><circle cx="318" cy="470" r="3" fill="#ffd0dc"/>
    </g>
    <path d="M0 330 Q 256 300 512 330" fill="none" stroke="#8a6a3c" stroke-width="3"/>

    <!-- mushroom at the soil edge -->
    <g transform="translate(168 312)">
      <rect x="-4" y="-14" width="8" height="16" rx="3" fill="#f2e6d0"/>
      <path d="M-18 -12 Q 0 -34 18 -12 Z" fill="#d9483b"/>
      <circle cx="-7" cy="-20" r="2.4" fill="#fff"/><circle cx="5" cy="-24" r="2" fill="#fff"/><circle cx="10" cy="-16" r="1.6" fill="#fff"/>
    </g>

    <!-- the seedling -->
    <g${a(' class="ee-sprout"')}>
      <path d="M256 318 C 254 280, 258 250, 256 214" fill="none" stroke="#5fae3e" stroke-width="7" stroke-linecap="round"/>
      <path d="M256 236 C 222 238, 186 218, 172 182 C 214 176, 246 198, 256 236 Z" fill="url(#ee-leaf)"/>
      <path d="M256 236 C 228 222, 204 206, 182 188" fill="none" stroke="#2f6f2a" stroke-width="2"/>
      <path d="M256 222 C 292 226, 332 204, 346 164 C 300 158, 264 182, 256 222 Z" fill="url(#ee-leaf)"/>
      <path d="M256 222 C 286 206, 314 188, 336 170" fill="none" stroke="#2f6f2a" stroke-width="2"/>
      <!-- ladybird on the right leaf -->
      <g transform="translate(318 186) rotate(-30)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#e0262a"/>
        <path d="M0 -8 V8" stroke="#1a0d0d" stroke-width="1.6"/>
        <circle cx="-4" cy="-2" r="1.8" fill="#1a0d0d"/><circle cx="4" cy="2" r="1.8" fill="#1a0d0d"/><circle cx="-3" cy="4" r="1.4" fill="#1a0d0d"/>
        <circle cx="10" cy="0" r="4" fill="#1a0d0d"/>
      </g>
      <circle cx="256" cy="212" r="5" fill="#d8ff9a"/>
    </g>

    <!-- energy flows: a golden stream from the sun round through all life -->
    <path d="M282 112 C 400 130, 432 270, 360 360 C 300 432, 190 430, 140 360 C 96 296, 120 196, 214 132"
          fill="none" stroke="url(#ee-flow)" stroke-width="7" stroke-linecap="round" filter="url(#ee-glow)" stroke-dasharray="26 14"${a(' class="ee-flow"')}/>
    <path d="M214 132 L 230 112 L 236 140 Z" fill="#ffd36a" filter="url(#ee-glow)"/>
    <g fill="#ffe9a0" filter="url(#ee-glow)">
      <circle cx="420" cy="250" r="4"/><circle cx="110" cy="290" r="3.5"/><circle cx="300" cy="420" r="3"/>
    </g>
  </g>

  <!-- rim: a living cell membrane (two layers with heads) -->
  <circle cx="256" cy="256" r="224" fill="none" stroke="#84c96b" stroke-width="5"/>
  <circle cx="256" cy="256" r="236" fill="none" stroke="#9b7be0" stroke-width="5"/>
  <circle cx="256" cy="256" r="230" fill="none" stroke="#5fc4d0" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"${a(' class="ee-membrane"')}/>
  <circle cx="256" cy="256" r="243" fill="none" stroke="#06181c" stroke-width="3"/>
  ${withBadges ? badges() : ''}
</svg>`;
}
