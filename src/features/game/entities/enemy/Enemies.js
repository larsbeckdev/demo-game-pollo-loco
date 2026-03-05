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
  - ONLY animation timing (no position / no x/y)
============================================================================ */

class FrameAnimation {
  constructor(paths, fps = 8, { loop = true, holdLast = false } = {}) {
    this.images = paths.map((src) => {
      const img = new Image();

      // ✅ kleiner Lag-Fix beim Laden (Browser darf async decoden)
      img.decoding = "async";
      img.loading = "eager"; // optional, aber hilft oft

      img.src = src;
      return img;
    });

    this.fps = fps;
    this.loop = loop;
    this.holdLast = holdLast;

    this.frame = 0;
    this.acc = 0;

    // Debug (spam-safe)
    this._dbg = {
      enabled: false,
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
      if (!paths.length)
        console.warn(`[FrameAnim#${this._dbg.id}] WARNING: 0 frames`);
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
    // dt must be finite
    if (!Number.isFinite(dt)) return;

    // no need to animate if 0/1 frames
    if (this.images.length <= 1) return;

    // your dt-unit: dt ~ 1 at 60fps → frameTime in "dt units"
    const frameTime = 60 / this.fps;
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;

      const next = this.frame + 1;

      if (next >= this.images.length) {
        if (this.loop) {
          this.frame = 0;

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
  - Movement + animation + drawing
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

    damage = 10,

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
    this.y = groundY; // ground line (not top-left)

    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.w = this.baseWidth * scale;
    this.h = this.baseHeight * scale;

    // =========================
    // HITBOX CONFIG
    // =========================
    this.hitboxPaddingX = this.w * 0.2; // 20% links & rechts kleiner
    this.hitboxPaddingTop = this.h * 0.25; // oben kleiner
    this.hitboxPaddingBottom = this.h * 0.1; // unten kleiner

    this.speed = speed;
    this.direction = direction;

    this.damage = damage;

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

    // Debug (spam-safe)
    this._dbg = {
      enabled: false, // <- set true to debug movement/draw
      id: Math.random().toString(16).slice(2, 6),
      lastDirection: this.direction,
      lastMoveLogAt: 0,
      lastUpdateLogAt: 0,
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
    if (!Number.isFinite(dt)) {
      console.warn("[Enemy] dt invalid:", dt);
      return;
    }

    // Throttled update log (max 1x / 1s)
    if (this._dbg.enabled) {
      const now = performance.now();
      if (now - this._dbg.lastUpdateLogAt > 1000) {
        console.log(`[Enemy#${this._dbg.id}] UPDATE`, {
          x: Number(this.x.toFixed(1)),
          y: Number(this.y.toFixed(1)),
          dt: Number(dt.toFixed(2)),
          speed: this.speed,
          dir: this.direction,
        });
        this._dbg.lastUpdateLogAt = now;
      }
    }

    // Dead state
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

    // Movement
    this.x += this.speed * this.direction * dt;

    // Patrol flip
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

    // Throttled move log (max 1x / 1.5s)
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

    // Animation
    this.walkAnim.update(dt);
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    // Dead
    if (!this.alive && this.deadImg) {
      if (this.deadImg.complete) {
        ctx.drawImage(this.deadImg, screenX, drawY, this.w, this.h);
      }
      ctx.restore();
      return;
    }

    const img = this.walkAnim.image;

    // If not loaded yet, skip silently
    if (!img || !img.complete) {
      if (this._dbg.enabled) {
        const now = performance.now();
        if (now - this._dbg.lastDrawSkipAt > 2000) {
          console.warn(
            `[Enemy#${this._dbg.id}] DRAW SKIP (image not loaded yet)`,
          );
          this._dbg.lastDrawSkipAt = now;
        }
      }
      ctx.restore();
      return;
    }

    // Flip when going right
    if (this.direction === 1) {
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(img, screenX, drawY, this.w, this.h);
    }

    ctx.restore();

    // DEBUG HITBOX
    if (false) {
      // <- auf true setzen zum Testen
      const b = this.getBounds();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x - cameraX, b.y, b.w, b.h);
    }
  }

  getBounds() {
    const hitboxX = this.x + this.hitboxPaddingX;
    const hitboxY = this.y - this.h + this.hitboxPaddingTop;

    const hitboxW = this.w - this.hitboxPaddingX * 2;
    const hitboxH = this.h - this.hitboxPaddingTop - this.hitboxPaddingBottom;

    return {
      x: hitboxX,
      y: hitboxY,
      w: hitboxW,
      h: hitboxH,
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
      damage: 10,
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
      deathLifetime: 120,
      damage: 5,
    });
  }
}

class BossChicken extends EnemyBase {
  constructor({
    x = 0,
    groundY = 0,
    scale = 1.0,
    patrolMinX = null,
    patrolMaxX = null,
    hp = 8,

    alertRange = 700,
    attackRange = 240,

    attackCooldown = 90, // ~1.5s
    attackDuration = 30, // ~0.5s
    hitStart = 10, // hit window start (frames)
    hitEnd = 18, // hit window end (frames)
  } = {}) {
    const base = "/images/4_enemie_boss_chicken";

    super({
      x,
      groundY,
      scale,
      baseWidth: 250,
      baseHeight: 250,
      speed: 0.7,
      direction: -1,
      patrolMinX,
      patrolMaxX,
      walkPaths: makeFramePaths(`${base}/1_walk`, [
        "G1.png",
        "G2.png",
        "G3.png",
        "G4.png",
      ]),
      walkFps: 6,
      deadImageSrc: null,
      deathLifetime: 120,
      damage: 20,
    });

    this.maxHp = hp;
    this.hp = hp;

    // anti flip-jitter
    this.turnCooldown = 0;
    this.turnCooldownMax = 18; // statt 10
    this.turnMargin = 10; // statt 6

    // anims
    this.alertAnim = new FrameAnimation(
      makeFramePaths(`${base}/2_alert`, [
        "G5.png",
        "G6.png",
        "G7.png",
        "G8.png",
        "G9.png",
        "G10.png",
        "G11.png",
        "G12.png",
      ]),
      10,
      { loop: true },
    );

    this.attackAnim = new FrameAnimation(
      makeFramePaths(`${base}/3_attack`, [
        "G13.png",
        "G14.png",
        "G15.png",
        "G16.png",
        "G17.png",
        "G18.png",
        "G19.png",
        "G20.png",
      ]),
      12,
      { loop: false, holdLast: false },
    );

    this.hurtAnim = new FrameAnimation(
      makeFramePaths(`${base}/4_hurt`, ["G21.png", "G22.png", "G23.png"]),
      10,
      { loop: false, holdLast: false },
    );

    this.deadAnim = new FrameAnimation(
      makeFramePaths(`${base}/5_dead`, ["G24.png", "G25.png", "G26.png"]),
      8,
      { loop: false, holdLast: true },
    );

    // state machine
    this.mode = "walk"; // walk | alert | attack | hurt | dead
    this.alertRange = alertRange;
    this.attackRange = attackRange;

    this.attackCooldownMax = attackCooldown;
    this.attackCooldown = 0;

    this.attackDuration = attackDuration;
    this.attackTimer = 0;

    this.hitStart = hitStart;
    this.hitEnd = hitEnd;

    this.hurtDuration = 18;
    this.hurtTimer = 0;

    this._defeated = false;
  }

  isDefeated() {
    return this._defeated === true;
  }

  // ✅ sauberes "Hit Window" (elapsed statt rumrechnen)
  isAttacking() {
    if (!this.alive || this.mode !== "attack") return false;
    const elapsed = this.attackDuration - this.attackTimer; // 0..attackDuration
    return elapsed >= this.hitStart && elapsed <= this.hitEnd;
  }

  startAttack() {
    this.mode = "attack";
    this.attackTimer = this.attackDuration;
    this.attackAnim.reset();
  }

  takeHit(damage = 1) {
    if (!this.alive) return;

    const dmg = Number.isFinite(damage) ? Math.max(1, damage) : 1;
    this.hp = Math.max(0, this.hp - dmg);

    // ✅ hurt state
    this.mode = "hurt";
    this.hurtTimer = this.hurtDuration;
    this.hurtAnim.reset();

    // optional: cooldown damit er nicht sofort wieder attackt
    this.attackCooldown = Math.max(this.attackCooldown, 18);

    if (this.hp <= 0) this.kill();
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.mode = "dead";
    this._defeated = true;

    this.deathTimer = 0;
    this.deadAnim.reset();
  }

  update(dt, player) {
    if (!Number.isFinite(dt)) return;
    const d = Math.min(2.0, Math.max(0, dt)); // tighter clamp = weniger jitter

    // ----------------------------
    // DEAD
    // ----------------------------
    if (!this.alive) {
      this.deathTimer += d;
      this.deadAnim.update(d);
      if (this.deathTimer >= this.deathLifetime) this.markedForRemoval = true;
      return;
    }

    // timers
    this.turnCooldown = Math.max(0, this.turnCooldown - d);
    this.attackCooldown = Math.max(0, this.attackCooldown - d);

    const playerX = player?.x ?? null;
    const dist = playerX == null ? Infinity : Math.abs(playerX - this.x);

    // ----------------------------
    // HURT (no movement)
    // ----------------------------
    if (this.mode === "hurt") {
      this.hurtTimer -= d;
      this.hurtAnim.update(d);

      if (this.hurtTimer <= 0) {
        this.hurtTimer = 0;
        this.mode = "walk";
      }
      return;
    }

    // ----------------------------
    // ATTACK (kick) - no movement (optional tiny lunge)
    // ----------------------------
    if (this.mode === "attack") {
      this.attackTimer -= d;
      this.attackAnim.update(d);

      // optional: tiny lunge forward during the hit window (feels like kick)
      if (this.isAttacking()) {
        const lunge = 0.9; // tweak 0.6..1.4
        this.x += this.direction * lunge * d;
      }

      if (this.attackTimer <= 0) {
        this.attackTimer = 0;
        this.attackCooldown = this.attackCooldownMax;
        this.mode = "walk";
        this.attackAnim.reset(); // wichtig: nächster Attack startet sauber
      }
      return;
    }

    // ----------------------------
    // Decide behavior (stand alert vs chase/walk)
    // ----------------------------
    const inAlert = dist <= this.alertRange;
    const inAttack = dist <= this.attackRange;

    // Kick trigger
    if (inAttack && this.attackCooldown <= 0) {
      this.startAttack();
      return;
    }

    // ✅ Direction: only when player exists AND in alert range
    if (playerX != null && inAlert) {
      const deadZone = 28; // px, prevents flip jitter
      let desired = this.direction;

      if (playerX > this.x + deadZone) desired = 1;
      else if (playerX < this.x - deadZone) desired = -1;

      if (desired !== this.direction && this.turnCooldown <= 0) {
        this.direction = desired;
        this.turnCooldown = this.turnCooldownMax; // set ~14..22 in ctor
      }
    }

    // ✅ Movement:
    // - If player in alert range BUT not in attack range: CHASE (walk)
    // - Else: PATROL (walk)
    const shouldMove = !inAlert ? true : dist > this.attackRange + 40;

    if (shouldMove) {
      // choose speed: patrol vs chase
      const speed = inAlert ? 1.05 : 0.7; // chase faster than patrol
      this.x += speed * this.direction * d;

      // ✅ sync walk animation speed with movement (reduces "sliding")
      // You can tweak these numbers:
      this.walkAnim.fps = inAlert ? 10 : 6;
      this.walkAnim.update(d);

      this.mode = "walk"; // moving => always walk
    } else {
      // close enough: stop and "threaten"
      this.mode = "alert";
      this.alertAnim.update(d);
    }

    // Patrol clamp (only makes sense when patrolling; still safe)
    if (this.patrolMinX != null && this.x < this.patrolMinX + this.turnMargin) {
      this.x = this.patrolMinX + this.turnMargin;
      if (this.turnCooldown <= 0) {
        this.direction = 1;
        this.turnCooldown = this.turnCooldownMax;
      }
    } else if (
      this.patrolMaxX != null &&
      this.x > this.patrolMaxX - this.turnMargin
    ) {
      this.x = this.patrolMaxX - this.turnMargin;
      if (this.turnCooldown <= 0) {
        this.direction = -1;
        this.turnCooldown = this.turnCooldownMax;
      }
    }
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    let img = null;
    if (!this.alive || this.mode === "dead") img = this.deadAnim.image;
    else if (this.mode === "hurt") img = this.hurtAnim.image;
    else if (this.mode === "attack") img = this.attackAnim.image;
    else if (this.mode === "alert") img = this.alertAnim.image;
    else img = this.walkAnim.image;

    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.save();
    if (this.direction === 1) {
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(img, screenX, drawY, this.w, this.h);
    }
    ctx.restore();
  }
}

/* ============================================================================
  Exports
============================================================================ */

export { EnemyBase, ChickenNormal, ChickenSmall, BossChicken, makeFramePaths };
