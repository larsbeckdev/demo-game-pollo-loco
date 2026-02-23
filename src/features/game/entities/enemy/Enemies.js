/* ============================================================================
  Enemies.js
  ----------------------------------------------------------------------------
  Single-file enemy module:
  - FrameAnimation
  - Helper (makeFramePaths)
  - EnemyBase
  - Enemy Types: ChickenNormal, ChickenSmall, BossChicken
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
    this.acc = 0;

    this._dbg = {
      enabled: true,
      id: Math.random().toString(16).slice(2, 6),
    };

    if (this._dbg.enabled) {
      console.log(`[FrameAnim#${this._dbg.id}] INIT`, {
        frames: paths.length,
        fps,
        loop,
        holdLast,
        sample: paths[0],
      });
    }
  }

  reset() {
    this.frame = 0;
    this.acc = 0;

    if (this._dbg.enabled) {
      console.log(`[FrameAnim#${this._dbg.id}] RESET`);
    }
  }

  update(dt) {
    if (this.images.length <= 1) return;

    const frameTime = 60 / this.fps;
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;

      const next = this.frame + 1;

      if (next >= this.images.length) {
        if (this.loop) {
          this.frame = 0;
          if (this._dbg.enabled) {
            console.log(`[FrameAnim#${this._dbg.id}] LOOP`);
          }
        } else {
          this.frame = this.holdLast ? this.images.length - 1 : 0;
        }
      } else {
        this.frame = next;
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

    // Animation
    walkPaths = [],
    walkFps = 8,

    // Death (static image)
    deadImageSrc = null,

    // Optional removal after death (if you want cleanup)
    deathLifetime = 999999, // dt-units
  } = {}) {
    this.x = x;
    this.y = groundY; // ground line

    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.w = this.baseWidth * scale;
    this.h = this.baseHeight * scale;

    this.speed = speed;
    this.direction = direction;

    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;

    this.alive = true;
    this.markedForRemoval = false;

    this.walkAnim = new FrameAnimation(walkPaths, walkFps, { loop: true });

    this.deadImg = null;
    if (deadImageSrc) {
      this.deadImg = new Image();
      this.deadImg.src = deadImageSrc;
    }

    this.deathTimer = 0;
    this.deathLifetime = deathLifetime;

    // Debug
    this._dbg = {
      enabled: true,
      id: Math.random().toString(16).slice(2, 6),
      lastDirection: this.direction,
      lastAlive: this.alive,
      lastMoveLog: 0,
    };

    if (this._dbg.enabled) {
      console.log(`[Enemy#${this._dbg.id}] SPAWN`, {
        x: this.x,
        groundY: this.y,
        speed: this.speed,
        patrolMinX: this.patrolMinX,
        patrolMaxX: this.patrolMaxX,
      });
    }
  }

  update(dt) {
    if (!this.alive) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathLifetime) this.markedForRemoval = true;
      return;
    }

    this.x += this.speed * this.direction * dt;

    if (this.patrolMinX !== null && this.x < this.patrolMinX)
      this.direction = 1;
    if (this.patrolMaxX !== null && this.x > this.patrolMaxX)
      this.direction = -1;

    this.walkAnim.update(dt);
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    // dead
    if (!this.alive && this.deadImg) {
      ctx.drawImage(this.deadImg, screenX, drawY, this.w, this.h);
      ctx.restore();
      return;
    }

    const img = this.walkAnim.image;

    // flip when going right
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
      deathLifetime: 120, // optional
    });
  }
}

class ChickenSmall extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 0.5,
    patrolMinX = null,
    patrolMaxX = null,
  } = {}) {
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
      deathLifetime: 120, // optional
    });
  }
}

/* ----------------------------------------------------------------------------
  BossChicken
  - Assets based on your folder /images/4_enemie_boss_chicken
  - For now we use:
    - walk: 1_walk/G1..G4.png
    - dead: 5_dead/G26.png (last frame)
  - alert/attack/hurt are there, but not used until we add states
---------------------------------------------------------------------------- */

class BossChicken extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 1.0,
    patrolMinX = null,
    patrolMaxX = null,
  } = {}) {
    const base = "/images/4_enemie_boss_chicken";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "G1.png",
      "G2.png",
      "G3.png",
      "G4.png",
    ]);

    super({
      x,
      groundY,
      scale,
      baseWidth: 250,
      baseHeight: 250,
      speed: 0.8,
      direction: -1,
      patrolMinX,
      patrolMaxX,
      walkPaths,
      walkFps: 6,
      deadImageSrc: `${base}/5_dead/G26.png`,
      deathLifetime: 240, // optional
    });

    // Boss stats (optional)
    this.maxHp = 5;
    this.hp = 5;

    // Sequences available (not used yet, but paths are correct)
    this._bossSequences = {
      alert: makeFramePaths(`${base}/2_alert`, [
        "G5.png",
        "G6.png",
        "G7.png",
        "G8.png",
        "G9.png",
        "G10.png",
        "G11.png",
        "G12.png",
      ]),
      attack: makeFramePaths(`${base}/3_attack`, [
        "G13.png",
        "G14.png",
        "G15.png",
        "G16.png",
        "G17.png",
        "G18.png",
        "G19.png",
        "G20.png",
      ]),
      hurt: makeFramePaths(`${base}/4_hurt`, ["G21.png", "G22.png", "G23.png"]),
      deadFrames: makeFramePaths(`${base}/5_dead`, [
        "G24.png",
        "G25.png",
        "G26.png",
      ]),
    };
  }

  takeHit(damage = 1) {
    if (!this.alive) return;

    this.hp -= damage;

    if (this.hp <= 0) {
      this.kill();
    }
  }
}

/* ============================================================================
  Exports
============================================================================ */

export { EnemyBase, ChickenNormal, ChickenSmall, BossChicken, makeFramePaths };
