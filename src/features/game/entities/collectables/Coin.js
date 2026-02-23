/* ============================================================================
  Coin
  ----------------------------------------------------------------------------
  Simple collectible coin entity

  Responsibilities:
  - Holds position and size
  - Renders itself
  - Handles collection logic
============================================================================ */

export default class Coin {
  constructor({ x = 0, y = 0 } = {}) {
    // Position
    this.x = x;
    this.y = y;

    // Size
    this.w = 70;
    this.h = 70;

    // State
    this.collected = false;

    // Image
    this.img = new Image();
    this.img.src = "/images/8_coin/coin_1.png";
  }

  /* ==========================================================================
    Bounding Box (used by CollisionSystem)
  ========================================================================== */

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  /* ==========================================================================
    Update
    - Optional (animation later)
  ========================================================================== */

  update() {
    // currently no animation
  }

  /* ==========================================================================
    Draw
  ========================================================================== */

  draw(ctx, cameraX = 0) {
    if (this.collected) return;

    ctx.drawImage(this.img, this.x - cameraX, this.y, this.w, this.h);
  }

  /* ==========================================================================
    On Collect
  ========================================================================== */

  onCollect(world) {
    if (this.collected) return;

    this.collected = true;

    world.stats?.addCoin?.(1);
    world.sound?.play?.("coin");
  }
}
