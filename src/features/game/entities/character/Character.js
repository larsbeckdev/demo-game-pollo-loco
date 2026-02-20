// src/.../Character.js

/**
 * Build full image paths from a base folder and a list of file names.
 * Example: base="/img/walk" + ["W-21.png"] => "/img/walk/W-21.png"
 */
function makeFramePaths(base, names) {
  return names.map((n) => `${base}/${n}`);
}

/**
 * Generate a list of frame file names with a numeric range.
 * Example: rangeFrames("W-", 21, 26) => ["W-21.png", ..., "W-26.png"]
 */
function rangeFrames(prefix, from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(`${prefix}${i}.png`);
  return arr;
}

/**
 * Very small frame-based animation player.
 *
 * IMPORTANT: This animation assumes that `dt` is in "frame units":
 * - If your game loop runs at 60fps, then dt ≈ 1 each frame.
 * - If a frame is slower/faster, dt might be 0.8 or 1.3 etc.
 *
 * Because of that, we convert fps to "dt units" with:
 *   frameTime = 60 / fps
 * Example:
 *   fps = 10 => frameTime = 6
 *   => animation advances 1 frame every ~6 "dt units" (~6 frames at 60fps)
 */
class FrameAnimation {
  /**
   * @param {string[]} paths - list of image URLs (public folder paths)
   * @param {number} fps - animation speed (frames per second at 60fps baseline)
   * @param {{loop?: boolean, holdLast?: boolean}} options
   */
  constructor(paths, fps = 12, { loop = true, holdLast = false } = {}) {
    this.paths = paths;
    this.fps = fps;

    // Loop: restart after last frame
    this.loop = loop;

    // holdLast: if loop=false, stop on the last frame
    this.holdLast = holdLast;

    // Preload images (browser will cache them if used multiple times)
    this.images = paths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    // Current frame index (0..len-1)
    this.frame = 0;

    // Accumulator for time (in dt units)
    this.acc = 0;
  }

  /** Reset animation playback to the first frame. */
  reset() {
    this.frame = 0;
    this.acc = 0;
  }

  /**
   * Advance animation by dt (frame units).
   * @param {number} dt
   */
  update(dt) {
    // Avoid issues if fps is 0 or images are empty
    if (!this.images.length || this.fps <= 0) return;

    // How many "dt units" must pass to advance 1 animation frame
    const frameTime = 60 / this.fps;

    this.acc += dt;

    // Catch-up logic: if dt is big, we might advance multiple frames
    while (this.acc >= frameTime) {
      this.acc -= frameTime;

      // If looping: wrap around
      if (this.loop) {
        this.frame = (this.frame + 1) % this.images.length;
        continue;
      }

      // Not looping:
      const last = this.images.length - 1;

      if (this.frame < last) {
        this.frame += 1;
      } else {
        // We are at last frame already
        if (!this.holdLast) {
          // If not holding last, reset (rarely used)
          this.frame = 0;
        }
        // If holdLast=true, do nothing (stay on last)
      }
    }
  }

  /** Current image object for rendering. */
  get image() {
    return this.images[this.frame];
  }

  /**
   * Whether current image is loaded and drawable.
   * (complete + naturalWidth > 0 is a common "loaded successfully" check)
   */
  get ready() {
    const img = this.image;
    return img && img.complete && img.naturalWidth > 0;
  }
}

export default class Character {
  /**
   * @param {{
   *   x?: number,
   *   groundY?: number,
   *   width?: number,
   *   height?: number
   * }} opts
   */
  constructor({ x = 120, groundY = 380, width = 90, height = 140 } = {}) {
    // -----------------------------
    // World position
    // -----------------------------
    this.x = x;

    /**
     * y is the "foot point" (bottom of character).
     * When drawing, we render at (x, y - height).
     */
    this.y = groundY;

    // Where the floor is (footpoint)
    this.groundY = groundY;

    // -----------------------------
    // Size (render + hitbox)
    // -----------------------------
    this.w = width;
    this.h = height;

    // -----------------------------
    // Motion / physics
    // -----------------------------
    this.vx = 0;
    this.vy = 0;

    /**
     * Base movement speed in world units per frame (dt=1)
     * If dt is in frame-units, vx * dt keeps movement consistent.
     */
    this.speed = 4.8;

    // Jump impulse (negative vy means "up")
    this.jumpForce = 14;

    // Gravity acceleration (adds to vy every update)
    this.gravity = 0.9;

    // 1 = right, -1 = left (used for sprite flip)
    this.facing = 1;

    // Ground flag (set each update by floor collision)
    this.onGround = true;

    // -----------------------------
    // Health / damage system
    // -----------------------------
    this.maxHp = 3;
    this.hp = 3;

    /**
     * Invincibility frames (iFrames):
     * If invincible=true, takeDamage() will not reduce hp.
     */
    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 60; // ~1s at 60fps

    // Dead state
    this.dead = false;

    /**
     * Hurt state:
     * While hurtActive=true we can block input and optionally blink.
     */
    this.hurtActive = false;
    this.hurtTimer = 0;
    this.hurtDuration = 24; // ~0.4s at 60fps

    // -----------------------------
    // State machine
    // -----------------------------
    /**
     * Possible states:
     * idle | long_idle | walk | jump | fall | hurt | dead
     */
    this.state = "idle";

    // Timer used to transition from idle -> long_idle
    this.idleTimer = 0;

    // After ~3s of standing still, switch to long_idle
    this.longIdleAfter = 180;

    // -----------------------------
    // Animation setup (PUBLIC paths!)
    // -----------------------------
    const base = "/images/2_character_pepe";

    // NOTE: you are building "folder + fileName.png"
    // Example idle: /images/2_character_pepe/1_idle/idle/I-1.png ... I-10.png
    const idlePaths = makeFramePaths(
      `${base}/1_idle/idle`,
      rangeFrames("I-", 1, 10),
    );

    // long idle continues numbering (I-11..I-20) but in different folder
    const longIdlePaths = makeFramePaths(
      `${base}/1_idle/long_idle`,
      rangeFrames("I-", 11, 20),
    );

    const walkPaths = makeFramePaths(
      `${base}/2_walk`,
      rangeFrames("W-", 21, 26),
    );

    const jumpPaths = makeFramePaths(
      `${base}/3_jump`,
      rangeFrames("J-", 31, 39),
    );

    const hurtPaths = makeFramePaths(
      `${base}/4_hurt`,
      rangeFrames("H-", 41, 43),
    );

    const deadPaths = makeFramePaths(
      `${base}/5_dead`,
      rangeFrames("D-", 51, 57),
    );

    /**
     * Animation player instances per state.
     * fps values are tuned for "dt ~= 1 at 60fps".
     *
     * TIP: If something feels too fast:
     * - reduce fps (e.g. walk 14 -> 10)
     * - or clamp dt in your Game loop (e.g. dt = Math.min(dt, 2))
     */
    this.anims = {
      idle: new FrameAnimation(idlePaths, 10),
      long_idle: new FrameAnimation(longIdlePaths, 8),
      walk: new FrameAnimation(walkPaths, 14),
      jump: new FrameAnimation(jumpPaths, 10),
      fall: new FrameAnimation(jumpPaths, 10),
      hurt: new FrameAnimation(hurtPaths, 12),
      dead: new FrameAnimation(deadPaths, 10, { loop: false, holdLast: true }),
    };

    // Current animation key (should match current state)
    this.currentAnimKey = "idle";
  }

  // ==========================================================
  // Input
  // ==========================================================

  /**
   * Reads keyboard flags and sets velocity + facing direction.
   * We block input when dead or currently in hurt animation.
   */
  handleInput(keyboard) {
    if (this.dead) return;
    if (this.hurtActive) return;

    // Reset horizontal movement each frame
    this.vx = 0;

    if (keyboard?.LEFT) {
      this.vx = -this.speed;
      this.facing = -1;
    }

    if (keyboard?.RIGHT) {
      this.vx = this.speed;
      this.facing = 1;
    }

    if (keyboard?.JUMP) this.jump();
  }

  /**
   * Start a jump if we are on the ground.
   * Sets vy to a negative impulse.
   */
  jump() {
    if (!this.onGround) return;
    this.onGround = false;
    this.vy = -this.jumpForce;
  }

  // ==========================================================
  // Animation switching
  // ==========================================================

  /**
   * Switch to a new animation key (state).
   * Resets animation unless we are only switching jump<->fall.
   */
  setAnim(key) {
    if (this.currentAnimKey === key) return;

    // Jump and fall share the same sprite sheet.
    // Avoid resetting so it doesn't "restart" when vy changes sign.
    const isJumpFallSwitch =
      (this.currentAnimKey === "jump" && key === "fall") ||
      (this.currentAnimKey === "fall" && key === "jump");

    this.currentAnimKey = key;

    if (!isJumpFallSwitch) {
      this.anims[key]?.reset();
    }
  }

  // ==========================================================
  // Update (physics + state machine + animation)
  // ==========================================================

  /**
   * Update character logic.
   * @param {number} dt - frame units (dt≈1 at 60fps)
   */
  update(dt = 1) {
    // -----------------------------
    // 1) Physics / movement
    // -----------------------------

    // Move horizontally
    this.x += this.vx * dt;

    // Apply gravity
    this.vy += this.gravity * dt;

    // Move vertically
    this.y += this.vy * dt;

    // Floor collision: clamp to ground
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // -----------------------------
    // 2) State machine priority
    // dead > hurt > movement/idle
    // -----------------------------

    if (this.dead) {
      this.state = "dead";
    } else if (this.hurtActive) {
      this.state = "hurt";

      // Count down hurt time
      this.hurtTimer -= dt;

      // End hurt state when timer ends
      if (this.hurtTimer <= 0) {
        this.hurtActive = false;
        this.hurtTimer = 0;
      }
    } else {
      // Normal behavior states
      if (!this.onGround) {
        // In air: jump or fall
        this.idleTimer = 0;
        this.state = this.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(this.vx) > 0.01) {
        // Walking on ground
        this.idleTimer = 0;
        this.state = "walk";
      } else {
        // Standing still
        this.idleTimer += dt;
        this.state =
          this.idleTimer >= this.longIdleAfter ? "long_idle" : "idle";
      }
    }

    // -----------------------------
    // 3) Animation update
    // -----------------------------
    this.setAnim(this.state);

    // Guard just in case
    const anim = this.anims[this.currentAnimKey];
    anim?.update(dt);

    // -----------------------------
    // 4) Invincibility timer (iFrames)
    // -----------------------------
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincibleTimer = 0;
        this.invincible = false;
      }
    }
  }

  // ==========================================================
  // Damage / death
  // ==========================================================

  /**
   * Apply damage if not invincible/dead.
   * Triggers iFrames and hurt animation.
   */
  takeDamage() {
    if (this.dead) return;
    if (this.invincible) return;

    this.hp -= 1;

    // Start iFrames
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;

    // Trigger hurt state + animation
    this.hurtActive = true;
    this.hurtTimer = this.hurtDuration;

    // Stop horizontal movement during hurt
    this.vx = 0;

    // Debug (remove before submission)
    console.log("HP:", this.hp);

    // Death handling
    if (this.hp <= 0) {
      this.dead = true;
      this.hurtActive = false;
      this.hurtTimer = 0;

      // Stop all movement
      this.vx = 0;
      this.vy = 0;

      // Ensure dead anim starts from beginning
      this.setAnim("dead");
    }
  }

  // ==========================================================
  // Rendering
  // ==========================================================

  /**
   * Draw the character in screen coordinates (worldX - cameraX).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cameraX
   */
  draw(ctx, cameraX = 0) {
    const anim = this.anims[this.currentAnimKey];
    if (!anim) return;

    const img = anim.image;

    // Convert world -> screen
    const screenX = this.x - cameraX;

    // y is foot point, so draw at y - height
    const drawY = this.y - this.h;

    // Blink effect while hurt (not dead)
    // (every 3 ticks toggle visibility)
    if (this.hurtActive && !this.dead) {
      if (Math.floor(this.hurtTimer / 3) % 2 === 0) return;
    }

    // If image not loaded yet, skip (or draw placeholder)
    if (!anim.ready) return;

    ctx.save();

    // Flip horizontally if facing left
    if (this.facing === -1) {
      // Move origin to the right side of the sprite, then scale X by -1
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);

      // After flip, draw at x=0
      ctx.drawImage(img, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(img, screenX, drawY, this.w, this.h);
    }

    ctx.restore();
  }

  // ==========================================================
  // Helpers
  // ==========================================================

  /**
   * Axis-aligned bounding box for collision checks.
   * Returns top-left coordinates + size.
   */
  getBounds() {
    return { x: this.x, y: this.y - this.h, w: this.w, h: this.h };
  }
}
