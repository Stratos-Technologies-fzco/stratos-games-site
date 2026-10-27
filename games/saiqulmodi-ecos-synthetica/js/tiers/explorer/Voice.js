// Voice.js - Explorer narration. Uses the device's own voice when it has one for
// the chosen language; otherwise plays the recorded clip (content/audio/<lang>/),
// made by tools/build_narration.py. Bengali is recorded because most devices lack it.
import { getLang } from '../../i18n.js';
import { Speech } from '../../Speech.js';

// Languages with recorded clips (others use the device voice).
const RECORDED = ['bn'];

// FNV-1a over UTF-8 bytes; tools/build_narration.py uses the same hash for file names.
export function hashText(s) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export class Voice {
  constructor() {
    this.speech = new Speech();
    this.on = true;
    this.manifest = {};
    this.audio = null;
    this.token = 0;
  }

  async loadManifest(lang) {
    if (this.manifest[lang]) return this.manifest[lang];
    if (!RECORDED.includes(lang)) return (this.manifest[lang] = {});
    try {
      const r = await fetch(`content/audio/${lang}/index.json`);
      this.manifest[lang] = r.ok ? await r.json() : {};
    } catch (e) { this.manifest[lang] = {}; }
    return this.manifest[lang];
  }

  stop() {
    this.token++;
    this.speech.stop();
    if (this.audio) { this.audio.pause(); this.audio = null; }
  }

  async speak(parts) {
    if (!this.on) return;
    this.stop();
    const lang = getLang();
    const texts = parts.filter(Boolean).map(String);
    const man = await this.loadManifest(lang);
    const recorded = texts.every((t) => man[hashText(t)]);
    if (this.speech.ok && this.speech.hasVoice(lang) && !(recorded && lang === 'bn')) { this.speech.speak(texts); return; }
    if (!texts.some((t) => man[hashText(t)])) { if (this.speech.ok) this.speech.speak(texts); return; }
    const my = ++this.token;
    for (const t of texts) {
      const file = man[hashText(t)];
      if (!file || my !== this.token) continue;
      await new Promise((res) => {
        const a = new Audio(`content/audio/${lang}/${file}`);
        this.audio = a;
        a.onended = res; a.onerror = res;
        a.play().catch(res);
      });
    }
  }
}
