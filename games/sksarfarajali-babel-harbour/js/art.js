// Inline SVG icons and illustrations, drawn in the concept screens' palette.
const sv = (w, h, vb, body, extra = '') => `<svg width="${w}" height="${h}" viewBox="${vb}" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;
const stroke = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';

export const icon = {
  close: (s = 22) => sv(s, s, '0 0 24 24', `<path d="M18 6 6 18M6 6l12 12" ${stroke} stroke-width="2.4"/>`),
  back: (s = 24) => sv(s, s, '0 0 24 24', `<path d="M19 12H5M12 19l-7-7 7-7" ${stroke} stroke-width="2.4"/>`),
  arrow: (s = 22) => sv(s, s, '0 0 24 24', `<path d="M5 12h14M13 6l6 6-6 6" ${stroke} stroke-width="2.6"/>`),
  chevron: (s = 20) => sv(s, s, '0 0 24 24', `<path d="m9 6 6 6-6 6" ${stroke} stroke-width="2.2"/>`),
  play: (s = 20, c = '#0B2238') => sv(s, s, '0 0 24 24', `<path d="M7 4.5v15l12-7.5z" fill="${c}"/>`),
  flame: (s = 20, c = '#E8735A', st = '#B94E39') => sv(s, s, '0 0 24 24', `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="${c}" stroke="${st}" stroke-width="1.5" stroke-linejoin="round"/>`),
  coin: (s = 20) => sv(s, s, '0 0 24 24', '<circle cx="12" cy="12" r="10" fill="#E9B949" stroke="#A9801E" stroke-width="1.5"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#A9801E" stroke-width="1.5"/>'),
  heart: (s = 20, full = true) => sv(s, s, '0 0 24 24', `<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" ${full ? 'fill="#E8735A"' : 'fill="none" stroke="#7F93AC" stroke-width="2"'}/>`),
  speaker: (s = 24, on = true) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2.2"><path d="M4 9v6h4l5 4V5L8 9z"/>${on ? '<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>' : '<path d="m17 9 5 6M22 9l-5 6"/>'}</g>`),
  gear: (s = 24) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>`),
  check: (s = 14, c = '#2F7A5A', w = 3.2) => sv(s, s, '0 0 24 24', `<path d="M20 6 9 17l-5-5" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`),
  cross: (s = 14, c = '#B94E39') => sv(s, s, '0 0 24 24', `<path d="M18 6 6 18M6 6l12 12" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`),
  lock: (s = 22) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g>`),
  bulb: (s = 22) => sv(s, s, '0 0 24 24', '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" fill="none" stroke="#E9B949" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  share: (s = 24) => sv(s, s, '0 0 24 24', `<path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" ${stroke} stroke-width="2.2"/>`),
  flag: (s = 18) => sv(s, s, '0 0 24 24', `<path d="M5 22V3m0 0h12l-2 4.5L17 12H5" ${stroke} stroke-width="2"/>`),
  gift: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#B94E39" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="13" width="24" height="16" rx="2"/><rect x="3" y="9" width="28" height="6" rx="1.5"/><path d="M17 9v20M17 9c-3-6-9-5-8-2s6 2 8 2zm0 0c3-6 9-5 8-2s-6 2-8 2z"/></g>'),
  speech: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#B94E39" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M5 7h24a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H15l-7 5v-5H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></g>'),
  anchor: (s = 24) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2.2"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></g>`),
  home: (s = 24) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></g>`),
  passport: (s = 24) => sv(s, s, '0 0 24 24', `<g ${stroke} stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6"/></g>`),
  cafe: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#8A5A10" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14h17v7a6 6 0 0 1-6 6h-5a6 6 0 0 1-6-6zM23 16h2.5a3 3 0 0 1 0 6H23M11 5v4M15 5v4M19 5v4"/></g>'),
  fish: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#10304F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c4-7 12-8 18-3l7-5v16l-7-5c-6 5-14 4-18-3z"/><circle cx="9" cy="16" r="1" fill="#10304F"/></g>'),
  lighthouse: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#7A5A10" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 30l2-18h4l2 18zM14 8h6v4h-6zM13 8l4-4 4 4M5 7l6 2M29 7l-6 2"/></g>'),
  book: (s = 34) => sv(s, s, '0 0 34 34', '<g fill="none" stroke="#10304F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6h9a3 3 0 0 1 3 3v19a2 2 0 0 0-2-2H5zM29 6h-9a3 3 0 0 0-3 3v19a2 2 0 0 1 2-2h10z"/></g>'),
};

// the ship that carries the crates
export const ship = (w = 326, h = 64, vb = '0 0 326 64') => sv(w, h, vb, '<path d="M0 6 H326 L292 60 H34 Z" fill="#E8735A"/><rect x="0" y="0" width="326" height="9" rx="3" fill="#F5ECD9"/><circle cx="80" cy="32" r="6" fill="#0B2238"/><circle cx="163" cy="32" r="6" fill="#0B2238"/><circle cx="246" cy="32" r="6" fill="#0B2238"/>', 'class="ship-hull" preserveAspectRatio="none" style="width:100%;height:auto"');
export const sailboat = (w = 70) => sv(w, w * 0.6, '0 0 70 42', '<path d="M34 2 L50 26 H34 Z" fill="#F5ECD9"/><path d="M12 28 H58 L52 38 H18 Z" fill="#E8735A"/><rect x="10" y="26" width="50" height="4" rx="2" fill="#F5ECD9"/>');
export const wave = (fill, h = 24) => `<svg class="wave" viewBox="0 0 390 24" preserveAspectRatio="none" aria-hidden="true" style="height:${h}px"><path d="M0 12 C40 0 80 0 120 12 S200 24 240 12 S320 0 390 12 V24 H0 Z" fill="${fill}"/></svg>`;
export const gull = (w = 40) => sv(w, w * 0.4, '0 0 40 16', '<path d="M2 12c6-8 12-8 18 0 6-8 12-8 18 0" fill="none" stroke="#F5ECD9" stroke-width="2.5" stroke-linecap="round"/>', 'class="gull"');

export const lighthouseLogo = () => sv(120, 132, '0 0 120 132', '<path d="M44 120 L52 36 H68 L76 120 Z" fill="#F5ECD9"/><path d="M47 92 H73 M49 70 H71 M51 50 H69" stroke="#E8735A" stroke-width="8"/><rect x="48" y="20" width="24" height="16" rx="3" fill="#E9B949"/><path d="M44 20 L60 6 L76 20 Z" fill="#E8735A"/><path d="M26 22 L46 28 M94 22 L74 28" stroke="#E9B949" stroke-width="4" stroke-linecap="round"/><rect x="30" y="116" width="60" height="10" rx="4" fill="#9C6B3A"/>');

// buildings, drawn bottom-aligned in a 100x90 box
const B = {
  office: '<path d="M10 40 L50 8 L90 40 Z" fill="#E8735A" stroke="#1B2B3C" stroke-width="3" stroke-linejoin="round"/><rect x="16" y="40" width="68" height="46" fill="#FBF6EA" stroke="#1B2B3C" stroke-width="3"/><rect x="24" y="50" width="16" height="14" fill="#BED5E6" stroke="#1B2B3C" stroke-width="2.5"/><rect x="58" y="50" width="16" height="14" fill="#BED5E6" stroke="#1B2B3C" stroke-width="2.5"/><rect x="42" y="62" width="16" height="24" fill="#10304F"/><path d="M50 8V-6h14l-4 5 4 5z" fill="#E9B949" stroke="#1B2B3C" stroke-width="2"/>',
  cafe: '<path d="M14 22h72l6 14H8z" fill="#1B2B3C"/><path d="M8 36h84v10c-6 6-10 6-14 0-4 6-10 6-14 0-4 6-10 6-14 0-4 6-10 6-14 0-4 6-10 6-14 0-2 3-5 4-8 3z" fill="#E8735A"/><rect x="14" y="44" width="72" height="42" fill="#FBF6EA" stroke="#1B2B3C" stroke-width="3"/><rect x="22" y="54" width="26" height="18" fill="#BED5E6" stroke="#1B2B3C" stroke-width="2.5"/><rect x="56" y="54" width="22" height="32" fill="#10304F"/>',
  fish: '<path d="M10 30h80l-6 16H16z" fill="#E8735A"/><path d="M22 30l-4 16M38 30l-2 16M54 30v16M70 30l2 16M86 30l-2 16" stroke="#FBF6EA" stroke-width="5"/><rect x="14" y="46" width="4" height="40" fill="#9C6B3A"/><rect x="82" y="46" width="4" height="40" fill="#9C6B3A"/><rect x="10" y="64" width="80" height="22" rx="3" fill="#D9A86C" stroke="#9C6B3A" stroke-width="3"/><path d="M26 54c5-6 12-6 16 0-4 6-11 6-16 0zM58 52c5-6 12-6 16 0-4 6-11 6-16 0z" fill="#BED5E6" stroke="#10304F" stroke-width="2"/>',
  lighthouse: '<path d="M36 86 L42 28h16l6 58z" fill="#FBF6EA" stroke="#1B2B3C" stroke-width="3" stroke-linejoin="round"/><path d="M38 66h24M40 46h20" stroke="#E8735A" stroke-width="9"/><rect x="40" y="14" width="20" height="14" rx="2" fill="#E9B949" stroke="#1B2B3C" stroke-width="3"/><path d="M36 14l14-12 14 12z" fill="#E8735A" stroke="#1B2B3C" stroke-width="3" stroke-linejoin="round"/>',
  bookshop: '<rect x="12" y="24" width="76" height="62" fill="#C79558" stroke="#1B2B3C" stroke-width="3"/><path d="M8 24h84l-8-14H16z" fill="#10304F"/><rect x="20" y="40" width="34" height="24" fill="#BED5E6" stroke="#1B2B3C" stroke-width="2.5"/><path d="M26 62V48h5v14zM33 62V44h5v18zM40 62V50h5v12z" fill="#E8735A"/><rect x="62" y="46" width="18" height="40" fill="#10304F"/>',
};
export const building = (id, w = 100, h = 90) => sv(w, h, '0 -8 100 98', B[id] || '', 'style="overflow:visible"');

// large scene used on the building detail screen
export const buildingScene = (id) => sv('100%', '100%', '0 0 390 300', `<rect width="390" height="300" fill="#BED5E6"/><circle cx="320" cy="70" r="22" fill="#E9B949"/><rect y="214" width="390" height="24" fill="#D9A86C"/><rect y="236" width="390" height="5" fill="#9C6B3A"/><rect y="241" width="390" height="59" fill="#10304F"/><g transform="translate(95 40) scale(2)">${B[id] || ''}</g>`, 'preserveAspectRatio="xMidYMax slice"');

// the harbour town backdrop: sky, quay, sea and a sailing boat
export const harbourScene = () => sv('100%', '100%', '0 0 358 300', '<rect width="358" height="300" fill="#BED5E6"/><circle cx="246" cy="52" r="18" fill="#E9B949"/><rect y="192" width="358" height="38" fill="#D9A86C"/><rect y="226" width="358" height="6" fill="#9C6B3A"/><rect y="232" width="358" height="68" fill="#10304F"/><path d="M0 266c22-8 40-8 62 0M96 288c20-8 42-8 62 0M210 260c26-8 46-6 68 2" fill="none" stroke="#1C4A73" stroke-width="3" stroke-linecap="round" class="swell"/>', 'preserveAspectRatio="none"');

export const stamp = (code, word, earned, size = 88) => earned
  ? sv(size, size, '0 0 88 88', `<g transform="rotate(-12 44 44)"><circle cx="44" cy="44" r="41" fill="#FBEAE4" stroke="#B94E39" stroke-width="2.5"/><circle cx="44" cy="44" r="36" fill="none" stroke="#B94E39" stroke-width="1.2"/><text x="44" y="46" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="700" font-size="28" fill="#B94E39">${code}</text><text x="44" y="62" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="11" letter-spacing="1.5" fill="#B94E39" transform="rotate(-8 44 58)">${word}</text></g>`, 'class="stamp earned"')
  : sv(size, size, '0 0 88 88', `<circle cx="44" cy="44" r="40" fill="none" stroke="#B9A988" stroke-width="3" stroke-dasharray="6 6"/><text x="44" y="53" text-anchor="middle" font-family="Fredoka,Nunito,sans-serif" font-weight="600" font-size="26" fill="#5A6472">${code}</text>`);

export const leaveShip = () => sv(100, 60, '0 0 100 60', '<rect x="30" y="2" width="18" height="16" rx="3" fill="#D9A86C" stroke="#9C6B3A" stroke-width="2.5"/><rect x="52" y="2" width="18" height="16" rx="3" fill="#D9A86C" stroke="#9C6B3A" stroke-width="2.5"/><path d="M18 22h64l-8 22H26z" fill="#E8735A"/><rect x="16" y="18" width="68" height="5" rx="2" fill="#10304F"/><path d="M4 52c10-8 18-8 28 0s18 8 28 0 18-8 28 0" fill="none" stroke="#1C4A73" stroke-width="3" stroke-linecap="round"/>');

export const sparkle = (s = 28, c = '#E9B949') => sv(s, s, '0 0 24 24', `<path d="M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11z" fill="${c}"/>`, 'class="sparkle"');
