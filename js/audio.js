// Audio Synthesizer for Super Fighters Combat
// Uses Web Audio API for zero-latency, arcade-style sound effects & dynamic retro BGM

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.bgmTimer = null;
    this.bgmBeat = 0;
    this.bgmTempo = 135; // BPM
    this.isPlayingBgm = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  // Light Punch / Slash
  playHitLight() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Heavy Punch / Kick (Bone-crunching impact)
  playHitHeavy() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    
    // Low impact boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);

    // Noise crack
    this.playNoise(0.12, 0.4, 800);
  }

  // Hit sound helper (light / heavy)
  playHit(heavy = false) {
    if (heavy) {
      this.playHitHeavy();
    } else {
      this.playHitLight();
    }
  }

  // Blocked hit thud
  playBlock() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.07);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Attack whoosh
  playWhoosh() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Fireball / Projectile launch
  playProjectile() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Special move roar / shout
  playSpecial() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(580, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.35);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Super Move Activation (Dramatic freeze & power charge)
  playSuperActivate() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    
    // Ascending power sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.6);

    // Deep sub bass explosion
    setTimeout(() => {
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(120, t2);
      sub.frequency.exponentialRampToValueAtTime(30, t2 + 0.6);
      subG.gain.setValueAtTime(0.7, t2);
      subG.gain.exponentialRampToValueAtTime(0.01, t2 + 0.6);
      sub.connect(subG);
      subG.connect(this.ctx.destination);
      sub.start(t2);
      sub.stop(t2 + 0.6);
    }, 200);
  }

  // Dragon Fire Breath Continuous Sound
  playDragonFire() {
    if (!this.sfxEnabled) return;
    this.playNoise(0.5, 0.45, 450);
  }

  // Knockout gong / dramatic thud
  playKO() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    
    // Slow deep gong
    [110, 165, 220, 275].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.4 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.8);
    });

    this.playNoise(0.4, 0.5, 300);
  }

  // --- Electric Guitar Synthesizer (Overdrive / Amp Distortion) ---
  getDistortionCurve(amount = 50) {
    if (this._distCurve && this._distAmount === amount) return this._distCurve;
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    this._distCurve = curve;
    this._distAmount = amount;
    return curve;
  }

  playGuitarNote(freq, startTime, duration = 0.4, volume = 0.35, bendTo = null, vibrato = false) {
    if (!this.ctx || !this.sfxEnabled) return;
    const t = startTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    if (bendTo) {
      osc.frequency.exponentialRampToValueAtTime(bendTo, t + duration * 0.7);
    }

    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(6.5, t);
      lfoGain.gain.setValueAtTime(freq * 0.035, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t + duration * 0.2);
      lfo.stop(t + duration);
    }

    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.getDistortionCurve(45);
    shaper.oversample = '4x';

    const cabFilter = this.ctx.createBiquadFilter();
    cabFilter.type = 'lowpass';
    cabFilter.frequency.setValueAtTime(3200, t);

    const midBoost = this.ctx.createBiquadFilter();
    midBoost.type = 'peaking';
    midBoost.frequency.setValueAtTime(1400, t);
    midBoost.gain.setValueAtTime(6, t);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.setValueAtTime(volume * 0.9, t + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(shaper);
    shaper.connect(midBoost);
    midBoost.connect(cabFilter);
    cabFilter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Nata's Exclusive Electric Guitar Victory Riff & Solo
  // Only played when Nata wins the round!
  playNataGuitarVictory(stage = 'strum') {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    if (stage === 'prep') {
      // Plug-in cable click + amp hum crunch
      this.playHitLight();
      this.playNoise(0.08, 0.25, 1200);
    } else if (stage === 'chord') {
      // Crunchy opening power chord (E5)
      [164.8, 246.9, 329.6].forEach(f => {
        this.playGuitarNote(f, now, 0.35, 0.25);
      });
    } else if (stage === 'strum') {
      // Crunchy rock power chord strum progression (D5 -> E5 -> G5)
      const chords = [
        { freqs: [146.8, 220.0, 293.7], delay: 0.00, dur: 0.26 }, // D5
        { freqs: [164.8, 246.9, 329.6], delay: 0.16, dur: 0.26 }, // E5
        { freqs: [196.0, 293.7, 392.0], delay: 0.34, dur: 0.42 }, // G5
      ];
      chords.forEach(c => {
        c.freqs.forEach(f => {
          this.playGuitarNote(f, now + c.delay, c.dur, 0.22);
        });
      });
    } else if (stage === 'solo') {
      // Epic Rock Solo Lick! Screaming high notes with bends, vibrato and final power chord sustain
      const soloNotes = [
        { f: 587.3, d: 0.00, dur: 0.16, bend: null, vib: false },       // D5
        { f: 659.3, d: 0.14, dur: 0.18, bend: null, vib: false },       // E5
        { f: 783.9, d: 0.30, dur: 0.24, bend: 880.0, vib: true },       // G5 bend to A5
        { f: 880.0, d: 0.52, dur: 0.22, bend: null, vib: false },       // A5
        { f: 987.8, d: 0.72, dur: 0.26, bend: 1046.5, vib: true },      // B5 bend to C6
        { f: 1174.7, d: 0.96, dur: 0.32, bend: 1318.5, vib: true },     // D6 bend to E6 high solo!
      ];
      soloNotes.forEach(n => {
        this.playGuitarNote(n.f, now + n.d, n.dur, 0.28, n.bend, n.vib);
      });

      // Huge sustained triumphant E power chord backing the solo crescendo!
      const powerChord = [164.8, 246.9, 329.6, 659.3];
      powerChord.forEach(f => {
        this.playGuitarNote(f, now + 1.25, 1.8, 0.32, null, true);
      });
    }
  }

  // --- Brass and Chime Synthesizer for Celebrations ---
  playBrassNote(freq, startTime, duration = 0.4, volume = 0.28, isTrumpet = true) {
    if (!this.ctx || !this.sfxEnabled) return;
    const t = startTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isTrumpet ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    // Warm brass filter envelope: opens swiftly on attack, settles slightly on sustain
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(isTrumpet ? 3200 : 1800, t + 0.04);
    filter.frequency.exponentialRampToValueAtTime(isTrumpet ? 2400 : 1200, t + duration * 0.5);

    // Volume envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.03);
    gain.gain.setValueAtTime(volume * 0.85, t + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  playChimeNote(freq, startTime, duration = 0.6, volume = 0.18) {
    if (!this.ctx || !this.sfxEnabled) return;
    const t = startTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Subtle overtone for bell clarity
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, t);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Unicão's Exclusive Graduation "CONGRATULATIONS!" Fanfare
  // ONLY played when Unicão wins the round!
  playUnicaoCongratulations(stage = 'fanfare') {
    if (!this.sfxEnabled) return;
    this.init();
    const now = this.ctx.currentTime;

    if (stage === 'robe') {
      // Gentle ceremonial prelude chord as Unicão puts on his graduation gown
      [130.8, 196.0, 261.6].forEach(f => { // C3, G3, C4
        this.playBrassNote(f, now, 0.45, 0.22, false);
      });
    } else if (stage === 'cap') {
      // Mortarboard cap placement: ascending sparkling chime flourish
      const chimes = [523.3, 659.3, 783.9, 1046.5]; // C5, E5, G5, C6
      chimes.forEach((f, idx) => {
        this.playChimeNote(f, now + idx * 0.08, 0.5, 0.16);
      });
    } else if (stage === 'scroll') {
      // Receiving diploma scroll: noble brass swell
      const swellNotes = [
        { f: 174.6, d: 0.00, dur: 0.4 }, // F3
        { f: 220.0, d: 0.08, dur: 0.4 }, // A3
        { f: 261.6, d: 0.16, dur: 0.45 }, // C4
        { f: 349.2, d: 0.24, dur: 0.5 }, // F4
      ];
      swellNotes.forEach(n => {
        this.playBrassNote(n.f, now + n.d, n.dur, 0.24, true);
      });
    } else if (stage === 'fanfare' || stage === 'full') {
      // GRAND CONGRATULATIONS FANFARE!
      // Triumphant trumpet fanfare melody (Ta-da-da-DAAA!)
      const fanfareMelody = [
        { f: 392.0, d: 0.00, dur: 0.15 }, // G4
        { f: 523.3, d: 0.16, dur: 0.15 }, // C5
        { f: 659.3, d: 0.32, dur: 0.15 }, // E5
        { f: 783.9, d: 0.48, dur: 0.32 }, // G5
        { f: 698.5, d: 0.82, dur: 0.14 }, // F5
        { f: 880.0, d: 0.98, dur: 0.14 }, // A5
        { f: 987.8, d: 1.14, dur: 0.16 }, // B5
        { f: 1046.5, d: 1.32, dur: 1.80 }  // High Triumphant C6!
      ];
      fanfareMelody.forEach(m => {
        this.playBrassNote(m.f, now + m.d, m.dur, 0.30, true);
      });

      // Majestic Brass Harmony Chords
      // 1. C Major
      [130.8, 196.0, 261.6, 329.6].forEach(f => {
        this.playBrassNote(f, now, 0.45, 0.20, false);
      });
      // 2. F Major
      [174.6, 220.0, 261.6, 349.2].forEach(f => {
        this.playBrassNote(f, now + 0.82, 0.30, 0.20, false);
      });
      // 3. G Major
      [196.0, 246.9, 293.7, 392.0].forEach(f => {
        this.playBrassNote(f, now + 1.14, 0.20, 0.22, false);
      });
      // 4. Grand Final Sustained C Major Chord!
      [130.8, 261.6, 329.6, 392.0, 523.3, 659.3].forEach(f => {
        this.playBrassNote(f, now + 1.32, 2.0, 0.26, false);
      });

      // Celebratory Cascading Glockenspiel / Star Chimes during victory climax
      const starChimes = [
        { f: 1046.5, d: 1.36 }, // C6
        { f: 1318.5, d: 1.48 }, // E6
        { f: 1567.9, d: 1.60 }, // G6
        { f: 1975.5, d: 1.72 }, // B6
        { f: 2093.0, d: 1.84 }, // C7
        { f: 2637.0, d: 1.96 }, // E7
        { f: 3135.9, d: 2.10 }  // G7 super sparkle
      ];
      starChimes.forEach(sc => {
        this.playChimeNote(sc.f, now + sc.d, 0.7, 0.18);
      });
    }
  }


  // Round start bell
  playRoundStart() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  // UI Selection sound
  playSelect() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.setValueAtTime(780, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // UI Confirmation sound
  playConfirm() {
    if (!this.sfxEnabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.setValueAtTime(440, t + 0.06);
    osc.frequency.setValueAtTime(660, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // White noise generator for explosions, fire, bone impact
  playNoise(duration = 0.2, volume = 0.3, filterFreq = 1000) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // --- Dynamic Arcade Fight BGM Synthesizer ---
  startBgm() {
    if (!this.musicEnabled || this.isPlayingBgm) return;
    this.init();
    this.isPlayingBgm = true;
    this.bgmBeat = 0;

    const stepInterval = (60 / this.bgmTempo) * 1000 / 4; // 16th notes
    
    // Bassline notes (D minor / F / C / A# driving fighting riff)
    const bassRiff = [
      73.4, 73.4, 146.8, 73.4,  // D2, D2, D3, D2
      73.4, 110.0, 73.4, 130.8, // D2, A2, D2, C3
      65.4, 65.4, 130.8, 65.4,  // C2, C2, C3, C2
      58.3, 58.3, 116.5, 65.4   // Bb1, Bb1, Bb2, C2
    ];

    const leadRiff = [
      293.7, 0, 349.2, 0, 440.0, 0, 392.0, 0, // D4, F4, A4, G4
      349.2, 329.6, 293.7, 0, 220.0, 0, 261.6, 0
    ];

    this.bgmTimer = setInterval(() => {
      if (!this.musicEnabled || !this.isPlayingBgm) return;
      const t = this.ctx.currentTime;
      const step = this.bgmBeat % 16;
      
      // Kick drum on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickG = this.ctx.createGain();
        kick.frequency.setValueAtTime(140, t);
        kick.frequency.exponentialRampToValueAtTime(35, t + 0.1);
        kickG.gain.setValueAtTime(0.35, t);
        kickG.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        kick.connect(kickG);
        kickG.connect(this.ctx.destination);
        kick.start(t);
        kick.stop(t + 0.1);
      }

      // Snare on beats 4, 12
      if (step === 4 || step === 12) {
        this.playNoise(0.09, 0.18, 1800);
      }

      // Hi-hat on every odd 16th note
      if (step % 2 !== 0) {
        this.playNoise(0.03, 0.08, 4000);
      }

      // Bass synth
      const bassFreq = bassRiff[step];
      if (bassFreq > 0) {
        const bass = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(bassFreq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        bassG.gain.setValueAtTime(0.18, t);
        bassG.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

        bass.connect(filter);
        filter.connect(bassG);
        bassG.connect(this.ctx.destination);

        bass.start(t);
        bass.stop(t + 0.14);
      }

      // Lead Melody synth
      const leadFreq = leadRiff[step];
      if (leadFreq > 0 && Math.floor(this.bgmBeat / 16) % 2 === 1) {
        const lead = this.ctx.createOscillator();
        const leadG = this.ctx.createGain();
        lead.type = 'square';
        lead.frequency.setValueAtTime(leadFreq, t);
        leadG.gain.setValueAtTime(0.1, t);
        leadG.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        lead.connect(leadG);
        leadG.connect(this.ctx.destination);
        lead.start(t);
        lead.stop(t + 0.18);
      }

      this.bgmBeat++;
    }, stepInterval);
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.musicEnabled;
  }
}

window.soundEngine = new SoundEngine();
