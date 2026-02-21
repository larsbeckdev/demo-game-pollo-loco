export default class Collectable {
  constructor({ x = 0, y = 0, w = 40, h = 40 } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.collected = false;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update() {}

  draw(ctx, cameraX = 0) {
    // override in subclasses
  }

  onCollect(world) {
    // override
    this.collected = true;
  }
}
