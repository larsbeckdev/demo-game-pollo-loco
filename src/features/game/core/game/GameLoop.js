// Manages requestAnimationFrame loop + delta time
export default class GameLoop {
  constructor({ onTick }) {
    this.onTick = onTick;
    this.running = false;
    this.rafId = null;
    this.lastTs = 0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTs = 0;

    const loop = (ts) => {
      if (!this.running) return;

      const dt = this.lastTs ? (ts - this.lastTs) / 16.67 : 1; // 1 = ~60fps
      this.lastTs = ts;

      this.onTick(dt);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}
