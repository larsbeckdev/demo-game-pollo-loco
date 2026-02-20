function makeFramePaths(base, names) {
  return names.map((n) => `${base}/${n}`);
}

function rangeFrames(prefix, from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(`${prefix}${i}.png`);
  return arr;
}

/**
 * dt is expected like you already use it:
 * dt ~= 1 at ~60fps (i.e. "frames" not seconds)
 */
class FrameAnimation {
  constructor(
    paths,
    fps = 10,
    { loop = true, holdLast = false } = {}, // ✅ control looping / last frame
  ) {
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

    // dt≈1 at 60fps => frameTime is in "dt units"
    this.frameTime = 60 / fps;

    this.finished = false;
  }

  reset() {
    this.frame = 0;
    this.acc = 0;
    this.finished = false;
  }

  update(dt) {
    if (!this.images.length) return;
    if (this.finished) return;

    this.acc += dt;

    // ✅ keep remainder (no speed spikes / no "too fast" feel)
    while (this.acc >= this.frameTime) {
      this.acc -= this.frameTime;

      const next = this.frame + 1;

      if (next >= this.images.length) {
        if (this.loop) {
          this.frame = 0;
        } else {
          this.finished = true;
          this.frame = this.holdLast ? this.images.length - 1 : 0;
          break;
        }
      } else {
        this.frame = next;
      }
    }
  }

  get image() {
    return this.images[this.frame];
  }

  get ready() {
    const img = this.image;
    return img && img.complete && img.naturalWidth > 0;
  }
}

export default class Character {
  constructor({ x = 120, groundY = 380, width = 90, height = 140 } = {}) {
    // position
    this.x = x;
    this.y = groundY;
    this.groundY = groundY;

    // size
    this.w = width;
    this.h = height;

    // physics
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.8;
    this.jumpForce = 14;
    this.gravity = 0.9;
    this.onGround = true;

    // --- health / damage ---
    this.maxHp = 100;
    this.hp = this.maxHp;

    // invincibility frames after hit (ms)
    this.invincibleUntil = 0;

    // optional: knockback tuning
    this.knockbackX = 6;
    this.knockbackY = 7;

    // direction
    this.facing = 1; // 1 right, -1 left

    // state
    this.state = "idle";
    this.currentAnimKey = "idle";

    // ✅ prevent jump spam when holding the key
    this.jumpHeld = false;

    // animations
    const base = "/images/2_character_pepe";

    const idlePaths = makeFramePaths(
      `${base}/1_idle/idle`,
      rangeFrames("I-", 1, 10),
    );

    const walkPaths = makeFramePaths(
      `${base}/2_walk`,
      rangeFrames("W-", 21, 26),
    );

    const jumpPaths = makeFramePaths(
      `${base}/3_jump`,
      rangeFrames("J-", 31, 39),
    );

    this.anims = {
      idle: new FrameAnimation(idlePaths, 10, { loop: true }),
      walk: new FrameAnimation(walkPaths, 14, { loop: true }),

      // ✅ jump should NOT loop; keep last frame until you land
      jump: new FrameAnimation(jumpPaths, 10, { loop: false, holdLast: true }),
    };
  }

  handleInput(keyboard) {
    this.vx = 0;

    if (keyboard?.LEFT) {
      this.vx = -this.speed;
      this.facing = -1;
    } else if (keyboard?.RIGHT) {
      this.vx = this.speed;
      this.facing = 1;
    }

    // ✅ jump only on "press", not while held
    const jumpNow = !!keyboard?.JUMP;
    if (jumpNow && !this.jumpHeld) this.jump();
    this.jumpHeld = jumpNow;
  }

  jump() {
    if (!this.onGround) return;
    this.onGround = false;
    this.vy = -this.jumpForce;

    // ✅ ensure jump animation starts immediately when you jump
    this.setAnim("jump");
  }

  setAnim(key) {
    if (this.currentAnimKey === key) return;
    this.currentAnimKey = key;
    this.anims[key]?.reset();
  }

  update(dt = 1) {
    // move x
    this.x += this.vx * dt;

    // gravity + move y
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    // ground collision
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // state (only 3)
    if (!this.onGround) this.state = "jump";
    else if (Math.abs(this.vx) > 0.01) this.state = "walk";
    else this.state = "idle";

    this.setAnim(this.state);
    this.anims[this.currentAnimKey].update(dt);
  }

  draw(ctx, cameraX = 0) {
    const anim = this.anims[this.currentAnimKey];
    if (!anim?.ready) return;

    const img = anim.image;
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    if (this.facing === -1) {
      ctx.translate(screenX + this.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, drawY, this.w, this.h);
    } else {
      ctx.drawImage(img, screenX, drawY, this.w, this.h);
    }

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y - this.h, w: this.w, h: this.h };
  }
}
