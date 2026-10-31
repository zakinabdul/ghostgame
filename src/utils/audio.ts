/**
 * Retro Chiptune Web Audio Synthesizer for PUMPKIN – The Haunted Maze
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  
  public sfxMuted: boolean = false;
  public bgmMuted: boolean = false;
  public sfxVolume: number = 0.6;
  public bgmVolume: number = 0.35;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policy
    try {
      const saved = localStorage.getItem('pumpkin_sound_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.sfxMuted = !!parsed.sfxMuted;
        this.bgmMuted = !!parsed.bgmMuted;
        if (typeof parsed.sfxVolume === 'number') this.sfxVolume = parsed.sfxVolume;
        if (typeof parsed.bgmVolume === 'number') this.bgmVolume = parsed.bgmVolume;
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmMuted ? 0 : this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem('pumpkin_sound_settings', JSON.stringify({
        sfxMuted: this.sfxMuted,
        bgmMuted: this.bgmMuted,
        sfxVolume: this.sfxVolume,
        bgmVolume: this.bgmVolume,
      }));
    } catch {
      // Ignore
    }
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setBgmMuted(muted: boolean) {
    this.bgmMuted = muted;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : this.bgmVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && !this.sfxMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx && !this.bgmMuted) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  // --- Retro Sound Effects ---

  /** Menu navigation click */
  public playMenuBeep(pitch: number = 440) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  /** Pumpkin collect sparkle */
  public playPumpkinCollect() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      
      gain.gain.setValueAtTime(0.2, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.13);
    });
  }

  /** Super pumpkin collect fanfare */
  public playSuperPumpkinCollect() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.22, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.22);
    });
  }

  /** Key collected chime */
  public playKeyPickup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const chords = [659.25, 830.61, 987.77, 1318.51]; // E major glockenspiel
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.38);
    });
  }

  /** Gate unlocked / stone slide */
  public playGateOpen() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    // Low stone rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.65);

    // Chime unlock accent
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(880, now + 0.1);
    chime.frequency.setValueAtTime(1174.66, now + 0.25);
    chimeGain.gain.setValueAtTime(0.2, now + 0.1);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(now + 0.1);
    chime.stop(now + 0.6);
  }

  /** Player hit / hurt crunch */
  public playPlayerHurt() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /** Powerup potion chime */
  public playPowerup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const freqs = [330, 440, 550, 660, 880];
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.05);

      gain.gain.setValueAtTime(0.2, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.2);
    });
  }

  /** Spike trap activate */
  public playSpikeTrap() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Ghost eerie wail / hover nearby */
  public playGhostWail() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    // Vibrato
    osc.frequency.linearRampToValueAtTime(587.33, now + 0.25);
    osc.frequency.linearRampToValueAtTime(370, now + 0.55);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  /** Level complete fanfare */
  public playLevelComplete() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const tune = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.2 },  // C6
      { f: 880.0, d: 0.12 },  // A5
      { f: 1046.5, d: 0.4 },  // C6
    ];

    let t = now;
    tune.forEach(note => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d + 0.03;
    });
  }

  /** Game over sorrowful theme */
  public playGameOver() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.sfxMuted) return;

    const now = this.ctx.currentTime;
    const chords = [
      { f: 440, d: 0.3 },   // A4
      { f: 415.3, d: 0.3 }, // Ab4
      { f: 392, d: 0.3 },   // G4
      { f: 349.23, d: 0.7 } // F4
    ];

    let t = now;
    chords.forEach(n => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + n.d + 0.05);

      t += n.d + 0.04;
    });
  }

  // --- Background Eerie Chiptune Loop ---

  public startBgm() {
    this.initCtx();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleBgmTick();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleBgmTick() {
    if (!this.isBgmPlaying) return;
    this.playNextBgmNote();
    // 160ms step = ~94 BPM 16th note spooky groove
    this.bgmTimer = window.setTimeout(() => this.scheduleBgmTick(), 175);
  }

  private playNextBgmNote() {
    if (!this.ctx || !this.bgmGain || this.bgmMuted) {
      this.bgmStep = (this.bgmStep + 1) % 64;
      return;
    }

    const now = this.ctx.currentTime;
    const step = this.bgmStep;

    // Spooky Halloween minor scale: D minor / harmonic minor (D, E, F, G, A, Bb, C#)
    const melodyPattern = [
      // Bar 1 (0-15)
      293.66, 0, 349.23, 0, 440.0, 0, 466.16, 440.0,
      349.23, 0, 293.66, 0, 277.18, 0, 293.66, 0,
      // Bar 2 (16-31)
      440.0, 0, 466.16, 0, 554.37, 0, 587.33, 0,
      554.37, 466.16, 440.0, 0, 349.23, 293.66, 277.18, 0,
      // Bar 3 (32-47)
      220.0, 0, 261.63, 0, 293.66, 0, 349.23, 0,
      329.63, 0, 261.63, 0, 246.94, 0, 220.0, 0,
      // Bar 4 (48-63)
      293.66, 349.23, 440.0, 523.25, 587.33, 0, 554.37, 0,
      440.0, 0, 349.23, 0, 277.18, 0, 293.66, 0,
    ];

    // Bass line on 8th notes
    const bassPattern = [
      146.83, 0, 146.83, 0, 174.61, 0, 138.59, 0,
      146.83, 0, 146.83, 0, 174.61, 0, 138.59, 0,
      110.0, 0, 110.0, 0, 130.81, 0, 123.47, 0,
      146.83, 0, 146.83, 0, 138.59, 0, 146.83, 0,
    ];

    // Play melody note
    const melFreq = melodyPattern[step % melodyPattern.length];
    if (melFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = (step % 8 === 0 || step % 8 === 4) ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(melFreq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(now);
      osc.stop(now + 0.17);
    }

    // Play bass note
    const bassFreq = bassPattern[(Math.floor(step / 2)) % bassPattern.length];
    if (step % 2 === 0 && bassFreq > 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.14, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.3);
    }

    // Spooky dungeon heartbeat / noise tap on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(80, now);
      kickOsc.frequency.exponentialRampToValueAtTime(25, now + 0.08);

      kickGain.gain.setValueAtTime(0.15, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.1);
    }

    this.bgmStep = (this.bgmStep + 1) % melodyPattern.length;
  }
}

export const soundEngine = new SoundEngine();
