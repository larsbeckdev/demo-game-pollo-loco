// core/audio/SoundManager.js
export default class SoundManager {
  constructor() {
    this.sounds = new Map();
  }

  register(key, src, { volume = 1 } = {}) {
    const a = new Audio(src);
    a.volume = volume;
    a.preload = "auto";
    this.sounds.set(key, a);
  }

  play(key) {
    const base = this.sounds.get(key);
    if (!base) return;

    // ✅ Clone erlaubt Overlap (coin-collect spam, hits, etc.)
    const a = base.cloneNode(true);
    a.volume = base.volume;
    a.play().catch(() => {});
  }

  // optional: falls du später alles stummschalten willst
  setVolumeAll(v) {
    for (const a of this.sounds.values()) a.volume = v;
  }
}
