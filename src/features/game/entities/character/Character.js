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
    this.maxHp = 3;
    this.hp = 3;

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
    // NEU: Jump phase helpers
    // =========================
    this.jumpStartActive = false;
    this.jumpStartTimer = 0;
    this.jumpStartDuration = 12; // ~0.2s @ 60fps (tweak)

    this.landActive = false;
    this.landTimer = 0;
    this.landDuration = 10; // ~0.16s @ 60fps (tweak)

    // =========================
    // NEU: Ground transition tracking
    // =========================
    this._wasOnGround = true;

    console.log("[Character] groundY:", groundY);
  }

  handleInput(keyboard) {
    if (this.dead || this.hurtActive) return;

    this.vx = 0;

    if (keyboard?.LEFT) {
      this.vx = -this.speed;
      this.facing = -1;
    }

    if (keyboard?.RIGHT) {
      this.vx = this.speed;
      this.facing = 1;
    }

    if (keyboard?.JUMP) {
      this.jump();
    }
  }

  jump() {
    if (!this.onGround) return;

    this.onGround = false;
    this.vy = -this.jumpForce;

    // =========================
    // NEU: Trigger jump start phase
    // =========================
    this.jumpStartActive = true;
    this.jumpStartTimer = this.jumpStartDuration;
    this.landActive = false; // cancel landing if any
    this.play("jump_start"); // ensure correct animation
  }

  // =========================
  // NEU: Safe animation switch with validation
  // =========================
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

    this.currentAnimationKey = key;
    next.reset?.();
  }

  update(deltaTimeInFrames = 1) {
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

    // =========================
    // NEU: Detect "just landed"
    // =========================
    const wasOnGround = this._wasOnGround;
    this._wasOnGround = this.onGround;

    if (this.onGround && !wasOnGround) {
      this.landActive = true;
      this.landTimer = this.landDuration;

      // End airborne "start" phase on landing
      this.jumpStartActive = false;
      this.jumpStartTimer = 0;
    }

    // =========================
    // NEU: Priority-based animation resolution
    // (we keep this.state for debugging if you like)
    // =========================
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
      }
    } else {
      // Landing phase has priority when grounded
      if (this.landActive) {
        this.state = "jump_land";
        animKey = "jump_land";

        this.landTimer -= deltaTimeInFrames;
        if (this.landTimer <= 0) {
          this.landActive = false;
          this.landTimer = 0;
        }
      } else if (!this.onGround) {
        this.idleTimer = 0;

        // Jump start phase first (hocke/absprung)
        if (this.jumpStartActive) {
          this.state = "jump_start";
          animKey = "jump_start";

          this.jumpStartTimer -= deltaTimeInFrames;
          if (this.jumpStartTimer <= 0) {
            this.jumpStartActive = false;
            this.jumpStartTimer = 0;
          }
        } else {
          // Air phases derived from vertical speed
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

    // =========================
    // NEU: Apply animation safely
    // =========================
    this.play(animKey);

    const anim = this.animations?.[this.currentAnimationKey];
    if (anim) anim.update(deltaTimeInFrames);

    // Invincibility timer
    if (this.invincible) {
      this.invincibleTimer -= deltaTimeInFrames;

      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;
      }
    }
  }

  takeDamage() {
    if (this.dead || this.invincible) return;

    this.hp--;

    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;

    this.hurtActive = true;
    this.hurtTimer = this.hurtDuration;

    this.vx = 0;

    if (this.hp <= 0) {
      this.dead = true;
      this.hurtActive = false;
      this.hurtTimer = 0;
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx, cameraX = 0) {
    // =========================
    // NEU: Safer access (avoid reading image before ready)
    // =========================
    const animation = this.animations?.[this.currentAnimationKey];
    if (!animation?.ready) return;

    const image = animation.image;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // Hurt blink effect
    if (this.hurtActive && !this.dead) {
      if (Math.floor(this.hurtTimer / 3) % 2 === 0) return;
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
    return {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };
  }
}
