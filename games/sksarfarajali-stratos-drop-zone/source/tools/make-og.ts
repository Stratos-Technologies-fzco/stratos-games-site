// Builds public/og-image.png (1200x630) from the social base image, drawing the title text onto it.
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = join(root, 'public', 'ui', 'social', 'og_base_1200x630.webp');
if (!existsSync(base)) { console.error('make-og: run copy-ui-art first (social/og_base_1200x630.webp is missing)'); process.exit(1); }
const font = "Inter, 'Segoe UI', Arial, Helvetica, sans-serif";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0E0B1A" stop-opacity="0.92"/><stop offset="0.55" stop-color="#0E0B1A" stop-opacity="0.55"/><stop offset="1" stop-color="#0E0B1A" stop-opacity="0"/></linearGradient>
    <linearGradient id="b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0E0B1A" stop-opacity="0.85"/><stop offset="0.4" stop-color="#0E0B1A" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#l)"/><rect width="1200" height="630" fill="url(#b)"/>
  <text x="70" y="250" font-family="${font}" font-weight="800" font-size="46" letter-spacing="14" fill="#FFB020">STRATOS</text>
  <text x="66" y="352" font-family="${font}" font-weight="900" font-size="112" fill="#7C3AED">DROP ZONE</text>
  <text x="62" y="348" font-family="${font}" font-weight="900" font-size="112" fill="#F2F0FA">DROP ZONE</text>
  <text x="68" y="426" font-family="${font}" font-weight="600" font-size="38" fill="#DCD8EC">Play free in your browser</text>
  <rect x="68" y="470" width="250" height="64" rx="14" fill="#FFB020"/><rect x="68" y="534" width="250" height="6" rx="3" fill="#B87500"/>
  <text x="193" y="514" text-anchor="middle" font-family="${font}" font-weight="900" font-size="30" letter-spacing="3" fill="#1A1205">PLAY FREE</text>
  <text x="1130" y="590" text-anchor="end" font-family="${font}" font-weight="700" font-size="26" fill="#C9C4DE">stratos.games</text>
</svg>`;
await sharp(base).resize(1200, 630, { fit: 'cover' }).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png({ compressionLevel: 9 }).toFile(join(root, 'public', 'og-image.png'));
console.log('make-og: wrote public/og-image.png (1200x630)');
