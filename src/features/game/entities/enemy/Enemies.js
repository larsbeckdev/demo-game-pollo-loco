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
    this.acc = 0; // dt-units (bei dir: dt ~ 1 bei 60fps)

    // =====================================================
    // DEBUG (spam-safe)
    // =====================================================
    this._dbg = {
      enabled: true, // <- ausschalten für Ruhe
      id: Math.random().toString(16).slice(2, 6),
      lastLoopLogAt: 0,
    };

    if (this._dbg.enabled) {
      console.log(`[FrameAnim#${this._dbg.id}] INIT`, {
        frames: paths.length,
        fps: this.fps,
        loop: this.loop,
        holdLast: this.holdLast,
        sample: paths[0],
      });

      if (!paths.length) {
        console.warn(`[FrameAnim#${this._dbg.id}] WARNING: 0 frames`);
      }
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

          // loop log throttled (max 1x / 2s)
          if (this._dbg.enabled) {
            const now = performance.now();
            if (now - this._dbg.lastLoopLogAt > 2000) {
              console.log(`[FrameAnim#${this._dbg.id}] LOOP`);
              this._dbg.lastLoopLogAt = now;
            }
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

    // =====================================================
    // DEBUG (spam-safe)
    // =====================================================
    this._dbg = {
      enabled: true, // <- ausschalten für Ruhe
      id: Math.random().toString(16).slice(2, 6),
      lastDirection: this.direction,
      lastMoveLogAt: 0,
      lastDrawSkipAt: 0,
      lastRemovalLogAt: 0,
    };

    if (this._dbg.enabled) {
      console.log(`[Enemy#${this._dbg.id}] SPAWN`, {
        x: this.x,
        groundY: this.y,
        w: this.w,
        h: this.h,
        speed: this.speed,
        direction: this.direction,
        patrolMinX: this.patrolMinX,
        patrolMaxX: this.patrolMaxX,
        deathLifetime: this.deathLifetime,
        deadImageSrc,
      });
    }
  }

  update(dt) {
    // dead state
    if (!this.alive) {
      this.deathTimer += dt;

      if (this.deathTimer >= this.deathLifetime) {
        this.markedForRemoval = true;

        if (this._dbg.enabled) {
          const now = performance.now();
          if (now - this._dbg.lastRemovalLogAt > 1000) {
            console.log(`[Enemy#${this._dbg.id}] MARKED FOR REMOVAL`, {
              deathTimer: Number(this.deathTimer.toFixed(1)),
              deathLifetime: this.deathLifetime,
            });
            this._dbg.lastRemovalLogAt = now;
          }
        }
      }
      return;
    }

    // movement
    this.x += this.speed * this.direction * dt;

    // patrol flip
    if (this.patrolMinX !== null && this.x < this.patrolMinX)
      this.direction = 1;
    if (this.patrolMaxX !== null && this.x > this.patrolMaxX)
      this.direction = -1;

    if (this._dbg.enabled && this.direction !== this._dbg.lastDirection) {
      console.log(`[Enemy#${this._dbg.id}] DIRECTION FLIP`, {
        newDirection: this.direction,
        x: Number(this.x.toFixed(1)),
      });
      this._dbg.lastDirection = this.direction;
    }

    // throttled move log (max 1x / 1.5s)
    if (this._dbg.enabled) {
      const now = performance.now();
      if (now - this._dbg.lastMoveLogAt > 1500) {
        console.log(`[Enemy#${this._dbg.id}] MOVE`, {
          x: Number(this.x.toFixed(1)),
          dir: this.direction,
        });
        this._dbg.lastMoveLogAt = now;
      }
    }

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

    // optional: if image not loaded yet, avoid spamming
    if (!img) {
      if (this._dbg.enabled) {
        const now = performance.now();
        if (now - this._dbg.lastDrawSkipAt > 2000) {
          console.warn(`[Enemy#${this._dbg.id}] DRAW SKIP (no image yet)`);
          this._dbg.lastDrawSkipAt = now;
        }
      }
      ctx.restore();
      return;
    }

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

    if (this._dbg.enabled) {
      console.log(`[Enemy#${this._dbg.id}] KILLED`, {
        x: Number(this.x.toFixed(1)),
      });
    }
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
      deathLifetime: 120,
    });

    if (this._dbg?.enabled) {
      console.log(`[Enemy#${this._dbg.id}] TYPE`, "ChickenNormal");
    }
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
      deathLifetime: 120,
    });

    if (this._dbg?.enabled) {
      console.log(`[Enemy#${this._dbg.id}] TYPE`, "ChickenSmall");
    }
  }
}

/* ----------------------------------------------------------------------------
  BossChicken
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
      deathLifetime: 240,
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

    if (this._dbg?.enabled) {
      console.log(`[Boss#${this._dbg.id}] TYPE`, "BossChicken", {
        hp: this.hp,
        maxHp: this.maxHp,
      });
    }
  }

  takeHit(damage = 1) {
    if (!this.alive) return;

    this.hp -= damage;

    if (this._dbg?.enabled) {
      console.log(`[Boss#${this._dbg.id}] HIT`, {
        damage,
        hpLeft: this.hp,
      });
    }

    if (this.hp <= 0) {
      this.kill();

      if (this._dbg?.enabled) {
        console.log(`[Boss#${this._dbg.id}] DEAD`);
      }
    }
  }
}

/* ============================================================================
  Exports
============================================================================ */

export { EnemyBase, ChickenNormal, ChickenSmall, BossChicken, makeFramePaths };
