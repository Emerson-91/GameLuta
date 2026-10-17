// Audio Synthesizer for Animal Kombat
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
