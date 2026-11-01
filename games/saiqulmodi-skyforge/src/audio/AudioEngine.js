/**
 * Procedural Audio Engine for SKYFORGE
 * 100% Web Audio API procedural synthesis - Zero external files.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;

    // Gain Nodes
    this.masterGain = null;
    this.engineGain = null;
    this.windGain = null;
    this.screechGain = null;
    this.stallGain = null;

    // Propeller Nodes
    this.propOsc1 = null;
    this.propOsc2 = null;
    this.propFilter = null;

    // Wind Nodes
    this.windSource = null;
    this.windFilter = null;

    // Stall Horn Nodes
    this.stallOsc1 = null;
    this.stallOsc2 = null;

    // State Tracking
    this.lastWoW = true;
  }

  init() {
    if (this.initialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported.');
      return;
    }

    this.ctx = new AudioContextClass();

    // Master Compressor (anti-clipping)
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
    compressor.connect(this.ctx.destination);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(compressor);

    this._initEngineSynth();
    this._initWindSynth();
    this._initStallHorn();
    this._initTireScreech();

    this.initialized = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  _initEngineSynth() {
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.propFilter = this.ctx.createBiquadFilter();
    this.propFilter.type = 'lowpass';
    this.propFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
    this.propFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.propOsc1 = this.ctx.createOscillator();
    this.propOsc1.type = 'sawtooth';
    this.propOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.propOsc2 = this.ctx.createOscillator();
    this.propOsc2.type = 'square';
    this.propOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.propOsc2.connect(osc2Gain);

    this.propOsc1.connect(this.propFilter);
    osc2Gain.connect(this.propFilter);

    this.propFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.propOsc1.start();
    this.propOsc2.start();
  }

  _initWindSynth() {
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.windSource = this.ctx.createBufferSource();
    this.windSource.buffer = this._createNoiseBuffer();
    this.windSource.loop = true;

    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windSource.start();
  }

  _initStallHorn() {
    this.stallGain = this.ctx.createGain();
    this.stallGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.stallOsc1 = this.ctx.createOscillator();
    this.stallOsc1.type = 'square';
    this.stallOsc1.frequency.setValueAtTime(700, this.ctx.currentTime);

    this.stallOsc2 = this.ctx.createOscillator();
    this.stallOsc2.type = 'square';
    this.stallOsc2.frequency.setValueAtTime(720, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.stallOsc1.connect(subGain);
    this.stallOsc2.connect(subGain);
    subGain.connect(this.stallGain);
    this.stallGain.connect(this.masterGain);

    this.stallOsc1.start();
    this.stallOsc2.start();
  }

  _initTireScreech() {
    this.screechGain = this.ctx.createGain();
    this.screechGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.screechGain.connect(this.masterGain);
  }

  triggerTouchdown() {
    if (!this.initialized || this.isMuted) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.screechGain);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  /**
   * Update audio parameters from real-time flight telemetry
   * @param {Object} state - Flight state { rpm, iasKnots, aoaDeg, onGround }
   */
  update(state) {
    if (!this.initialized) return;

    const t = this.ctx.currentTime;
    const { rpm = 800, iasKnots = 0, aoaDeg = 0, onGround = true } = state;

    // 1. Engine RPM sound scaling (650 RPM to 2700 RPM)
    const normRpm = Math.min(Math.max((rpm - 600) / 2100, 0), 1);
    const fundamentalFreq = 25 + normRpm * 55;
    this.propOsc1.frequency.setTargetAtTime(fundamentalFreq, t, 0.05);
    this.propOsc2.frequency.setTargetAtTime(fundamentalFreq * 2, t, 0.05);

    const filterFreq = 180 + normRpm * 420;
    this.propFilter.frequency.setTargetAtTime(filterFreq, t, 0.08);

    const engineVol = 0.2 + normRpm * 0.5;
    this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : engineVol, t, 0.05);

    // 2. Wind Rush sound scaling
    const normSpeed = Math.min(Math.max(iasKnots / 160, 0), 1);
    const windVol = Math.pow(normSpeed, 1.6) * 0.45;
    const windFreq = 250 + normSpeed * 700;
    this.windGain.gain.setTargetAtTime(this.isMuted ? 0 : windVol, t, 0.1);
    this.windFilter.frequency.setTargetAtTime(windFreq, t, 0.1);

    // 3. Acoustic Stall Warning Horn (Alpha > 14 deg and airborne)
    const isStall = !onGround && aoaDeg >= 14.0 && iasKnots > 25;
    const stallVol = isStall ? 0.3 : 0.0;
    this.stallGain.gain.setTargetAtTime(this.isMuted ? 0 : stallVol, t, 0.03);

    // 4. Touchdown Wheel Screech detection
    if (!this.lastWoW && onGround && iasKnots > 35) {
      this.triggerTouchdown();
    }
    this.lastWoW = onGround;
  }
}
