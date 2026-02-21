/* ============================================================================
  Animation Helper Functions
  - Utility functions for building animation frame paths
============================================================================ */

/* ----------------------------------------------------------------------------
  makeFramePaths
  - Combines a base path with an array of filenames
  - Returns an array of full image paths
---------------------------------------------------------------------------- */

function makeFramePaths(basePath, fileNames) {
  return fileNames.map((fileName) => `${basePath}/${fileName}`);
}

/* ----------------------------------------------------------------------------
  rangeFrames
  - Generates filenames in the format: prefix + number + ".png"
  - Example: rangeFrames("I-", 1, 3)
    → ["I-1.png", "I-2.png", "I-3.png"]
---------------------------------------------------------------------------- */

function rangeFrames(prefix, fromNumber, toNumber) {
  const result = [];

  for (let index = fromNumber; index <= toNumber; index++) {
    result.push(`${prefix}${index}.png`);
  }

  return result;
}

/* ============================================================================
  FrameAnimation
  - Handles sprite animation timing and frame switching
  - Uses a 60 frames per second reference for delta time
============================================================================ */

class FrameAnimation {
  /* --------------------------------------------------------------------------
    Constructor
    - paths: array of image paths
    - framesPerSecond: animation speed
  -------------------------------------------------------------------------- */

  constructor(paths, framesPerSecond = 12) {
    this.paths = paths;
    this.framesPerSecond = framesPerSecond;

    /* ------------------------------------------------------------------------
      Preload images
    ------------------------------------------------------------------------ */

    this.images = paths.map((sourcePath) => {
      const image = new Image();
      image.src = sourcePath;
      return image;
    });

    /* ------------------------------------------------------------------------
      Animation state
    ------------------------------------------------------------------------ */

    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  /* --------------------------------------------------------------------------
    reset
    - Resets animation to first frame
  -------------------------------------------------------------------------- */

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  /* --------------------------------------------------------------------------
    update
    - dt: delta time (frame-based, 1 ≈ one frame at 60 frames per second)
  -------------------------------------------------------------------------- */

  update(deltaTimeInFrames) {
    const frameDuration = 60 / this.framesPerSecond;

    this.accumulatedTime += deltaTimeInFrames;

    while (this.accumulatedTime >= frameDuration) {
      this.accumulatedTime -= frameDuration;

      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.images.length;
    }
  }

  /* --------------------------------------------------------------------------
    Current frame image
  -------------------------------------------------------------------------- */

  get image() {
    return this.images[this.currentFrameIndex];
  }

  /* --------------------------------------------------------------------------
    Ready state
    - Ensures image is fully loaded before rendering
  -------------------------------------------------------------------------- */

  get ready() {
    const image = this.image;
    return image && image.complete && image.naturalWidth > 0;
  }
}

/* ============================================================================
  Character
  - Player entity
  - Handles:
      - Movement and physics
      - State machine
      - Health system
      - Animations
      - Rendering
============================================================================ */

export default class Character {
  /* ==========================================================================
    Constructor
  ========================================================================== */

  constructor({ x = 70, groundY = 270 - 40, width = 90, height = 140 } = {}) {
    /* ------------------------------------------------------------------------
      World Position
    ------------------------------------------------------------------------ */

    this.x = x;
    this.y = groundY;
    this.groundY = groundY;

    /* ------------------------------------------------------------------------
      Size
    ------------------------------------------------------------------------ */

    this.w = width;
    this.h = height;

    /* ------------------------------------------------------------------------
      Physics and Movement
    ------------------------------------------------------------------------ */

    this.vx = 0;
    this.vy = 0;

    this.speed = 4.8;
    this.jumpForce = 14;
    this.gravity = 0.9;

    this.facing = 1;
    this.onGround = true;

    /* ------------------------------------------------------------------------
      Health System
    ------------------------------------------------------------------------ */

    this.maxHp = 3;
    this.hp = 3;

    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 60;

    this.dead = false;

    this.hurtActive = false;
    this.hurtTimer = 0;
    this.hurtDuration = 24;

    /* ------------------------------------------------------------------------
      State Machine
    ------------------------------------------------------------------------ */

    this.state = "idle";
    this.idleTimer = 0;
    this.longIdleAfter = 180;

    /* ------------------------------------------------------------------------
      Animation Setup
    ------------------------------------------------------------------------ */

    const basePath = "/images/2_character_pepe";

    const idlePaths = makeFramePaths(
      `${basePath}/1_idle/idle`,
      rangeFrames("I-", 1, 10),
    );

    const longIdlePaths = makeFramePaths(
      `${basePath}/1_idle/long_idle`,
      rangeFrames("I-", 11, 20),
    );

    const walkPaths = makeFramePaths(
      `${basePath}/2_walk`,
      rangeFrames("W-", 21, 26),
    );

    const jumpPaths = makeFramePaths(
      `${basePath}/3_jump`,
      rangeFrames("J-", 31, 39),
    );

    const hurtPaths = makeFramePaths(
      `${basePath}/4_hurt`,
      rangeFrames("H-", 41, 43),
    );

    const deadPaths = makeFramePaths(
      `${basePath}/5_dead`,
      rangeFrames("D-", 51, 57),
    );

    this.animations = {
      idle: new FrameAnimation(idlePaths, 10),
      long_idle: new FrameAnimation(longIdlePaths, 8),
      walk: new FrameAnimation(walkPaths, 14),
      jump: new FrameAnimation(jumpPaths, 10),
      fall: new FrameAnimation(jumpPaths, 10),
      hurt: new FrameAnimation(hurtPaths, 12),
      dead: new FrameAnimation(deadPaths, 10),
    };

    this.currentAnimationKey = "idle";
  }

  /* ==========================================================================
    Input Handling
  ========================================================================== */

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

  /* ==========================================================================
    Animation Control
  ========================================================================== */

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

  /* ==========================================================================
    Update Loop
  ========================================================================== */

  update(deltaTimeInFrames = 1) {
    /* ------------------------------------------------------------------------
      Horizontal movement
    ------------------------------------------------------------------------ */

    this.x += this.vx * deltaTimeInFrames;

    /* ------------------------------------------------------------------------
      Gravity and vertical movement
    ------------------------------------------------------------------------ */

    this.vy += this.gravity * deltaTimeInFrames;
    this.y += this.vy * deltaTimeInFrames;

    /* ------------------------------------------------------------------------
      Ground collision
    ------------------------------------------------------------------------ */

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    /* ------------------------------------------------------------------------
      State resolution (priority-based)
    ------------------------------------------------------------------------ */

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

    /* ------------------------------------------------------------------------
      Apply animation
    ------------------------------------------------------------------------ */

    this.setAnimation(this.state);
    this.animations[this.currentAnimationKey].update(deltaTimeInFrames);

    /* ------------------------------------------------------------------------
      Invincibility timer
    ------------------------------------------------------------------------ */

    if (this.invincible) {
      this.invincibleTimer -= deltaTimeInFrames;

      if (this.invincibleTimer <= 0) {
        this.invincible = false;
        this.invincibleTimer = 0;
      }
    }
  }

  /* ==========================================================================
    Damage Handling
  ========================================================================== */

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

  /* ==========================================================================
    Rendering
  ========================================================================== */

  draw(ctx, cameraX = 0) {
    const animation = this.animations[this.currentAnimationKey];
    const image = animation.image;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    /* ------------------------------------------------------------------------
      Hurt blink effect
    ------------------------------------------------------------------------ */

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

  /* ==========================================================================
    Collision Bounds
  ========================================================================== */

  getBounds() {
    return {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };
  }
}
