// The game's emblem (no image files, no words: the picture says what the game is). Used by the intro (animated),
// the app icons and the favicon (static: tools/make_icons.mjs renders emblemSvg(false)).
// A polished-steel fighter climbs out of a blazing sunset over the curve of the earth, twin afterburners lit;
// a missile hunts it on a sweeping smoke trail; the jet fans its flares out like wings; red lock-on brackets
// close round it; a bevelled metal rim holds the badge.
// Intro: the badge pops, the rim draws, the smoke trail draws with the missile riding it, the jet climbs in,
// flares bloom, the brackets snap; then it idles (burner flicker, brackets blink, glow).

const TRAIL = 'M36 456 C 118 452, 112 372, 170 346 S 222 304, 236 280';

export function emblemSvg(animated: boolean): string {
  const ride = animated
    ? `<animateMotion dur="2s" begin="0.4s" fill="freeze" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.35 0 0.6 1" path="${TRAIL}"/>`
    : '';
  const missilePos = animated ? '' : ' transform="translate(236 280) rotate(-60) scale(1.5)"';
  const cls = (c: string): string => (animated ? ` class="${c}"` : '');
  return /* svg */ `
<svg${animated ? ' class="logo"' : ''} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fighter">
  <defs>
    <radialGradient id="lg-sky" cx="56%" cy="74%" r="78%">
      <stop offset="0%" stop-color="#fff3c2"/>
      <stop offset="12%" stop-color="#ffc35a"/>
      <stop offset="30%" stop-color="#ff7a2e"/>
      <stop offset="48%" stop-color="#c72f55"/>
      <stop offset="68%" stop-color="#4a1d6e"/>
      <stop offset="86%" stop-color="#16154a"/>
      <stop offset="100%" stop-color="#070a26"/>
    </radialGradient>
    <linearGradient id="lg-earth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c1430"/>
      <stop offset="100%" stop-color="#05040c"/>
    </linearGradient>
    <linearGradient id="lg-rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#b9c6d4"/>
      <stop offset="48%" stop-color="#4a5666"/>
      <stop offset="70%" stop-color="#d7e1ec"/>
      <stop offset="100%" stop-color="#2b3340"/>
    </linearGradient>
    <linearGradient id="lg-skin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5b6b7c"/>
      <stop offset="30%" stop-color="#e9f1f8"/>
      <stop offset="52%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#9fb0c2"/>
      <stop offset="100%" stop-color="#3d4a58"/>
    </linearGradient>
    <linearGradient id="lg-canopy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe9a8"/>
      <stop offset="45%" stop-color="#d79a2b"/>
      <stop offset="100%" stop-color="#5a3608"/>
    </linearGradient>
    <linearGradient id="lg-plume" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="18%" stop-color="#bfe8ff"/>
      <stop offset="40%" stop-color="#ffb43c"/>
      <stop offset="75%" stop-color="#ff4a1c" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ff2a10" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lg-smoke" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="45%" stop-color="#f3ecf2" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="lg-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbe6"/>
      <stop offset="40%" stop-color="#ffe08a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ff9a3c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lg-gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="lg-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lg-hot" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lg-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#12051f" flood-opacity="0.65"/>
    </filter>
    <clipPath id="lg-clip"><circle cx="256" cy="256" r="224"/></clipPath>
  </defs>

  <!-- the badge: sunset sky, the sun, the curve of the earth with a burning rim -->
  <g${cls('lg-badge')}>
    <circle cx="256" cy="256" r="232" fill="#0a0d1c"/>
    <g clip-path="url(#lg-clip)">
      <rect x="0" y="0" width="512" height="512" fill="url(#lg-sky)"/>
      <g${cls('lg-stars')} fill="#ffffff">
        <circle cx="120" cy="96" r="1.6"/><circle cx="176" cy="62" r="1.2"/><circle cx="246" cy="52" r="1"/>
        <circle cx="96" cy="160" r="1.2"/><circle cx="210" cy="118" r="0.9"/><circle cx="300" cy="70" r="1.1"/>
      </g>
      <circle cx="300" cy="392" r="92" fill="url(#lg-sun)"/>
      <g${cls('lg-earth')}>
        <path d="M-10 410 Q 256 338 522 410 L 522 522 L -10 522 Z" fill="url(#lg-earth)"/>
        <path d="M-10 410 Q 256 338 522 410" fill="none" stroke="#ffb35a" stroke-width="3" filter="url(#lg-glow)"/>
        <path d="M60 452 Q 256 404 452 452" fill="none" stroke="#ff7a3c" stroke-opacity="0.25" stroke-width="2"/>
      </g>
      <!-- the missile's smoke trail sweeping up from the ground -->
      <path${cls('lg-trail-glow')} d="${TRAIL}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="26" stroke-linecap="round" pathLength="1"/>
      <path${cls('lg-trail')} d="${TRAIL}" fill="none" stroke="url(#lg-smoke)" stroke-width="9" stroke-linecap="round" pathLength="1"/>
      <!-- speed streaks behind the jet -->
      <g stroke="#ffffff" stroke-linecap="round" opacity="0.55">
        <path d="M196 214 L150 248" stroke-width="2"/><path d="M240 260 L198 292" stroke-width="1.6"/><path d="M226 178 L186 206" stroke-width="1.4"/>
      </g>
      <rect x="0" y="0" width="512" height="230" fill="url(#lg-gloss)"/>
    </g>
    <!-- bevelled metal rim + a thin hot inner line -->
    <circle cx="256" cy="256" r="232" fill="none" stroke="url(#lg-rim)" stroke-width="16"${cls('lg-ring')}/>
    <circle cx="256" cy="256" r="223" fill="none" stroke="#ffb35a" stroke-opacity="0.85" stroke-width="2"/>
    <circle cx="256" cy="256" r="241" fill="none" stroke="#0a0d1c" stroke-width="3"/>
    <g fill="#ffd27a">
      <circle cx="256" cy="24" r="4"/><circle cx="488" cy="256" r="4"/><circle cx="256" cy="488" r="4"/><circle cx="24" cy="256" r="4"/>
    </g>
  </g>

  <!-- the missile rides its trail -->
  <g${cls('lg-missile')}${missilePos} filter="url(#lg-glow)">
    <g${animated ? ' transform="scale(1.5)"' : ''}>
    <path d="M-18 -4 L12 -4 L22 0 L12 4 L-18 4 Z" fill="#f4f4ee"/>
    <path d="M12 -4 L22 0 L12 4 Z" fill="#e0262a"/>
    <path d="M-18 -4 L-25 -11 L-12 -4 Z M-18 4 L-25 11 L-12 4 Z" fill="#c8c8b8"/>
    <circle cx="-25" cy="0" r="6.5" fill="#ffc050" filter="url(#lg-hot)"/>
    </g>
    ${ride}
  </g>

  <!-- flares fanning out behind the jet like wings -->
  <g filter="url(#lg-hot)">
    <g${cls('lg-wing lg-wing-l')} fill="#fff4cc">
      <circle cx="282" cy="252" r="6"/><circle cx="262" cy="262" r="5.2"/><circle cx="240" cy="270" r="4.6"/>
      <circle cx="218" cy="282" r="4"/><circle cx="198" cy="298" r="3.4"/><circle cx="182" cy="318" r="2.8"/>
    </g>
    <g${cls('lg-wing lg-wing-r')} fill="#fff4cc">
      <circle cx="300" cy="262" r="6"/><circle cx="314" cy="282" r="5.2"/><circle cx="332" cy="298" r="4.6"/>
      <circle cx="352" cy="312" r="4"/><circle cx="370" cy="330" r="3.4"/><circle cx="384" cy="350" r="2.8"/>
    </g>
  </g>

  <!-- the jet: polished steel, climbing hard, twin burners lit -->
  <g${cls('lg-jet')}>
    <g transform="translate(350 172) rotate(40) scale(1.18)" filter="url(#lg-shadow)">
      <g${cls('lg-plume')} filter="url(#lg-hot)">
        <path d="M-12 60 L-4 60 L-8 150 Z" fill="url(#lg-plume)"/>
        <path d="M4 60 L12 60 L8 150 Z" fill="url(#lg-plume)"/>
      </g>
      <path d="M0 -92 L7 -66 L10 -34 L13 -8 L66 30 L68 42 L13 30 L11 46 L32 62 L32 71 L8 66 L0 72 L-8 66 L-32 71 L-32 62 L-11 46 L-13 30 L-68 42 L-66 30 L-13 -8 L-10 -34 L-7 -66 Z"
            fill="url(#lg-skin)" stroke="#1d2531" stroke-width="1.6"/>
      <path d="M-13 -8 L-26 -20 L-12 -32 Z M13 -8 L26 -20 L12 -32 Z" fill="#8293a6"/>
      <path d="M0 -60 L5 -38 L4 -22 L0 -16 L-4 -22 L-5 -38 Z" fill="url(#lg-canopy)" stroke="#2a1a05" stroke-width="0.8"/>
      <path d="M0 -16 L0 60" stroke="#55657a" stroke-width="1.2"/>
      <path d="M-13 30 L-46 38 M13 30 L46 38" stroke="#6b7c90" stroke-width="1"/>
      <path d="M-68 42 L-66 30 L-56 36 Z M68 42 L66 30 L56 36 Z" fill="#e0262a"/>
      <path d="M-32 71 L-32 62 L-24 64 Z M32 71 L32 62 L24 64 Z" fill="#e0262a"/>
      <circle cx="-8" cy="62" r="4" fill="#ffd27a" filter="url(#lg-hot)"/>
      <circle cx="8" cy="62" r="4" fill="#ffd27a" filter="url(#lg-hot)"/>
    </g>
  </g>

  <!-- lock-on brackets closing round the jet -->
  <g${cls('lg-lock')} stroke="#ff2d2d" stroke-width="5.5" fill="none" stroke-linecap="round" filter="url(#lg-glow)">
    <path d="M272 82 H250 V104"/><path d="M438 82 H460 V104"/>
    <path d="M272 268 H250 V246"/><path d="M438 268 H460 V246"/>
  </g>
</svg>`;
}

export const LOGO_SVG = emblemSvg(true);

/** Small engage / help / close icons (no words on the intro). The engage icon is a HUD reticle: centre cross,
 * flight-path marker, pitch-ladder rungs either side and a ring that pulses outward (tap / click = scramble). */
export const PLAY_ICON = `<svg viewBox="0 0 160 96" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
  <circle cx="80" cy="48" r="26" stroke-width="2.5" opacity="0.9"/>
  <circle cx="80" cy="48" r="26" stroke-width="2">
    <animate attributeName="r" values="26;44" dur="1.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.8;0" dur="1.6s" repeatCount="indefinite"/>
  </circle>
  <path d="M80 14 V26 M80 70 V82 M46 48 H58 M102 48 H114" stroke-width="3"/>
  <circle cx="80" cy="48" r="5" stroke-width="2.5"/>
  <path d="M68 48 H75 M85 48 H92 M80 43 V39" stroke-width="2.5"/>
  <path d="M8 30 H34 V35 M152 30 H126 V35 M8 66 H34 V61 M152 66 H126 V61" stroke-width="2.5" opacity="0.85"/>
  <path d="M16 48 H30 M144 48 H130" stroke-width="2" stroke-dasharray="4 4" opacity="0.7"/>
  <path d="M74 22 L80 18 L86 22" stroke-width="2.5"/>
</svg>`;
export const HELP_ICON = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 25 a8 8 0 1 1 12 7 c-3 2 -4 3 -4 7" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="2.8" fill="currentColor"/></svg>`;
export const CLOSE_ICON = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 20 L44 44 M44 20 L20 44" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>`;
