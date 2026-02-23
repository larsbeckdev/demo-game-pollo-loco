/* ============================================================================
  Enemies.js
  ----------------------------------------------------------------------------
  Single-file enemy module:
  - FrameAnimation
  - Helpers (makeFramePaths, rangeFrames)
  - EnemyBase
  - Concrete enemy types: ChickenNormal, ChickenSmall, Boss
  - Optional factory: createEnemy
============================================================================ */

/* ============================================================================
  FrameAnimation
============================================================================ */

class FrameAnimation {
  constructor(paths, fps = 8, { loop = true, holdLast = false } = {}) {
    this.images = paths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    this.fps = fps;
    this.loop = loop;
    this.holdLast = holdLast;

    this.frame = 0;
    this.acc = 0; // dt-units (bei dir: dt ~ 1 bei 60fps)
  }

  reset() {
    this.frame = 0;
    this.acc = 0;
  }

  update(dt) {
    if (this.images.length <= 1) return;

    const frameTime = 60 / this.fps;
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;

      const nextFrame = this.frame + 1;

      if (nextFrame >= this.images.length) {
        if (this.loop) {
          this.frame = 0;
        } else {
          this.frame = this.holdLast ? this.images.length - 1 : 0;
        }
      } else {
        this.frame = nextFrame;
      }
    }
  }

  get image() {
    return this.images[this.frame];
  }
}

/* ============================================================================
  Helpers
============================================================================ */

function makeFramePaths(base, names) {
  return names.map((name) => `${base}/${name}`);
}

function rangeFrames(prefix, from, to, suffix = ".png") {
  const names = [];
  for (let i = from; i <= to; i++) {
    names.push(`${prefix}${i}${suffix}`);
  }
  return names;
}

/* ============================================================================
  EnemyBase
============================================================================ */

class EnemyBase {
  constructor({
    x = 0,
    groundY = 0,

    // Visuals
    scale = 0.5,
    baseWidth = 80,
    baseHeight = 80,

    // Movement
    speed = 1.2,
    direction = -1,

    // Patrol
    patrolMinX = null,
    patrolMaxX = null,

    // Animations
    walkPaths = [],
    walkFps = 8,

    // Death
    deadImageSrc = null,
    deathLifetime = 120, // dt-units (~2s)
  } = {}) {
    // Position (y is ground line)
    this.x = x;
    this.y = groundY;

    // Size
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.w = this.baseWidth * scale;
    this.h = this.baseHeight * scale;

    // Movement
    this.speed = speed;
    this.direction = direction;

    // Patrol
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;

    // State
    this.alive = true;
    this.markedForRemoval = false;

    // Animations
    this.walkAnim = new FrameAnimation(walkPaths, walkFps, { loop: true });

    // Dead image
    this.deadImg = null;
    if (deadImageSrc) {
      this.deadImg = new Image();
      this.deadImg.src = deadImageSrc;
    }

    // Death timer
    this.deathTimer = 0;
    this.deathLifetime = deathLifetime;
  }

  update(dt) {
    // Dead -> count down -> remove
    if (!this.alive) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathLifetime) this.markedForRemoval = true;
      return;
    }

    // Walk
    this.x += this.speed * this.direction * dt;

    // Patrol flip
    if (this.patrolMinX !== null && this.x < this.patrolMinX)
      this.direction = 1;
    if (this.patrolMaxX !== null && this.x > this.patrolMaxX)
      this.direction = -1;

    // Animate
    this.walkAnim.update(dt);
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    // Dead
    if (!this.alive && this.deadImg) {
      ctx.drawImage(this.deadImg, screenX, drawY, this.w, this.h);
      ctx.restore();
      return;
    }

    // Walk frame
    const img = this.walkAnim.image;

    // Flip when going right
    if (this.direction === 1) {
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(img, screenX, drawY, this.w, this.h);
    }

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.deathTimer = 0;
  }
}

/* ============================================================================
  Enemy Types
============================================================================ */

/* ----------------------------------------------------------------------------
  ChickenNormal
  - uses /images/3_enemies_chicken/chicken_normal
---------------------------------------------------------------------------- */

class ChickenNormal extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 0.5,
    patrolMinX = null,
    patrolMaxX = null,
  } = {}) {
    const base = "/images/3_enemies_chicken/chicken_normal";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "1_w.png",
      "2_w.png",
      "3_w.png",
    ]);

    super({
      x,
      groundY,
      scale,
      baseWidth: 80,
      baseHeight: 80,
      speed: 1.2,
      direction: -1,

      patrolMinX,
      patrolMaxX,

      walkPaths,
      walkFps: 8,
      deadImageSrc: `${base}/2_dead/dead.png`,
      deathLifetime: 120,
    });
  }
}

/* ----------------------------------------------------------------------------
  ChickenSmall
  - placeholder: adjust paths + size to your asset folder
  - If you don’t have assets yet, this still won’t crash if you don’t spawn it.
---------------------------------------------------------------------------- */

class ChickenSmall extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 0.5,
    patrolMinX = null,
    patrolMaxX = null,
  } = {}) {
    // NOTE: change path to your real folder when you add assets
    const base = "/images/3_enemies_chicken/chicken_small";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "1_w.png",
      "2_w.png",
      "3_w.png",
    ]);

    super({
      x,
      groundY,
      scale,
      baseWidth: 80,
      baseHeight: 80,
      speed: 1.6,
      direction: -1,

      patrolMinX,
      patrolMaxX,

      walkPaths,
      walkFps: 10,
      deadImageSrc: `${base}/2_dead/dead.png`,
      deathLifetime: 120,
    });
  }
}

/* ----------------------------------------------------------------------------
  Boss
  - placeholder skeleton (you can extend with states later)
---------------------------------------------------------------------------- */

class Boss extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 1.0,
    patrolMinX = null,
    patrolMaxX = null,
  } = {}) {
    // NOTE: change path to your real boss folder when you add assets
    const base = "/images/4_enemies_boss/boss";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "1.png",
      "2.png",
      "3.png",
      "4.png",
    ]);

    super({
      x,
      groundY,
      scale,
      baseWidth: 200,
      baseHeight: 200,
      speed: 0.8,
      direction: -1,

      patrolMinX,
      patrolMaxX,

      walkPaths,
      walkFps: 6,
      deadImageSrc: `${base}/2_dead/dead.png`,
      deathLifetime: 180,
    });

    // Boss-specific
    this.maxHp = 5;
    this.hp = 5;
  }

  takeHit(dmg = 1) {
    if (!this.alive) return;
    this.hp -= dmg;
    if (this.hp <= 0) this.kill();
  }
}

/* ============================================================================
  Optional Factory
============================================================================ */

function createEnemy(type, options) {
  switch (type) {
    case "chickenNormal":
      return new ChickenNormal(options);
    case "chickenSmall":
      return new ChickenSmall(options);
    case "boss":
      return new Boss(options);
    default:
      return new ChickenNormal(options);
  }
}

/* ============================================================================
  Exports
============================================================================ */

export {
  // helpers
  makeFramePaths,
  rangeFrames,

  // base
  EnemyBase,

  // types
  ChickenNormal,
  ChickenSmall,
  Boss,

  // factory
  createEnemy,
};
