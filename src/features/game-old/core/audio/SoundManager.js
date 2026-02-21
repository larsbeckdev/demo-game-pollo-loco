export default class SoundManager {
  constructor() {
    this.sounds = new Map();
  }

  register(key, src, { volume = 1 } = {}) {
    const a = new Audio(src);
    a.volume = volume;
    this.sounds.set(key, a);
  }

  play(key) {
    const a = this.sounds.get(key);
    if (!a) return;

    // allow rapid re-trigger
    a.currentTime = 0;
    a.play().catch(() => {});
  }
}
