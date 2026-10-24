// Speech.js - reads profiles and quiz questions aloud in English, Hindi or
// Bengali using the device's own text-to-speech voices.
import { LANGS, getLang } from './i18n.js';

const strip = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// Short pieces avoid browsers cutting long utterances off part-way.
const sentences = (s) => strip(s).split(/(?<=[.!?।])\s+/).filter(Boolean);

export class Speech {
  constructor() {
    this.ok = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.voices = [];
    this.speaking = false;
    if (this.ok) {
      const load = () => { this.voices = window.speechSynthesis.getVoices(); };
      load();
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', load);
    }
  }

  voiceFor(lang) {
    const code = LANGS[lang].speech.toLowerCase();
    const prefix = code.slice(0, 2);
    const norm = (v) => v.lang.replace('_', '-').toLowerCase();
    return this.voices.find((v) => norm(v) === code) || this.voices.find((v) => norm(v).startsWith(prefix)) || null;
  }

  hasVoice(lang = getLang()) {
    if (!this.ok) return false;
    if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
    // Before the voice list loads, assume it may work.
    return !this.voices.length || !!this.voiceFor(lang);
  }

  // parts: array of strings (HTML allowed). onDone runs when all are read or stopped.
  speak(parts, onDone, langOverride = null) {
    if (!this.ok) return false;
    this.stop();
    const lang = langOverride || getLang();
    const voice = this.voiceFor(lang);
    const queue = parts.flatMap(sentences);
    let i = 0;
    this.speaking = true;
    const token = (this.token = {});
    const next = () => {
      if (token !== this.token) return;
      if (i >= queue.length || !this.speaking) { this.speaking = false; if (onDone) onDone(); return; }
      const u = new SpeechSynthesisUtterance(queue[i++]);
      u.lang = LANGS[lang].speech;
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onend = next;
      u.onerror = next;
      window.speechSynthesis.speak(u);
    };
    next();
    return true;
  }

  stop() {
    this.speaking = false;
    this.token = {};
    if (this.ok) window.speechSynthesis.cancel();
  }
}
