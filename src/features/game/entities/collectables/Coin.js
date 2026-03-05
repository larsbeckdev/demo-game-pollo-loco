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
    const padding = 18;
    return {
      x: this.x + padding,
      y: this.y + padding,
      w: this.w - 2 * padding,
      h: this.h - 2 * padding,
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

    const x = this.x - cameraX;
    const y = this.y;

    if (this.img?.complete) {
      ctx.drawImage(this.img, x, y, this.w, this.h);
    }
  }

  /* ==========================================================================
    On Collect
  ========================================================================== */

  onCollect(world) {
    if (this.collected) return;

    this.collected = true;

    world.stats?.addCoin?.();

    const THROW_COST = 4; // muss zu ThrowSystem passen
    const THROWS_PER_COIN = 4; // du willst 4 Würfe pro Coin
    world.stats?.addBottle?.(THROW_COST * THROWS_PER_COIN); // => 16

    world.sound?.play?.("coin");
  }
}
