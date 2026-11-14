#!/usr/bin/env python3
"""Crystal Quest - generates characters, bosses, world backgrounds, UI icons and UI kit pieces.
Run: python3 gen_art.py <assets_root>   (original geometric artwork only)"""
import math, os, random, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "assets"

def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
def mix(a, b, t):
    A, B = hx(a), hx(b)
    return '#%02x%02x%02x' % tuple(round(A[i] + (B[i]-A[i])*t) for i in range(3))
def save(sub, name, svg):
    d = os.path.join(ROOT, sub); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, name + '.svg'), 'w', encoding='utf-8').write(svg)
def svg(w, h, body, defs=''):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"><defs>%s</defs>%s</svg>\n'
            % (w, h, w, h, defs, body))
def lg(i, stops, x1=0, y1=0, x2=0, y2=1):
    return '<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (
        i, x1, y1, x2, y2, ''.join('<stop offset="%s" stop-color="%s"/>' % s for s in stops))
def rg(i, stops, cx=.5, cy=.5, r=.5):
    return '<radialGradient id="%s" cx="%s" cy="%s" r="%s">%s</radialGradient>' % (
        i, cx, cy, r, ''.join('<stop offset="%s" stop-color="%s" stop-opacity="%s"/>' % (s + ((1,) if len(s) == 2 else ())) for s in stops))
BLUR = '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>'
OL = 'stroke="#1b1033" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"'
def eyes(cx, cy, gap, r=9, col='#1b1033'):
    return ''.join('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s"/><circle cx="%d" cy="%d" r="%d" fill="#fff"/>' % (
        cx+s*gap, cy, r, r+3, col, cx+s*gap-3, cy-4, 3) for s in (-1, 1))
def sparkle(x, y, s=1, c='#fff'):
    return '<path d="M%.0f %.0fl%.1f %.1f %.1f %.1f-%.1f %.1f-%.1f %.1f-%.1f-%.1f-%.1f-%.1f %.1f-%.1fz" fill="%s"/>' % (
        x, y-10*s, 2.5*s, 7.5*s, 7.5*s, 2.5*s, 7.5*s, 2.5*s, 2.5*s, 7.5*s, 2.5*s, 7.5*s, 7.5*s, 2.5*s, 7.5*s, 2.5*s, c)

# =============================================================== CHARACTERS 400x520
SH = '<ellipse cx="200" cy="496" rx="110" ry="14" fill="#000" opacity=".25"/>'
def char(name, i, body, defs=''):
    save('characters', 'character_%02d_%s' % (i, name), svg(400, 520, SH + body, defs + BLUR))

# 1 Eldrin - ancient wizard
char('eldrin', 1,
     '<path d="M118 488 L146 250 Q200 220 254 250 L282 488Z" fill="url(#rb)" %s/>' % OL +
     ''.join(sparkle(x, y, .8, '#FFE9A0') for x, y in ((170, 330), (232, 380), (196, 440), (250, 300))) +
     '<rect x="150" y="372" width="100" height="10" fill="#FFD84A" opacity=".9"/>'
     '<path d="M146 270 Q96 330 104 392" fill="none" stroke="#2b3fb0" stroke-width="40" stroke-linecap="round"/>'
     '<circle cx="104" cy="396" r="18" fill="#F2C9A0" %s/>' % OL +
     '<rect x="318" y="150" width="9" height="340" rx="4" fill="#8a5a2b" %s/>' % OL +
     '<polygon points="322,90 346,128 322,166 298,128" fill="#7DF3EC" %s/>' % OL +
     '<circle cx="322" cy="128" r="46" fill="#7DF3EC" opacity=".4" filter="url(#bl)"/>'
     '<path d="M254 270 Q316 280 318 388" fill="none" stroke="#2b3fb0" stroke-width="40" stroke-linecap="round"/>'
     '<circle cx="320" cy="392" r="18" fill="#F2C9A0" %s/>' % OL +
     '<circle cx="200" cy="196" r="62" fill="#F2C9A0" %s/>' % OL +
     eyes(200, 196, 24, 7, '#1b1033') +
     '<path d="M176 186 q8 -10 18 -2 M206 184 q10 -8 18 2" stroke="#e8e8f2" stroke-width="7" fill="none" stroke-linecap="round"/>'
     '<path d="M144 214 Q150 330 200 350 Q250 330 256 214 Q230 262 200 258 Q170 262 144 214Z" fill="#F4F4FA" %s/>' % OL +
     '<path d="M184 232 Q200 242 216 232" stroke="#a05a4a" stroke-width="5" fill="none" stroke-linecap="round"/>'
     '<ellipse cx="200" cy="146" rx="102" ry="16" fill="#2b3fb0" %s/>' % OL +
     '<path d="M120 146 Q150 40 232 -6 Q214 70 280 146Z" fill="url(#rb)" %s/>' % OL +
     '<rect x="130" y="130" width="140" height="14" fill="#FFD84A"/>' + sparkle(210, 74, 1.4, '#FFE9A0'),
     lg('rb', [(0, '#5a7bff'), (1, '#2234a8')]))

# 2 Luma - magical fairy
char('luma', 2,
     '<circle cx="200" cy="260" r="150" fill="url(#aura)"/>'
     '<path d="M190 280 C100 180 40 220 70 320 C90 380 170 330 190 290Z" fill="#BFF3FF" opacity=".75" %s/>' % OL +
     '<path d="M210 280 C300 180 360 220 330 320 C310 380 230 330 210 290Z" fill="#BFF3FF" opacity=".75" %s/>' % OL +
     '<path d="M192 300 C130 330 110 400 150 410 C180 410 196 340 196 310Z" fill="#E6C2FF" opacity=".7" %s/>' % OL +
     '<path d="M208 300 C270 330 290 400 250 410 C220 410 204 340 204 310Z" fill="#E6C2FF" opacity=".7" %s/>' % OL +
     '<path d="M168 300 Q200 280 232 300 L246 392 Q200 420 154 392Z" fill="#FF7AC8" %s/>' % OL +
     '<path d="M170 400 L150 456 M230 400 L250 456" stroke="#F2C9A0" stroke-width="16" stroke-linecap="round"/>'
     '<path d="M120 190 Q90 290 150 330 Q130 250 150 200Z M280 190 Q310 290 250 330 Q270 250 250 200Z" fill="#FF4FD8" %s/>' % OL +
     '<circle cx="200" cy="200" r="76" fill="#F2C9A0" %s/>' % OL +
     '<path d="M122 190 Q130 110 200 108 Q272 110 278 190 Q240 150 200 164 Q160 150 122 190Z" fill="#FF4FD8" %s/>' % OL +
     eyes(200, 206, 28, 9, '#4a1a66') +
     '<ellipse cx="160" cy="232" rx="14" ry="8" fill="#FF8FB8" opacity=".7"/><ellipse cx="240" cy="232" rx="14" ry="8" fill="#FF8FB8" opacity=".7"/>'
     '<path d="M186 238 Q200 252 214 238" stroke="#a03a5a" stroke-width="5" fill="none" stroke-linecap="round"/>'
     '<polygon points="128,150 118,96 160,126" fill="#F2C9A0" %s/><polygon points="272,150 282,96 240,126" fill="#F2C9A0" %s/>' % (OL, OL) +
     '<path d="M300 380 L360 300" stroke="#FFD84A" stroke-width="8" stroke-linecap="round"/>'
     '<path d="M360 262 l10 22 24 4 -18 16 5 24 -21 -12 -21 12 5 -24 -18 -16 24 -4z" fill="#FFE9A0" %s/>' % OL +
     sparkle(100, 130, 1.3) + sparkle(320, 120, 1) + sparkle(70, 360, .9),
     rg('aura', [(0, '#FFB8F0', .7), (1, '#FFB8F0', 0)]))

# 3 Arkon - crystal guardian
char('arkon', 3,
     '<path d="M150 480 L146 380 L254 380 L250 480Z" fill="#1d5f86" %s/>' % OL +
     '<rect x="136" y="462" width="56" height="30" rx="10" fill="#2f8fc4" %s/><rect x="208" y="462" width="56" height="30" rx="10" fill="#2f8fc4" %s/>' % (OL, OL) +
     '<path d="M120 230 Q200 200 280 230 L270 390 L130 390Z" fill="url(#ar)" %s/>' % OL +
     '<polygon points="200,262 226,296 200,336 174,296" fill="#FFC21A" %s/>' % OL + sparkle(194, 288, .8) +
     '<rect x="130" y="372" width="140" height="22" rx="8" fill="#FFD84A" %s/>' % OL +
     '<circle cx="124" cy="244" r="34" fill="#3ec1c0" %s/><circle cx="276" cy="244" r="34" fill="#3ec1c0" %s/>' % (OL, OL) +
     '<path d="M100 270 L84 380" stroke="#2f8fc4" stroke-width="36" stroke-linecap="round"/>'
     '<path d="M300 270 L320 350" stroke="#2f8fc4" stroke-width="36" stroke-linecap="round"/>'
     '<path d="M32 330 Q70 300 108 330 L104 410 Q70 440 36 410Z" fill="#E5324B" %s/>' % OL +
     '<polygon points="70,336 90,364 70,396 50,364" fill="#fff" opacity=".9" %s/>' % OL +
     '<rect x="316" y="180" width="12" height="190" rx="5" fill="#E8F4FF" %s/><rect x="296" y="360" width="52" height="14" rx="6" fill="#FFD84A" %s/>' % (OL, OL) +
     '<circle cx="200" cy="170" r="66" fill="#3ec1c0" %s/>' % OL +
     '<path d="M146 176 Q200 120 254 176 L254 194 Q200 176 146 194Z" fill="#2f8fc4" %s/>' % OL +
     '<ellipse cx="200" cy="190" rx="44" ry="38" fill="#F2C9A0" %s/>' % OL + eyes(200, 190, 18, 6, '#1b1033') +
     '<path d="M188 212 Q200 222 212 212" stroke="#a05a4a" stroke-width="4" fill="none" stroke-linecap="round"/>'
     '<path d="M200 100 L214 60 L200 40 L186 60Z" fill="#E5324B" %s/>' % OL,
     lg('ar', [(0, '#7de0f0'), (1, '#2f8fc4')]))

# 4 Nyra - forest guardian
char('nyra', 4,
     '<path d="M110 490 L150 250 Q200 224 250 250 L290 490Z" fill="url(#fg)" %s/>' % OL +
     ''.join('<path d="M%d %d q16 -20 32 0 q-16 20 -32 0z" fill="#9BE86B" %s/>' % (x, y, OL.replace('5"', '3"', 1)) for x, y in ((140, 420), (210, 440), (176, 360), (230, 380))) +
     '<path d="M150 262 Q104 330 120 396" fill="none" stroke="#2f8a4a" stroke-width="36" stroke-linecap="round"/>'
     '<path d="M250 262 Q300 330 280 396" fill="none" stroke="#2f8a4a" stroke-width="36" stroke-linecap="round"/>'
     '<circle cx="120" cy="400" r="17" fill="#E6B88C" %s/><circle cx="280" cy="400" r="17" fill="#E6B88C" %s/>' % (OL, OL) +
     '<path d="M330 90 Q300 200 340 330 Q316 420 336 490" fill="none" stroke="#8a5a2b" stroke-width="12" stroke-linecap="round"/>'
     '<circle cx="330" cy="80" r="26" fill="#4ADE80" %s/><circle cx="330" cy="80" r="44" fill="#4ADE80" opacity=".4" filter="url(#bl)"/>' % OL +
     '<path d="M120 200 Q96 300 140 380 Q120 290 150 220Z M280 200 Q304 300 260 380 Q280 290 250 220Z" fill="#6b3d1f" %s/>' % OL +
     '<circle cx="200" cy="192" r="64" fill="#E6B88C" %s/>' % OL +
     '<path d="M132 190 Q136 110 200 108 Q264 110 268 190 Q232 140 200 160 Q168 140 132 190Z" fill="#6b3d1f" %s/>' % OL +
     eyes(200, 198, 24, 8, '#134d2a') +
     '<path d="M188 226 Q200 238 212 226" stroke="#a05a4a" stroke-width="5" fill="none" stroke-linecap="round"/>'
     '<path d="M146 120 L120 60 M120 60 L96 76 M120 60 L124 30 M254 120 L280 60 M280 60 L304 76 M280 60 L276 30" stroke="#8a5a2b" stroke-width="10" fill="none" stroke-linecap="round"/>'
     '<path d="M160 118 q12 -22 26 -2 q-8 12 -26 2z M214 116 q12 -20 26 0 q-8 12 -26 0z" fill="#4ADE80" %s/>' % OL.replace('5"', '3"', 1),
     lg('fg', [(0, '#4ADE80'), (1, '#16794a')]))

# 5 Shadow Lord
char('shadow_lord', 5,
     '<ellipse cx="200" cy="280" rx="190" ry="230" fill="url(#sa)"/>'
     '<path d="M90 500 Q110 300 170 240 L230 240 Q290 300 310 500 Q250 470 200 500 Q150 470 90 500Z" fill="url(#sd)" %s/>' % OL +
     '<path d="M120 270 Q40 330 60 420 L100 360Z M280 270 Q360 330 340 420 L300 360Z" fill="#2a1450" %s/>' % OL +
     '<path d="M60 420 l-14 36 M64 424 l4 40 M70 420 l16 34 M340 420 l14 36 M336 424 l-4 40 M330 420 l-16 34" stroke="#7B5CFF" stroke-width="7" stroke-linecap="round"/>'
     '<polygon points="200,300 224,336 200,380 176,336" fill="#FF3B5C" %s/><circle cx="200" cy="336" r="30" fill="#FF3B5C" opacity=".4" filter="url(#bl)"/>' % OL +
     '<path d="M140 220 Q200 150 260 220 Q250 270 200 280 Q150 270 140 220Z" fill="#1d0f38" %s/>' % OL +
     '<path d="M164 206 l36 14 36 -14 -8 22 -28 8 -28 -8z" fill="#FF3B5C"/>'
     '<circle cx="176" cy="214" r="4" fill="#fff"/><circle cx="224" cy="214" r="4" fill="#fff"/>'
     '<path d="M150 150 L108 40 L174 112 M250 150 L292 40 L226 112 M200 120 L200 28 M175 128 L150 56 M225 128 L250 56" fill="#3a1d6e" %s/>' % OL +
     ''.join('<path d="M%d 500 q-16 -50 0 -90 q22 40 0 90z" fill="#9B5CFF" opacity=".8"/>' % x for x in (130, 200, 270)),
     rg('sa', [(0, '#7B2BD6', .55), (1, '#7B2BD6', 0)]) + lg('sd', [(0, '#3a1d6e'), (1, '#0f0620')]))

# =============================================================== BOSSES 480x480
SH2 = '<ellipse cx="240" cy="450" rx="150" ry="16" fill="#000" opacity=".28"/>'
def boss(name, i, body, defs=''):
    save('bosses', 'boss_%02d_%s' % (i, name), svg(480, 480, SH2 + body, defs + BLUR))
def dragon(hid, body_c, belly_c, wing_c, horn_c, glow_c, flame):
    return (
        '<path d="M110 250 C20 190 24 90 110 60 C100 120 130 160 176 190Z" fill="%s" %s/>' % (wing_c, OL) +
        '<path d="M370 250 C460 190 456 90 370 60 C380 120 350 160 304 190Z" fill="%s" %s/>' % (wing_c, OL) +
        '<path d="M300 400 C440 400 470 330 430 280 C420 330 380 350 330 340Z" fill="%s" %s/>' % (body_c, OL) +
        '<ellipse cx="240" cy="320" rx="120" ry="108" fill="%s" %s/>' % (body_c, OL) +
        '<ellipse cx="240" cy="336" rx="70" ry="86" fill="%s"/>' % belly_c +
        ''.join('<path d="M170 %d H310" stroke="%s" stroke-width="4" opacity=".5"/>' % (y, body_c) for y in (300, 330, 360, 390)) +
        '<path d="M214 250 C190 180 214 140 240 110 C266 140 290 180 266 250Z" fill="%s" %s/>' % (body_c, OL) +
        '<path d="M150 410 q-20 18 -40 4 M190 428 q-10 22 -34 16 M330 410 q20 18 40 4 M290 428 q10 22 34 16" stroke="%s" stroke-width="12" fill="none" stroke-linecap="round"/>' % horn_c +
        '<path d="M170 140 C170 60 310 60 310 140 C310 190 270 214 240 214 C210 214 170 190 170 140Z" fill="%s" %s/>' % (body_c, OL) +
        '<path d="M184 130 L130 60 L206 100Z M296 130 L350 60 L274 100Z" fill="%s" %s/>' % (horn_c, OL) +
        '<ellipse cx="240" cy="176" rx="46" ry="30" fill="%s" %s/>' % (belly_c, OL) +
        '<circle cx="226" cy="178" r="5" fill="#1b1033"/><circle cx="254" cy="178" r="5" fill="#1b1033"/>'
        '<path d="M196 128 q14 -12 30 2 M284 128 q-14 -12 -30 2" stroke="#1b1033" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="206" cy="132" rx="9" ry="7" fill="%s"/><ellipse cx="274" cy="132" rx="9" ry="7" fill="%s"/>' % (glow_c, glow_c) +
        '<circle cx="240" cy="330" r="30" fill="%s" opacity=".5" filter="url(#bl)"/>' % glow_c +
        '<polygon points="240,300 258,326 240,356 222,326" fill="%s" %s/>' % (glow_c, OL.replace('5"', '3"', 1)) +
        ''.join('<polygon points="%d,%d %d,%d %d,%d" fill="%s" %s/>' % (x, 214, x+9, 190, x+18, 214, horn_c, OL.replace('5"', '3"', 1)) for x in (212, 232, 252)) +
        flame)

boss('stone_golem', 1,
     '<path d="M130 200 L70 260 L60 380 L120 400 L150 330Z" fill="#7a7886" %s/><path d="M350 200 L410 260 L420 380 L360 400 L330 330Z" fill="#7a7886" %s/>' % (OL, OL) +
     '<rect x="55" y="360" width="80" height="70" rx="14" fill="#9a98a6" %s/><rect x="345" y="360" width="80" height="70" rx="14" fill="#9a98a6" %s/>' % (OL, OL) +
     '<rect x="150" y="230" width="180" height="190" rx="20" fill="url(#st)" %s/>' % OL +
     '<rect x="170" y="400" width="56" height="50" rx="10" fill="#6a6773" %s/><rect x="254" y="400" width="56" height="50" rx="10" fill="#6a6773" %s/>' % (OL, OL) +
     '<path d="M150 260 Q200 250 250 270 Q300 250 330 262 L330 280 Q290 268 250 290 Q200 270 150 282Z" fill="#4ade80" opacity=".75"/>'
     '<polygon points="240,290 270,330 240,380 210,330" fill="#FF8A1F" %s/><circle cx="240" cy="334" r="40" fill="#FF8A1F" opacity=".5" filter="url(#bl)"/>' % OL +
     '<rect x="170" y="110" width="140" height="130" rx="26" fill="#9a98a6" %s/>' % OL +
     '<rect x="190" y="150" width="46" height="26" rx="8" fill="#1b1033"/><rect x="244" y="150" width="46" height="26" rx="8" fill="#1b1033"/>'
     '<rect x="198" y="157" width="30" height="12" rx="5" fill="#FF8A1F"/><rect x="252" y="157" width="30" height="12" rx="5" fill="#FF8A1F"/>'
     '<path d="M204 204 H276 M214 204 v18 M232 204 v18 M250 204 v18 M268 204 v18" stroke="#1b1033" stroke-width="5"/>'
     '<path d="M170 130 L150 90 L190 110 M310 130 L330 90 L290 110" fill="#7a7886" %s/>' % OL,
     lg('st', [(0, '#a8a6b4'), (1, '#6a6773')]))
boss('ice_dragon', 2, dragon('id', '#7CCBF2', '#E6FAFF', '#B9E6FA', '#E8F7FF', '#2F9BFF',
     ''.join('<polygon points="%d,%d %d,%d %d,%d" fill="#fff" opacity=".85"/>' % (x, y, x+8, y-24, x+16, y) for x, y in ((120, 120), (350, 120), (60, 330), (400, 330))) +
     sparkle(240, 40, 1.4, '#fff')))
boss('forest_witch', 3,
     '<path d="M120 460 Q130 270 240 240 Q350 270 360 460Z" fill="url(#wt)" %s/>' % OL +
     '<path d="M150 380 q30 -30 60 0 M260 420 q30 -30 60 0" stroke="#9BE86B" stroke-width="6" fill="none"/>'
     '<path d="M400 90 Q380 220 410 460" stroke="#6b3d1f" stroke-width="14" fill="none" stroke-linecap="round"/>'
     '<circle cx="402" cy="84" r="34" fill="#7B2BD6" %s/><circle cx="402" cy="84" r="54" fill="#B65BFF" opacity=".5" filter="url(#bl)"/>' % OL +
     '<path d="M392 60 l-14 -20 M418 62 l14 -20 M430 90 l22 -6" stroke="#3a6b2a" stroke-width="7" stroke-linecap="round"/>'
     '<circle cx="240" cy="210" r="62" fill="#9BCB6B" %s/>' % OL +
     '<path d="M120 190 Q240 150 360 190 L350 214 Q240 180 130 214Z" fill="#1f6b3a" %s/>' % OL +
     '<path d="M130 190 Q200 90 262 -4 Q262 110 350 190Z" fill="#1f6b3a" %s/>' % OL +
     '<path d="M140 170 q40 -16 90 -4" stroke="#9BE86B" stroke-width="7" fill="none"/>'
     '<ellipse cx="214" cy="214" rx="11" ry="8" fill="#FFE04A"/><ellipse cx="266" cy="214" rx="11" ry="8" fill="#FFE04A"/>'
     '<circle cx="214" cy="214" r="3.5" fill="#1b1033"/><circle cx="266" cy="214" r="3.5" fill="#1b1033"/>'
     '<path d="M222 250 Q240 262 258 250" stroke="#2a4a1a" stroke-width="5" fill="none" stroke-linecap="round"/>'
     '<path d="M240 226 l-6 16 h12z" fill="#7aa84a" %s/>' % OL.replace('5"', '3"', 1),
     lg('wt', [(0, '#2f9a5a'), (1, '#0f4a2a')]))
boss('sand_titan', 4,
     '<path d="M80 200 Q40 300 70 420 L130 420 L140 250Z M400 200 Q440 300 410 420 L350 420 L340 250Z" fill="#c9954a" %s/>' % OL +
     '<path d="M150 230 H330 L350 440 H130Z" fill="url(#sd2)" %s/>' % OL +
     '<path d="M170 300 Q240 280 310 300 M160 350 Q240 330 320 350 M150 400 Q240 380 330 400" stroke="#8a5a1f" stroke-width="5" fill="none" opacity=".6"/>'
     '<path d="M215 300 h50 l-12 36 l12 36 h-50 l12 -36z" fill="#FFE9A0" %s/>' % OL.replace('5"', '3"', 1) +
     '<path d="M150 150 L240 60 L330 150 L340 220 H140Z" fill="#E8B15A" %s/>' % OL +
     '<path d="M150 150 L110 250 L160 230 M330 150 L370 250 L320 230" fill="#2f8fc4" %s/>' % OL +
     '<rect x="176" y="150" width="128" height="50" rx="14" fill="#2b1a0a" %s/>' % OL +
     '<circle cx="212" cy="176" r="10" fill="#FFD84A"/><circle cx="268" cy="176" r="10" fill="#FFD84A"/>'
     '<polygon points="240,76 254,98 240,116 226,98" fill="#2f9bff" %s/>' % OL.replace('5"', '3"', 1),
     lg('sd2', [(0, '#e8b15a'), (1, '#a8702a')]))
boss('fire_dragon', 5, dragon('fd', '#E5522B', '#FFC26B', '#7a1a1a', '#2b1210', '#FFD84A',
     ''.join('<path d="M%d %d q-14 -40 0 -70 q22 36 0 70z" fill="#FF8A1F" opacity=".9"/>' % (x, y) for x, y in ((130, 140), (350, 140), (80, 360), (400, 350))) +
     '<path d="M226 214 Q240 270 254 214Z" fill="#FFD84A"/>'))
boss('sea_serpent', 6,
     '<path d="M0 360 Q60 330 120 360 T240 360 T360 360 T480 360 V480 H0Z" fill="#1c7fb8" opacity=".55"/>'
     '<path d="M70 420 C60 300 160 330 180 260 C200 190 120 160 170 100 C210 60 300 70 310 120 C320 170 260 190 300 250 C340 310 420 330 410 430" fill="none" stroke="#1d9a8f" stroke-width="64" stroke-linecap="round"/>'
     '<path d="M70 420 C60 300 160 330 180 260 C200 190 120 160 170 100 C210 60 300 70 310 120 C320 170 260 190 300 250 C340 310 420 330 410 430" fill="none" stroke="#4fe0c8" stroke-width="22" stroke-linecap="round" stroke-dasharray="2 22"/>'
     '<path d="M170 100 C160 40 210 10 250 24 C300 40 300 100 262 112 C230 122 190 120 170 100Z" fill="#1d9a8f" %s/>' % OL +
     '<path d="M214 22 L204 -10 L242 10 M262 28 L290 4 L282 44" fill="#7DF3EC" %s/>' % OL +
     '<circle cx="222" cy="62" r="9" fill="#FFE04A"/><circle cx="222" cy="62" r="3.5" fill="#1b1033"/>'
     '<path d="M214 94 L222 110 L232 94 L244 110 L254 94" fill="#fff" %s/>' % OL.replace('5"', '3"', 1) +
     '<path d="M0 392 Q60 372 120 392 T240 392 T360 392 T480 392 V480 H0Z" fill="#1c7fb8" opacity=".5"/>')
boss('shadow_lord', 7,
     '<circle cx="240" cy="230" r="220" fill="url(#sl)"/>'
     '<path d="M70 470 Q90 270 170 200 L310 200 Q390 270 410 470 Q330 430 240 470 Q150 430 70 470Z" fill="url(#sl2)" %s/>' % OL +
     '<path d="M130 240 Q10 300 30 420 L110 350Z M350 240 Q470 300 450 420 L370 350Z" fill="#2a1450" %s/>' % OL +
     '<polygon points="240,290 276,336 240,396 204,336" fill="#FF3B5C" %s/><circle cx="240" cy="338" r="46" fill="#FF3B5C" opacity=".5" filter="url(#bl)"/>' % OL +
     '<path d="M160 180 Q240 90 320 180 Q310 250 240 262 Q170 250 160 180Z" fill="#1d0f38" %s/>' % OL +
     '<path d="M186 166 l54 20 54 -20 -10 30 -44 12 -44 -12z" fill="#FF3B5C"/>'
     '<path d="M170 120 L110 -6 L196 80 M310 120 L370 -6 L284 80 M240 80 L240 -14 M205 92 L178 18 M275 92 L302 18" fill="#3a1d6e" %s/>' % OL +
     ''.join('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#9B5CFF" %s/>' % (x, y, x+12, y+18, x, y+36, x-12, y+18, OL.replace('5"', '3"', 1)) for x, y in ((50, 150), (430, 150), (90, 60), (390, 60))),
     rg('sl', [(0, '#7B2BD6', .6), (1, '#7B2BD6', 0)]) + lg('sl2', [(0, '#3a1d6e'), (1, '#0f0620')]))

# =============================================================== WORLD BACKGROUNDS 390x844
def bg(name, i, sky, body, defs=''):
    save('backgrounds', 'bg_%02d_%s' % (i, name), svg(390, 844, '<rect width="390" height="844" fill="url(#sky)"/>' + body,
         lg('sky', sky) + defs + BLUR))
def ridge(seed, base_y, amp, color, w=390, step=26, bottom=844):
    r = random.Random(seed); y = base_y; p = 'M0 %d ' % bottom
    pts_ = []
    for x in range(0, w + step, step):
        y = base_y + r.uniform(-amp, amp); pts_.append((x, y))
    return '<path d="M0 %d L%s L%d %d Z" fill="%s"/>' % (bottom, ' L'.join('%d %d' % q for q in pts_), w + step, bottom, color)
def peaks(seed, base_y, h, color, snow=None, n=5):
    r = random.Random(seed); out = ''
    for k in range(n):
        cx = k*390/(n-1) + r.uniform(-20, 20); hh = h*r.uniform(.7, 1.1); ww = 130
        out += '<polygon points="%d,%d %d,%d %d,%d" fill="%s"/>' % (cx-ww, base_y, cx, base_y-hh, cx+ww, base_y, color)
        if snow: out += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="%s"/>' % (cx-ww*.28, base_y-hh*.72, cx, base_y-hh, cx+ww*.28, base_y-hh*.72, cx, base_y-hh*.6, snow)
    return out
def stars(seed, n, ymax=500, c='#fff'):
    r = random.Random(seed)
    return ''.join('<circle cx="%d" cy="%d" r="%.1f" fill="%s" opacity="%.2f"/>' % (r.randint(0, 390), r.randint(0, ymax), r.uniform(.6, 2), c, r.uniform(.4, 1)) for _ in range(n))
def cloud(x, y, s=1, c='#fff', o=.9):
    return '<g transform="translate(%d %d) scale(%.2f)" fill="%s" opacity="%.2f"><ellipse cx="0" cy="0" rx="40" ry="16"/><ellipse cx="-22" cy="-10" rx="22" ry="16"/><ellipse cx="14" cy="-16" rx="26" ry="20"/></g>' % (x, y, s, c, o)
def crystals_(seed, n, y0, color, h=60):
    r = random.Random(seed); out = ''
    for _ in range(n):
        x = r.randint(10, 380); hh = r.uniform(.5, 1)*h; w = hh*.28
        out += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="%s" opacity=".92"/><polygon points="%d,%d %d,%d %d,%d" fill="#fff" opacity=".35"/>' % (
            x-w, y0, x, y0-hh, x+w, y0, x, y0+8, color, x-w, y0, x, y0-hh, x, y0+8)
    return out

# 1 Crystal Valley
bg('crystal_valley', 1, [(0, '#8fe3ff'), (.55, '#d9f7ff'), (1, '#c9f2b2')],
   '<circle cx="300" cy="150" r="58" fill="#fff6c2"/><circle cx="300" cy="150" r="90" fill="#fff6c2" opacity=".35" filter="url(#bl)"/>' +
   cloud(80, 120, 1.2) + cloud(210, 210, .8) + cloud(340, 70, .7) +
   peaks(3, 500, 230, '#7ec9a4', '#fff', 4) +
   '<rect x="250" y="280" width="46" height="260" fill="#9be8ff" opacity=".85"/><rect x="258" y="280" width="8" height="260" fill="#fff" opacity=".7"/><rect x="278" y="280" width="5" height="260" fill="#fff" opacity=".5"/>' +
   ridge(5, 520, 22, '#58b86a') + crystals_(11, 7, 560, '#E5324B', 80) +
   '<path d="M0 640 Q195 590 390 640 V690 Q195 640 0 690Z" fill="#8a6a43"/><path d="M0 640 Q195 590 390 640" stroke="#b8935e" stroke-width="8" fill="none"/>' +
   ridge(8, 700, 18, '#3f9b52') + ridge(9, 770, 14, '#2f8244'))
# 2 Frozen Mountains
bg('frozen_mountains', 2, [(0, '#6f9bd6'), (.5, '#bfe0ff'), (1, '#eaf8ff')],
   stars(2, 24, 220, '#fff') + cloud(90, 140, 1.1, '#fff', .8) +
   peaks(7, 560, 360, '#8fb8e6', '#fff', 4) + peaks(8, 620, 260, '#b8d8f4', '#fff', 5) +
   '<g fill="#e8f6ff" stroke="#9cc6ea" stroke-width="3"><rect x="150" y="400" width="90" height="170"/><polygon points="150,400 195,330 240,400"/><rect x="120" y="440" width="34" height="130"/><polygon points="120,440 137,396 154,440"/><rect x="236" y="450" width="34" height="120"/><polygon points="236,450 253,408 270,450"/></g>' +
   '<rect x="180" y="470" width="30" height="50" rx="14" fill="#7fd0f2"/>' +
   ridge(4, 650, 16, '#d8efff') + '<ellipse cx="195" cy="740" rx="170" ry="40" fill="#9ed8f2" opacity=".8"/>' + ridge(6, 770, 12, '#f4fbff') + crystals_(21, 6, 700, '#2F7BFF', 70))
# 3 Enchanted Forest
def trees(seed, y, n, col, h=300):
    r = random.Random(seed); o = ''
    for _ in range(n):
        x = r.randint(-10, 400); hh = r.uniform(.6, 1)*h; w = hh*.22
        o += '<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/><ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s"/>' % (x-w*.12, y-hh*.55, w*.24, hh*.55, '#3b2a1a', x, y-hh*.62, w*1.6, hh*.5, col)
    return o
bg('enchanted_forest', 3, [(0, '#0f5a4a'), (.5, '#2a9a6a'), (1, '#c7f27a')],
   '<circle cx="195" cy="170" r="110" fill="#d8ffb0" opacity=".45" filter="url(#bl)"/>' + trees(1, 640, 7, '#1d7a52', 420) + trees(2, 700, 6, '#2fa86a', 340) +
   ''.join('<circle cx="%d" cy="%d" r="3" fill="#FFF6A8"/><circle cx="%d" cy="%d" r="9" fill="#FFF6A8" opacity=".3"/>' % (x, y, x, y) for x, y in random.Random(4).sample([(a, b) for a in range(20, 380, 40) for b in range(200, 700, 50)], 26)) +
   ridge(5, 730, 14, '#2f8a4a') + crystals_(6, 6, 760, '#1FBF6A', 70) +
   ''.join('<rect x="%d" y="770" width="8" height="18" fill="#f4e6c8"/><ellipse cx="%d" cy="770" rx="20" ry="12" fill="%s"/>' % (x, x+4, c) for x, c in ((40, '#ff6fb0'), (310, '#7DF3EC'), (160, '#FFD84A'))) +
   ridge(7, 800, 10, '#1d6a38'))
# 4 Lost Desert
bg('lost_desert', 4, [(0, '#ff9a4a'), (.45, '#ffd28a'), (1, '#fff1c8')],
   '<circle cx="110" cy="200" r="70" fill="#fff4c0"/><circle cx="110" cy="200" r="120" fill="#fff4c0" opacity=".4" filter="url(#bl)"/>' +
   ridge(3, 520, 20, '#f2b866') +
   '<g><polygon points="230,540 290,380 350,540" fill="#d99a4a"/><polygon points="290,380 350,540 290,540" fill="#b97a2a"/><rect x="170" y="470" width="18" height="70" fill="#c88a3a"/><rect x="196" y="470" width="18" height="70" fill="#c88a3a"/><rect x="160" y="456" width="64" height="14" fill="#b97a2a"/></g>' +
   ridge(5, 600, 24, '#e8a24a') + ridge(6, 680, 18, '#d78f38') + crystals_(8, 6, 700, '#FFC21A', 70) +
   '<path d="M40 760 l8 -40 8 40 M44 742 l-14 -10 M52 736 l14 -12" stroke="#2f8a4a" stroke-width="6" fill="none" stroke-linecap="round"/>' + ridge(9, 790, 12, '#c47a28'))
# 5 Dragon Kingdom
bg('dragon_kingdom', 5, [(0, '#3a0f2a'), (.4, '#b8341f'), (1, '#ff9a2b')],
   stars(1, 14, 160, '#ffd8a0') + '<circle cx="290" cy="160" r="46" fill="#ffb86b" opacity=".8"/>' +
   peaks(2, 560, 250, '#4a1a1a', None, 4) +
   '<polygon points="110,560 195,340 280,560" fill="#3a1414"/><path d="M165 372 L195 340 L225 372 L195 396Z" fill="#ff7a1a"/><path d="M195 340 q-26 -50 6 -94 q20 40 -6 94z" fill="#ffb347" opacity=".9"/><ellipse cx="195" cy="300" rx="80" ry="70" fill="#ff7a1a" opacity=".3" filter="url(#bl)"/>' +
   ridge(3, 640, 18, '#2b1010') + '<path d="M60 844 Q90 720 190 700 Q290 680 330 600 L360 600 Q320 720 230 760 Q150 790 130 844Z" fill="#ff7a1a"/><path d="M80 844 Q110 740 200 720 Q290 700 340 610" stroke="#ffd84a" stroke-width="6" fill="none" opacity=".8"/>' +
   crystals_(7, 6, 690, '#FF5A1A', 80) + ridge(5, 800, 10, '#1c0a0a'))
# 6 Ocean Kingdom
bg('ocean_kingdom', 6, [(0, '#2fd0ff'), (.5, '#1a7fd0'), (1, '#0b2f7a')],
   ''.join('<polygon points="%d,0 %d,0 %d,700 %d,700" fill="#fff" opacity=".07"/>' % (x, x+40, x+120, x+40) for x in (20, 110, 210, 300)) +
   ''.join('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="#bff" stroke-opacity=".6" stroke-width="2"/>' % (x, y, r) for x, y, r in ((60, 200, 8), (80, 260, 5), (320, 160, 10), (300, 330, 6), (200, 120, 5), (350, 520, 7))) +
   '<g fill="#ffd2ea"><path d="M290 700 q-10 -80 0 -120 M310 700 q4 -60 20 -100 M330 700 q10 -40 34 -60" stroke="#ff6fb0" stroke-width="12" fill="none" stroke-linecap="round"/></g>' +
   '<g stroke="#ff9a6a" stroke-width="10" fill="none" stroke-linecap="round"><path d="M40 760 q-10 -60 12 -100 M62 760 q10 -50 -4 -90 M20 760 q-14 -34 -8 -70"/></g>' +
   '<path d="M110 360 q40 -30 80 0 q-40 30 -80 0z M190 360 l24 -16 v32z" fill="#ffd84a" opacity=".85"/><circle cx="130" cy="358" r="3" fill="#1b1033"/>' +
   ridge(4, 740, 16, '#e8c88a') + crystals_(5, 6, 760, '#2FD3E8', 70) + ridge(6, 800, 10, '#c8a860'))
# 7 Sky Kingdom
def island(x, y, s=1):
    return ('<g transform="translate(%d %d) scale(%.2f)"><path d="M-90 0 Q0 30 90 0 L50 90 Q0 130 -50 90Z" fill="#9a6a3a"/><path d="M-96 6 Q0 -34 96 6 Q0 36 -96 6Z" fill="#6fd06a"/>'
            '<polygon points="-20,-8 0,-52 20,-8" fill="#7DF3EC"/><polygon points="22,-6 36,-34 48,-6" fill="#C69BFF"/></g>') % (x, y, s)
bg('sky_kingdom', 7, [(0, '#5ab8ff'), (.6, '#c8ecff'), (1, '#fff3f8')],
   '<circle cx="90" cy="130" r="50" fill="#fff6c2"/>' + cloud(280, 100, 1.3) + cloud(60, 330, 1) + cloud(330, 420, .9) +
   island(280, 260, .9) + island(100, 470, 1.15) + island(300, 660, .8) +
   '<path d="M120 480 Q200 540 280 280" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none" opacity=".8" stroke-dasharray="2 18"/>' +
   cloud(100, 760, 1.6, '#fff', .95) + cloud(300, 800, 1.8, '#fff', .95))
# 8 Dark Kingdom
bg('dark_kingdom', 8, [(0, '#12071f'), (.55, '#3a1560'), (1, '#6a1a4a')],
   stars(9, 40, 340, '#d8c8ff') + '<circle cx="290" cy="170" r="62" fill="#ff3b5c" opacity=".9"/><circle cx="290" cy="170" r="110" fill="#ff3b5c" opacity=".3" filter="url(#bl)"/>' +
   '<g fill="#150a26"><rect x="120" y="330" width="150" height="260"/><polygon points="120,330 150,250 180,330"/><polygon points="210,330 240,230 270,330"/><rect x="70" y="400" width="54" height="190"/><polygon points="70,400 97,330 124,400"/><rect x="266" y="410" width="54" height="180"/><polygon points="266,410 293,340 320,410"/></g>' +
   ''.join('<rect x="%d" y="%d" width="10" height="16" fill="#ff3b5c" opacity=".85"/>' % (x, y) for x, y in ((160, 380), (220, 380), (190, 440), (88, 440), (284, 450))) +
   ridge(3, 620, 24, '#1a0c2e') + crystals_(4, 6, 690, '#7B5CFF', 80) + '<path d="M0 760 Q100 720 200 760 T390 740 V844 H0Z" fill="#0d0518"/>' +
   '<path d="M60 790 q-10 -30 6 -50 q14 20 -6 50z M300 800 q-10 -30 6 -50 q14 20 -6 50z" fill="#9B5CFF" opacity=".8"/>')
# 9 Celestial Kingdom
bg('celestial_kingdom', 9, [(0, '#1a0f5a'), (.5, '#5a2bb8'), (1, '#e05cc8')],
   '<ellipse cx="200" cy="300" rx="260" ry="120" fill="#ff7ae0" opacity=".35" filter="url(#bl)" transform="rotate(-25 200 300)"/>' + stars(3, 90, 700, '#fff') +
   '<circle cx="195" cy="330" r="96" fill="none" stroke="#7DF3EC" stroke-width="12"/><circle cx="195" cy="330" r="70" fill="#1a0f5a" stroke="#C69BFF" stroke-width="6"/><circle cx="195" cy="330" r="130" fill="#7DF3EC" opacity=".18" filter="url(#bl)"/>' +
   '<circle cx="195" cy="330" r="30" fill="#fff" opacity=".7"/>' +
   '<circle cx="320" cy="90" r="32" fill="#ffd2a0"/><ellipse cx="320" cy="90" rx="56" ry="10" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4" transform="rotate(-20 320 90)"/>' +
   '<circle cx="70" cy="560" r="20" fill="#7DF3EC"/>' + ridge(6, 770, 14, '#3a1d8a') + crystals_(7, 6, 770, '#C69BFF', 80) + ridge(8, 815, 8, '#220f5a'))
# 10 Crystal Palace
bg('crystal_palace', 10, [(0, '#ffe39a'), (.45, '#fff4d6'), (1, '#d8f3ff')],
   '<circle cx="195" cy="250" r="170" fill="#fff" opacity=".8" filter="url(#bl)"/>' + cloud(60, 160, 1) + cloud(330, 220, 1.1) +
   '<g fill="#f6f0ff" stroke="#b9a0e8" stroke-width="3"><rect x="110" y="380" width="170" height="200"/><polygon points="110,380 150,250 190,380"/><polygon points="200,380 240,230 280,380"/><polygon points="150,380 195,200 240,380"/><rect x="60" y="440" width="54" height="140"/><polygon points="60,440 87,360 114,440"/><rect x="276" y="440" width="54" height="140"/><polygon points="276,440 303,360 330,440"/></g>' +
   '<polygon points="195,136 215,168 195,204 175,168" fill="#FF3B5C" stroke="#fff" stroke-width="4"/><circle cx="195" cy="170" r="50" fill="#FF3B5C" opacity=".45" filter="url(#bl)"/>' +
   '<path d="M170 580 V500 Q195 470 220 500 V580Z" fill="#7B5CFF"/>' + ridge(3, 620, 14, '#bfe8a8') + crystals_(5, 8, 660, '#E5324B', 70) + crystals_(6, 6, 680, '#2F7BFF', 70) +
   '<path d="M150 844 L180 600 H210 L240 844Z" fill="#ffe9a0" opacity=".9"/>' + ridge(7, 790, 10, '#8fd078'))

# =============================================================== UI ICONS 64x64
IC = {}
STR = 'stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"'
def icon(n, body, defs=''): IC[n] = svg(64, 64, body, defs)
GOLD = lg('g', [(0, '#FFF1A8'), (1, '#F5A31A')])
icon('coin', '<circle cx="32" cy="32" r="24" fill="url(#g)" %s/><circle cx="32" cy="32" r="16" fill="none" stroke="#b86a00" stroke-width="3"/><path d="M32 22 v20 M26 28 h12 M26 36 h12" stroke="#b86a00" stroke-width="3" stroke-linecap="round"/>' % STR, GOLD)
icon('shard', '<polygon points="32,6 50,24 42,56 32,60 22,56 14,24" fill="#7DF3EC" %s/><polygon points="32,6 50,24 32,30 14,24" fill="#fff" opacity=".6"/><path d="M32 30 V60" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>' % STR)
icon('star', '<polygon points="32,5 40,24 60,26 45,40 49,60 32,50 15,60 19,40 4,26 24,24" fill="url(#g)" %s/><path d="M26 22 l6 -10" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/>' % STR, GOLD)
icon('star_empty', '<polygon points="32,5 40,24 60,26 45,40 49,60 32,50 15,60 19,40 4,26 24,24" fill="#5b4a8a" stroke="#1b1033" stroke-width="3.5" stroke-linejoin="round" opacity=".85"/>')
icon('heart', '<path d="M32 56 C8 38 6 18 20 14 C27 12 31 17 32 21 C33 17 37 12 44 14 C58 18 56 38 32 56Z" fill="#FF4F78" %s/><ellipse cx="20" cy="22" rx="5" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 20 22)"/>' % STR)
icon('moves', '<path d="M10 24 H46 M36 12 L48 24 L36 36 M54 42 H18 M28 30 L16 42 L28 54" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')
icon('gear', '<path d="M32 8 l5 2 2 7 6 3 7 -3 4 4 -3 7 3 6 7 2 0 6 -7 2 -3 6 3 7 -4 4 -7 -3 -6 3 -2 7 -6 0 -2 -7 -6 -3 -7 3 -4 -4 3 -7 -3 -6 -7 -2 0 -6 7 -2 3 -6 -3 -7 4 -4 7 3 6 -3 2 -7z" fill="#b9c4ff" %s transform="scale(.85) translate(6 6)"/><circle cx="32" cy="32" r="9" fill="#4a3d8f" %s/>' % (STR, STR))
icon('pause', '<rect x="14" y="10" width="14" height="44" rx="5" fill="#fff" %s/><rect x="36" y="10" width="14" height="44" rx="5" fill="#fff" %s/>' % (STR, STR))
icon('play', '<polygon points="16,8 54,32 16,56" fill="#fff" %s/>' % STR)
icon('home', '<path d="M8 32 L32 10 L56 32 H50 V56 H38 V40 H26 V56 H14 V32Z" fill="#ffd84a" %s/>' % STR)
icon('shop', '<path d="M12 22 H52 L48 56 H16Z" fill="#FF7AC8" %s/><path d="M22 22 V16 A10 10 0 0 1 42 16 V22" fill="none" %s/><polygon points="32,30 38,38 32,46 26,38" fill="#fff" %s/>' % (STR, STR, STR))
icon('trophy', '<path d="M18 8 H46 V26 A14 14 0 0 1 18 26Z" fill="url(#g)" %s/><path d="M18 14 H8 Q8 28 20 30 M46 14 H56 Q56 28 44 30" fill="none" %s/><rect x="28" y="38" width="8" height="10" fill="#e08a00" %s/><rect x="18" y="48" width="28" height="8" rx="3" fill="url(#g)" %s/>' % (STR, STR, STR, STR), GOLD)
icon('gift', '<rect x="10" y="26" width="44" height="30" rx="4" fill="#B65BFF" %s/><rect x="8" y="18" width="48" height="12" rx="3" fill="#FF7AC8" %s/><rect x="28" y="18" width="8" height="38" fill="#FFD84A" %s/><path d="M32 18 C20 4 10 12 20 18 M32 18 C44 4 54 12 44 18" fill="none" %s/>' % (STR, STR, STR, STR))
icon('hammer', '<rect x="28" y="22" width="9" height="36" rx="3" fill="#b9792f" %s transform="rotate(30 32 40)"/><rect x="10" y="8" width="38" height="18" rx="5" fill="#c8c8d8" %s transform="rotate(30 32 18)"/>' % (STR, STR))
icon('wand', '<path d="M12 54 L42 24" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/><path d="M12 54 L42 24" stroke="#1b1033" stroke-width="3.5" stroke-linecap="round" opacity=".5"/><polygon points="46,6 50,16 60,18 52,25 54,36 46,30 38,36 40,25 32,18 42,16" fill="url(#g)" %s/>' % STR, GOLD)
icon('lightning', '<polygon points="36,4 14,36 28,36 22,60 50,26 34,26 44,4" fill="#FFE04A" %s/>' % STR)
icon('shuffle', '<path d="M8 20 H20 C34 20 34 44 48 44 H56 M8 44 H20 C26 44 30 40 32 36 M36 28 C38 24 42 20 48 20 H56 M48 12 L56 20 L48 28 M48 36 L56 44 L48 52" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>')
icon('extra_moves', '<circle cx="32" cy="32" r="24" fill="#2fd36e" %s/><path d="M32 18 V46 M18 32 H46" stroke="#fff" stroke-width="8" stroke-linecap="round"/>' % STR)
icon('music', '<path d="M24 46 V14 L50 8 V40" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="18" cy="46" rx="9" ry="7" fill="#fff"/><ellipse cx="44" cy="40" rx="9" ry="7" fill="#fff"/>')
icon('sound', '<polygon points="8,24 20,24 34,12 34,52 20,40 8,40" fill="#fff" %s/><path d="M42 22 Q50 32 42 42 M48 14 Q62 32 48 50" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' % STR)
icon('sound_off', '<polygon points="8,24 20,24 34,12 34,52 20,40 8,40" fill="#fff" %s/><path d="M42 22 L58 42 M58 22 L42 42" stroke="#FF4F78" stroke-width="6" stroke-linecap="round"/>' % STR)
icon('lock', '<path d="M18 28 V20 A14 14 0 0 1 46 20 V28" fill="none" stroke="#1b1033" stroke-width="9" stroke-linecap="round"/><path d="M18 28 V20 A14 14 0 0 1 46 20 V28" fill="none" stroke="#c8c8d8" stroke-width="4" stroke-linecap="round"/><rect x="10" y="28" width="44" height="30" rx="7" fill="#FFD84A" %s/><circle cx="32" cy="42" r="5" fill="#1b1033"/>' % STR)
icon('crown', '<path d="M8 50 L12 18 L24 32 L32 12 L40 32 L52 18 L56 50Z" fill="url(#g)" %s/><circle cx="12" cy="16" r="4" fill="#FF4F78"/><circle cx="32" cy="10" r="4" fill="#7DF3EC"/><circle cx="52" cy="16" r="4" fill="#FF4F78"/>' % STR, GOLD)
icon('close', '<circle cx="32" cy="32" r="26" fill="#FF4F78" %s/><path d="M22 22 L42 42 M42 22 L22 42" stroke="#fff" stroke-width="7" stroke-linecap="round"/>' % STR)
icon('level_node', '<circle cx="32" cy="32" r="26" fill="#7B5CFF" %s/><circle cx="32" cy="32" r="19" fill="#9B8CFF"/><ellipse cx="25" cy="22" rx="8" ry="4" fill="#fff" opacity=".6" transform="rotate(-35 25 22)"/>' % STR)
icon('level_node_done', '<circle cx="32" cy="32" r="26" fill="#2fd36e" %s/><path d="M20 33 L29 42 L45 24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' % STR)
icon('map', '<path d="M6 14 L22 8 L42 14 L58 8 V50 L42 56 L22 50 L6 56Z" fill="#ffe9a0" %s/><path d="M22 8 V50 M42 14 V56" stroke="#1b1033" stroke-width="3" opacity=".6"/><path d="M30 28 l12 12 M42 28 l-12 12" stroke="#E5324B" stroke-width="5" stroke-linecap="round"/>' % STR)
icon('person', '<circle cx="32" cy="20" r="12" fill="#FFD2A8" %s/><path d="M10 58 C10 38 54 38 54 58Z" fill="#7B5CFF" %s/>' % (STR, STR))
icon('chest', '<path d="M8 28 A24 20 0 0 1 56 28Z" fill="#c8802f" %s/><rect x="8" y="28" width="48" height="26" rx="4" fill="#a8641f" %s/><rect x="27" y="28" width="10" height="16" rx="3" fill="url(#g)" %s/><path d="M8 28 H56" stroke="#FFD84A" stroke-width="5"/>' % (STR, STR, STR), GOLD)
icon('book', '<path d="M8 12 Q20 8 32 14 Q44 8 56 12 V52 Q44 48 32 54 Q20 48 8 52Z" fill="#fff3d6" %s/><path d="M32 14 V54" stroke="#1b1033" stroke-width="3"/><path d="M14 22 Q22 20 27 24 M14 32 Q22 30 27 34 M37 24 Q42 20 50 22 M37 34 Q42 30 50 32" stroke="#b86a00" stroke-width="3" fill="none" stroke-linecap="round"/>' % STR)
icon('shield', '<path d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14Z" fill="#2F7BFF" %s/><polygon points="32,18 40,32 32,46 24,32" fill="#fff"/>' % STR)
icon('rainbow_blast', '<path d="M8 48 A24 24 0 0 1 56 48" fill="none" stroke="#FF3B5C" stroke-width="7"/><path d="M15 48 A17 17 0 0 1 49 48" fill="none" stroke="#FFD21F" stroke-width="7"/><path d="M22 48 A10 10 0 0 1 42 48" fill="none" stroke="#2F9BFF" stroke-width="7"/>')
for n, s in IC.items(): save('ui/icons', 'icon_' + n, s)

# =============================================================== UI KIT
def button(name, c1, c2, label_col='#fff'):
    save('ui', 'button_' + name, svg(300, 80,
         '<rect x="4" y="10" width="292" height="66" rx="33" fill="%s"/>' % mix(c2, '#000000', .45) +
         '<rect x="4" y="4" width="292" height="66" rx="33" fill="url(#b)" stroke="#1b1033" stroke-width="4"/>'
         '<rect x="18" y="10" width="264" height="22" rx="11" fill="#fff" opacity=".28"/>', lg('b', [(0, c1), (1, c2)])))
button('primary', '#7DF3A0', '#1FBF6A'); button('secondary', '#8ec5ff', '#2F7BFF'); button('danger', '#ff9aa8', '#E5324B'); button('gold', '#FFF1A8', '#F5A31A')
save('ui', 'panel_main', svg(320, 420,
     '<rect x="6" y="14" width="308" height="400" rx="34" fill="#1b1033" opacity=".35"/><rect x="6" y="6" width="308" height="398" rx="34" fill="url(#p)" stroke="#1b1033" stroke-width="5"/>'
     '<rect x="16" y="16" width="288" height="378" rx="26" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>'
     '<rect x="60" y="-6" width="200" height="52" rx="26" fill="url(#t)" stroke="#1b1033" stroke-width="5"/>',
     lg('p', [(0, '#5a3fb8'), (1, '#2f1f78')]) + lg('t', [(0, '#FFF1A8'), (1, '#F5A31A')])))
save('ui', 'progress_bar', svg(300, 36,
     '<rect x="3" y="3" width="294" height="30" rx="15" fill="#241450" stroke="#1b1033" stroke-width="4"/><rect x="8" y="8" width="190" height="20" rx="10" fill="url(#f)"/><rect x="14" y="11" width="170" height="6" rx="3" fill="#fff" opacity=".4"/>',
     lg('f', [(0, '#9BFFB8'), (1, '#1FBF6A')])))
save('ui', 'logo_emblem', svg(240, 260,
     '<circle cx="120" cy="124" r="108" fill="#FF4F78" opacity=".35" filter="url(#bl)"/>'
     '<path d="M120 236 C20 160 8 70 60 44 C92 28 114 52 120 70 C126 52 148 28 180 44 C232 70 220 160 120 236Z" fill="url(#h)" stroke="#1b1033" stroke-width="7" stroke-linejoin="round"/>'
     '<path d="M120 70 L120 236 M60 44 L120 120 L180 44 M30 100 L120 120 L210 100" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>'
     '<path d="M64 62 l12 -6" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>' + sparkle(168, 70, 1.6) +
     '<polygon points="120,10 140,40 120,64 100,40" fill="#7DF3EC" stroke="#1b1033" stroke-width="5" stroke-linejoin="round"/>',
     lg('h', [(0, '#FF9ABA'), (.5, '#FF4F78'), (1, '#9B1C48')], 0, 0, 1, 1) + BLUR))
print('art assets written to', ROOT)
