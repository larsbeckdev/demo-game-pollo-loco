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
  }

  setAnimation(key) {
    if (this.currentAnimationKey === key) return;

    const isJumpFallSwitch =
      (this.currentAnimationKey === "jump" && key === "fall") ||
      (this.currentAnimationKey === "fall" && key === "jump");

    this.currentAnimationKey = key;

    if (!isJumpFallSwitch) {
      this.animations[key]?.reset();
    }
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

    // State resolution (priority-based)
    if (this.dead) {
      this.state = "dead";
    } else if (this.hurtActive) {
      this.state = "hurt";
      this.hurtTimer -= deltaTimeInFrames;

      if (this.hurtTimer <= 0) {
        this.hurtActive = false;
        this.hurtTimer = 0;
      }
    } else {
      if (!this.onGround) {
        this.idleTimer = 0;
        this.state = this.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(this.vx) > 0.01) {
        this.idleTimer = 0;
        this.state = "walk";
      } else {
        this.idleTimer += deltaTimeInFrames;
        this.state =
          this.idleTimer >= this.longIdleAfter ? "long_idle" : "idle";
      }
    }

    // Apply animation
    this.setAnimation(this.state);
    this.animations[this.currentAnimationKey].update(deltaTimeInFrames);

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
    const animation = this.animations[this.currentAnimationKey];
    const image = animation.image;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // Hurt blink effect
    if (this.hurtActive && !this.dead) {
      if (Math.floor(this.hurtTimer / 3) % 2 === 0) return;
    }

    if (!animation.ready) return;

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
