// @/features/game/entities/Character.js

// ------------------------------------------------------------
// Helpers for building frame paths
// ------------------------------------------------------------
function createFramePaths(basePath, fileNames) {
  return fileNames.map((fileName) => `${basePath}/${fileName}`);
}

function createNumberedFrameNames(prefix, startNumber, endNumber) {
  const names = [];
  for (let number = startNumber; number <= endNumber; number++) {
    names.push(`${prefix}${number}.png`);
  }
  return names;
}

// ------------------------------------------------------------
// FrameAnimation (dt is a 60fps multiplier: dt≈1 at 60fps)
// ------------------------------------------------------------
class FrameAnimation {
  constructor(framePaths, framesPerSecond = 12, options = {}) {
    this.framePaths = framePaths;
    this.framesPerSecond = framesPerSecond;

    this.shouldLoop = options.shouldLoop ?? true;
    this.shouldHoldLastFrame = options.shouldHoldLastFrame ?? false;

    this.images = framePaths.map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
    this.isFinished = false;
  }

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
    this.isFinished = false;
  }

  update(deltaTime) {
    if (this.isFinished) return;

    const frameDurationInDeltaUnits = 60 / this.framesPerSecond;
    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= frameDurationInDeltaUnits) {
      this.accumulatedTime -= frameDurationInDeltaUnits;

      const lastFrameIndex = this.images.length - 1;

      if (this.currentFrameIndex >= lastFrameIndex) {
        if (this.shouldLoop) {
          this.currentFrameIndex = 0;
        } else if (this.shouldHoldLastFrame) {
          this.currentFrameIndex = lastFrameIndex;
          this.isFinished = true;
        } else {
          this.currentFrameIndex = lastFrameIndex;
          this.isFinished = true;
        }
      } else {
        this.currentFrameIndex += 1;
      }
    }
  }

  getCurrentImage() {
    return this.images[this.currentFrameIndex];
  }

  isReady() {
    const image = this.getCurrentImage();
    return image && image.complete && image.naturalWidth > 0;
  }
}

// ------------------------------------------------------------
// Character
// ------------------------------------------------------------
export default class Character {
  constructor({ x = 120, groundY = 380, width = 90, height = 140 } = {}) {
    // Position and size
    this.x = x;
    this.y = groundY; // foot point
    this.groundY = groundY;

    this.w = width;
    this.h = height;

    // Motion
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.8;
    this.jumpForce = 14;
    this.gravity = 0.9;

    this.facing = 1; // 1 right, -1 left
    this.onGround = true;

    // Health
    this.maxHp = 3;
    this.hp = 3;

    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 60;

    this.dead = false;

    this.hurtActive = false;
    this.hurtTimer = 0;
    this.hurtDuration = 24;

    // State
    this.state = "idle";
    this.idleTimer = 0;
    this.longIdleAfter = 180;

    // Jump animation control
    this.jumpPrepTimer = 0; // plays 31–33 before impulse
    this.wasOnGroundLastFrame = true; // landing detection
    this.landingTimer = 0; // shows 38 then 39 briefly
    this.landingDuration = 12; // tweak 8..14

    // Animations
    const basePath = "/images/2_character_pepe";

    const idlePaths = createFramePaths(
      `${basePath}/1_idle/idle`,
      createNumberedFrameNames("I-", 1, 10),
    );

    const longIdlePaths = createFramePaths(
      `${basePath}/1_idle/long_idle`,
      createNumberedFrameNames("I-", 11, 20),
    );

    const walkPaths = createFramePaths(
      `${basePath}/2_walk`,
      createNumberedFrameNames("W-", 21, 26),
    );

    // Jump split (your requested mapping)
    const jumpPrepPaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 31, 33),
    );

    const jumpRisePaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 34, 34),
    );

    const jumpPeakPaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 35, 36),
    );

    const jumpFallPaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 37, 37),
    );

    const jumpLandPaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 38, 38),
    );

    const jumpStandPaths = createFramePaths(
      `${basePath}/3_jump`,
      createNumberedFrameNames("J-", 39, 39),
    );

    const hurtPaths = createFramePaths(
      `${basePath}/4_hurt`,
      createNumberedFrameNames("H-", 41, 43),
    );

    const deadPaths = createFramePaths(
      `${basePath}/5_dead`,
      createNumberedFrameNames("D-", 51, 57),
    );

    this.anims = {
      idle: new FrameAnimation(idlePaths, 10),
      longIdle: new FrameAnimation(longIdlePaths, 8),
      walk: new FrameAnimation(walkPaths, 14),

      jumpPrep: new FrameAnimation(jumpPrepPaths, 14, {
        shouldLoop: false,
        shouldHoldLastFrame: true,
      }),
      jumpRise: new FrameAnimation(jumpRisePaths, 10, {
        shouldLoop: false,
        shouldHoldLastFrame: true,
      }),
      jumpPeak: new FrameAnimation(jumpPeakPaths, 10, { shouldLoop: true }),
      jumpFall: new FrameAnimation(jumpFallPaths, 10, {
        shouldLoop: false,
        shouldHoldLastFrame: true,
      }),
      jumpLand: new FrameAnimation(jumpLandPaths, 10, {
        shouldLoop: false,
        shouldHoldLastFrame: true,
      }),
      jumpStand: new FrameAnimation(jumpStandPaths, 10, {
        shouldLoop: false,
        shouldHoldLastFrame: true,
      }),

      hurt: new FrameAnimation(hurtPaths, 12),
      dead: new FrameAnimation(deadPaths, 10),
    };

    this.currentAnimKey = "idle";
  }

  // ------------------------------------------------------------
  // Input
  // ------------------------------------------------------------
  handleInput(keyboard) {
    if (this.dead) return;
    if (this.hurtActive) return;

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
      this.startJump();
    }
  }

  startJump() {
    if (!this.onGround) return;
    if (this.dead) return;
    if (this.hurtActive) return;

    // Play 31–33 briefly, impulse is applied inside update()
    this.jumpPrepTimer = 8; // tweak 6..10
    this.setAnim("jumpPrep");
    this.anims[this.currentAnimKey].reset();
  }

  // ------------------------------------------------------------
  // Animation helper
  // ------------------------------------------------------------
  setAnim(animationKey) {
    if (this.currentAnimKey === animationKey) return;
    this.currentAnimKey = animationKey;

    const animation = this.anims[this.currentAnimKey];
    if (animation) animation.reset();
  }

  // ------------------------------------------------------------
  // Update (physics + state + animation)
  // ------------------------------------------------------------
  update(deltaTime = 1) {
    // --- Jump preparation (31–33), keep character grounded
    if (this.jumpPrepTimer > 0) {
      this.jumpPrepTimer -= deltaTime;

      this.vx = 0;
      this.vy = 0;
      this.y = this.groundY;
      this.onGround = true;

      this.setAnim("jumpPrep");
      this.anims[this.currentAnimKey].update(deltaTime);

      if (this.jumpPrepTimer <= 0) {
        this.onGround = false;
        this.vy = -this.jumpForce;
      }

      return;
    }

    // --- Move X
    this.x += this.vx * deltaTime;

    // --- Gravity
    this.vy += this.gravity * deltaTime;
    this.y += this.vy * deltaTime;

    // --- Ground collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // --- Landing detection
    const justLanded = this.onGround && !this.wasOnGroundLastFrame;
    if (justLanded) {
      this.landingTimer = this.landingDuration;
    }
    this.wasOnGroundLastFrame = this.onGround;

    // --- Hurt / Dead
    if (this.dead) {
      this.state = "dead";
    } else if (this.hurtActive) {
      this.state = "hurt";
      this.hurtTimer -= deltaTime;
      if (this.hurtTimer <= 0) {
        this.hurtActive = false;
        this.hurtTimer = 0;
      }
    } else {
      // --- Landing animation has priority
      if (this.landingTimer > 0) {
        const half = this.landingDuration / 2;
        this.state = this.landingTimer > half ? "jumpLand" : "jumpStand";
        this.landingTimer -= deltaTime;
        this.idleTimer = 0;
      } else if (!this.onGround) {
        // --- Air animations based on vertical velocity
        this.idleTimer = 0;

        if (this.vy < -2) {
          this.state = "jumpRise"; // 34
        } else if (this.vy >= -2 && this.vy <= 2) {
          this.state = "jumpPeak"; // 35–36
        } else {
          this.state = "jumpFall"; // 37
        }
      } else if (Math.abs(this.vx) > 0.01) {
        this.state = "walk";
        this.idleTimer = 0;
      } else {
        this.idleTimer += deltaTime;
        this.state = this.idleTimer >= this.longIdleAfter ? "longIdle" : "idle";
      }
    }

    // --- Apply animation
    this.setAnim(this.state);

    const currentAnimation = this.anims[this.currentAnimKey] || this.anims.idle;
    currentAnimation.update(deltaTime);

    // --- Invincibility timer
    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincibleTimer = 0;
        this.invincible = false;
      }
    }
  }

  // ------------------------------------------------------------
  // Damage
  // ------------------------------------------------------------
  takeDamage() {
    if (this.dead) return;
    if (this.invincible) return;

    this.hp -= 1;

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

  // ------------------------------------------------------------
  // Draw
  // ------------------------------------------------------------
  draw(context, cameraX = 0) {
    const animation = this.anims[this.currentAnimKey] || this.anims.idle;

    if (!animation.isReady()) return;

    const image = animation.getCurrentImage();

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // Blink when hurt (keeps your old behavior)
    if (this.hurtActive && !this.dead) {
      if (Math.floor(this.hurtTimer / 3) % 2 === 0) return;
    }

    context.save();

    if (this.facing === -1) {
      context.translate(screenX + this.w, 0);
      context.scale(-1, 1);
      context.drawImage(image, 0, drawY, this.w, this.h);
    } else {
      context.drawImage(image, screenX, drawY, this.w, this.h);
    }

    context.restore();
  }

  // ------------------------------------------------------------
  // Collision bounds
  // ------------------------------------------------------------
  getBounds() {
    return { x: this.x, y: this.y - this.h, w: this.w, h: this.h };
  }
}
