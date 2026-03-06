export default class SoundManager {
  constructor() {
    this.sounds = {}; // key -> { src, volume, audio? }
    this.muted = false; // ✅ global mute
    this.masterVolume = 1; // ✅ optional global volume (0..1)
  }

  setMuted(value) {
    this.muted = !!value;

    // falls Audios schon existieren: direkt anwenden
    for (const s of Object.values(this.sounds)) {
      if (!s?.audio) continue;
      s.audio.muted = this.muted;
      s.audio.volume = this.muted ? 0 : (s.volume ?? 1) * this.masterVolume;
    }
  }

  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, Number(value) || 1));
    // direkt anwenden
    for (const s of Object.values(this.sounds)) {
      if (!s?.audio) continue;
      s.audio.volume = this.muted ? 0 : (s.volume ?? 1) * this.masterVolume;
    }
  }

  register(key, src, opts = {}) {
    this.sounds[key] = {
      src,
      volume: opts.volume ?? 1,
      loop: !!opts.loop,
      audio: null,
    };
  }

  play(key) {
    const s = this.sounds[key];
    if (!s) return;

    // Audio lazy anlegen
    if (!s.audio) {
      s.audio = new Audio(s.src);
      s.audio.preload = "auto";
    }

    // ✅ wichtig: JEDES play wendet mute + volume an
    s.audio.loop = !!s.loop;
    s.audio.muted = this.muted;
    s.audio.volume = this.muted ? 0 : (s.volume ?? 1) * this.masterVolume;

    // optional: immer von vorne starten
    try {
      s.audio.currentTime = 0;
    } catch {}

    s.audio.play?.().catch(() => {});
  }

  stop(key) {
    const s = this.sounds[key];
    if (!s?.audio) return;
    s.audio.pause?.();
    try {
      s.audio.currentTime = 0;
    } catch {}
  }

  stopAll() {
    for (const k of Object.keys(this.sounds)) this.stop(k);
  }
}
