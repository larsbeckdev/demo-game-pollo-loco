/* ============================================================================
  Character
  - Player entity
  - Handles movement, physics, state machine, health, animations, rendering
============================================================================ */

import { createCharacterAnimations } from "./character-animations.js";

export default class Character {
  constructor({ x = 70, groundY = 0, width = 90, height = 140 } = {}) {
    // World position
    this.x = x;
    this.y = groundY;
    this.groundY = groundY;

    // Size
    this.w = width;
    this.h = height;

    // Physics and movement
    this.vx = 0;
    this.vy = 0;

    this.speed = 4.8;
    this.jumpForce = 14;
    this.gravity = 0.8;

    this.facing = 1;
    this.onGround = true;

    // Health system
    this.maxHp = 100;
    this.hp = 100;

    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 60;

    this.dead = false;

    this.hurtActive = false;
    this.hurtTimer = 0;
    this.hurtDuration = 24;

    // State machine
    this.state = "idle";
    this.idleTimer = 0;
    this.longIdleAfter = 180;

    // Animations
    this.animations = createCharacterAnimations();
    this.currentAnimationKey = "idle";

    // =========================
    // Jump phase helpers
    // =========================
    this.jumpStartActive = false;
    this.jumpStartTimer = 0;
    this.jumpStartDuration = 12;

    this.landActive = false;
    this.landTimer = 0;
    this.landDuration = 10;

    // =========================
    // Ground transition tracking
    // =========================
    this._wasOnGround = true;

    // =========================
    // DEBUG helpers (spam protection)
    // =========================
    this._dbg = {
      enabled: false, // <- auf false, wenn du Ruhe willst
      lastState: this.state,
      lastAnim: this.currentAnimationKey,
      lastFacing: this.facing,
      lastMove: "none", // "left" | "right" | "none"
      lastOnGround: this.onGround,
      lastDrawLogAt: 0,
      wasJumpDown: false,
    };

    if (this._dbg.enabled) {
      console.log("[Character] init", {
        x: this.x,
        y: this.y,
        groundY: this.groundY,
        w: this.w,
        h: this.h,
        speed: this.speed,
        jumpForce: this.jumpForce,
        gravity: this.gravity,
        animKeys: Object.keys(this.animations ?? {}),
      });
    }
  }

  handleInput(keyboard) {
    if (this.dead || this.hurtActive) return;

    const dbg = this._dbg;

    this.vx = 0;

    const left = !!keyboard?.LEFT;
    const right = !!keyboard?.RIGHT;
    const jumpDown = !!keyboard?.JUMP;

    // --- movement intent (log only on change) ---
    let move = "none";
    if (left) move = "left";
    else if (right) move = "right";

    if (dbg.enabled && move !== dbg.lastMove) {
      console.log("[Character] input move:", move);
      dbg.lastMove = move;
    }

    if (left) {
      this.vx = -this.speed;
      this.facing = -1;
    }

    if (right) {
      this.vx = this.speed;
      this.facing = 1;
    }

    // --- facing change (log only on change) ---
    if (dbg.enabled && this.facing !== dbg.lastFacing) {
      console.log("[Character] facing:", this.facing === 1 ? "right" : "left");
      dbg.lastFacing = this.facing;
    }

    // --- jump edge detect (log once per press) ---
    const justPressedJump = jumpDown && !dbg.wasJumpDown;
    dbg.wasJumpDown = jumpDown;

    if (justPressedJump) {
      if (dbg.enabled) {
        console.log("[Character] input jump pressed", {
          onGround: this.onGround,
          y: this.y,
          vy: this.vy,
        });
      }
      this.jump();
    }
  }

  jump() {
    if (!this.onGround) {
      if (this._dbg.enabled) {
        console.log("[Character] jump blocked (not on ground)", {
          y: this.y,
          vy: this.vy,
        });
      }
      return;
    }

    this.onGround = false;
    this.vy = -this.jumpForce;

    // Trigger jump start phase
    this.jumpStartActive = true;
    this.jumpStartTimer = this.jumpStartDuration;
    this.landActive = false;

    if (this._dbg.enabled) {
      console.log("[Character] jump start", {
        vy: this.vy,
        jumpStartDuration: this.jumpStartDuration,
      });
    }

    this.play("jump_start");
  }

  // Safe animation switch with validation
  play(key) {
    if (this.currentAnimationKey === key) return;

    const next = this.animations?.[key];
    if (!next) {
      console.warn(
        "[Character] Unknown animation key:",
        key,
        "Available:",
        Object.keys(this.animations ?? {}),
      );
      return;
    }

    if (this._dbg.enabled) {
      console.log("[Character] animation ->", key);
    }

    this.currentAnimationKey = key;
    next.reset?.();
  }

  update(deltaTimeInFrames = 1) {
    const dbg = this._dbg;

    // --- physics start snapshot (optional, not logged every frame) ---
    // if (dbg.enabled) console.log("[Character] update dt:", deltaTimeInFrames);

    // Horizontal movement
    this.x += this.vx * deltaTimeInFrames;

    // Gravity and vertical movement
    this.vy += this.gravity * deltaTimeInFrames;
    this.y += this.vy * deltaTimeInFrames;

    // Ground collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // --- onGround change logging ---
    if (dbg.enabled && this.onGround !== dbg.lastOnGround) {
      console.log("[Character] onGround ->", this.onGround, {
        y: this.y,
        groundY: this.groundY,
        vy: this.vy,
      });
      dbg.lastOnGround = this.onGround;
    }

    // Detect "just landed"
    const wasOnGround = this._wasOnGround;
    this._wasOnGround = this.onGround;

    if (this.onGround && !wasOnGround) {
      this.landActive = true;
      this.landTimer = this.landDuration;

      // End airborne "start" phase on landing
      this.jumpStartActive = false;
      this.jumpStartTimer = 0;

      if (dbg.enabled) {
        console.log("[Character] landed", {
          landDuration: this.landDuration,
          x: this.x,
          y: this.y,
        });
      }
    }

    // Priority-based animation resolution
    let animKey = "idle";

    if (this.dead) {
      this.state = "dead";
      animKey = "dead";
    } else if (this.hurtActive) {
      this.state = "hurt";
      animKey = "hurt";

      this.hurtTimer -= deltaTimeInFrames;
      if (this.hurtTimer <= 0) {
        this.hurtActive = false;
        this.hurtTimer = 0;

        if (dbg.enabled) {
          console.log("[Character] hurt ended");
        }
      }
    } else {
      if (this.landActive) {
        this.state = "jump_land";
        animKey = "jump_land";

        this.landTimer -= deltaTimeInFrames;
        if (this.landTimer <= 0) {
          this.landActive = false;
          this.landTimer = 0;

          if (dbg.enabled) {
            console.log("[Character] landing phase ended");
          }
        }
      } else if (!this.onGround) {
        this.idleTimer = 0;

        if (this.jumpStartActive) {
          this.state = "jump_start";
          animKey = "jump_start";

          this.jumpStartTimer -= deltaTimeInFrames;
          if (this.jumpStartTimer <= 0) {
            this.jumpStartActive = false;
            this.jumpStartTimer = 0;

            if (dbg.enabled) {
              console.log("[Character] jumpStart phase ended");
            }
          }
        } else {
          if (this.vy < -0.2) {
            this.state = "jump_up";
            animKey = "jump_up";
          } else if (Math.abs(this.vy) <= 0.2) {
            this.state = "jump_apex";
            animKey = "jump_apex";
          } else {
            this.state = "jump_fall";
            animKey = "jump_fall";
          }
        }
      } else if (Math.abs(this.vx) > 0.01) {
        this.idleTimer = 0;
        this.state = "walk";
        animKey = "walk";
      } else {
        this.idleTimer += deltaTimeInFrames;
        this.state =
          this.idleTimer >= this.longIdleAfter ? "long_idle" : "idle";
        animKey = this.state;
      }
    }

    // --- state change logging ---
    if (dbg.enabled && this.state !== dbg.lastState) {
      console.log("[Character] state ->", this.state, {
        vx: this.vx,
        vy: this.vy,
        onGround: this.onGround,
        x: this.x,
        y: this.y,
      });
      dbg.lastState = this.state;
    }

    // Apply animation safely
    this.play(animKey);

    const anim = this.animations?.[this.currentAnimationKey];
    if (anim) anim.update(deltaTimeInFrames);

    // Invincibility timer
    if (this.invincible) {
      this.invincibleTimer -= deltaTimeInFrames;

      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;

        if (dbg.enabled) {
          console.log("[Character] invincible ended");
        }
      }
    }
  }

  takeDamage() {
    if (this.dead || this.invincible) {
      if (this._dbg.enabled) {
        console.log("[Character] takeDamage blocked", {
          dead: this.dead,
          invincible: this.invincible,
        });
      }
      return;
    }

    this.hp--;

    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;

    this.hurtActive = true;
    this.hurtTimer = this.hurtDuration;

    this.vx = 0;

    if (this._dbg.enabled) {
      console.log("[Character] took damage", {
        hp: this.hp,
        invincibleDuration: this.invincibleDuration,
        hurtDuration: this.hurtDuration,
      });
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.hurtActive = false;
      this.hurtTimer = 0;
      this.vx = 0;
      this.vy = 0;

      if (this._dbg.enabled) {
        console.log("[Character] DEAD", { x: this.x, y: this.y });
      }
    }
  }

  draw(ctx, cameraX = 0) {
    const dbg = this._dbg;

    const animation = this.animations?.[this.currentAnimationKey];
    if (!animation?.ready) {
      // optional: selten loggen, wenn Images nicht ready sind
      // if (dbg.enabled) console.log("[Character] draw skipped (anim not ready)", this.currentAnimationKey);
      return;
    }

    const image = animation.image;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // --- draw log (throttled, max ~1x pro sekunde) ---
    if (dbg.enabled) {
      const now = performance.now();
      if (now - dbg.lastDrawLogAt > 1000) {
        console.log("[Character] draw", {
          anim: this.currentAnimationKey,
          state: this.state,
          screenX: Math.round(screenX),
          drawY: Math.round(drawY),
          cameraX: Math.round(cameraX),
        });
        dbg.lastDrawLogAt = now;
      }
    }

    ctx.save();

    if (this.facing === -1) {
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(image, screenX, drawY, this.w, this.h);
    }

    ctx.restore();
  }

  getBounds() {
    const bounds = {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };

    if (this._dbg.enabled && !Number.isFinite(bounds.x + bounds.y)) {
      console.warn("[Character] bounds invalid", bounds);
    }

    return bounds;
  }
}
