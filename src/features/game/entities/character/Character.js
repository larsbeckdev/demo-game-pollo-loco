function makeFramePaths(base, names) {
  return names.map((n) => `${base}/${n}`);
}

function rangeFrames(prefix, from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(`${prefix}${i}.png`);
  return arr;
}

class FrameAnimation {
  constructor(paths, fps = 12) {
    this.paths = paths;
    this.fps = fps;

    this.images = paths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    this.frame = 0;
    this.acc = 0;
  }

  reset() {
    this.frame = 0;
    this.acc = 0;
  }

  update(dt) {
    const frameTime = 60 / this.fps; // in "dt units"
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;
      this.frame = (this.frame + 1) % this.images.length;
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
  constructor({
    x = 60,
    groundY = 360, // y ist "Fußpunkt"
    width = 90,
    height = 180,
  } = {}) {
    // World Pos
    this.x = x;
    this.y = groundY;
    this.groundY = groundY;

    // Size
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

    // Health System
    this.maxHp = 3;
    this.hp = 3;

    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 60;

    this.dead = false;

    this.hurtActive = false;
    this.hurtTimer = 0;
    this.hurtDuration = 24; // ~0.4s bei 60fps (dt≈1)

    // State
    this.state = "idle"; // idle | long_idle | walk | jump | fall
    this.idleTimer = 0; // für long idle trigger
    this.longIdleAfter = 180; // ~3s bei 60fps (dt=1)

    // --- Animation setup (PUBLIC paths!)
    const base = "/images/2_character_pepe";

    const idlePaths = makeFramePaths(
      `${base}/1_idle/idle`,
      rangeFrames("I-", 1, 10),
    );

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

    this.anims = {
      idle: new FrameAnimation(idlePaths, 10),
      long_idle: new FrameAnimation(longIdlePaths, 8),
      walk: new FrameAnimation(walkPaths, 14),
      jump: new FrameAnimation(jumpPaths, 10),
      fall: new FrameAnimation(jumpPaths, 10),
      hurt: new FrameAnimation(hurtPaths, 12),
      dead: new FrameAnimation(deadPaths, 10),
    };

    this.currentAnimKey = "idle";
  }

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
    if (keyboard?.JUMP) this.jump();
  }

  jump() {
    if (!this.onGround) return;
    this.onGround = false;
    this.vy = -this.jumpForce;
  }

  setAnim(key) {
    if (this.currentAnimKey === key) return;

    const isJumpFallSwitch =
      (this.currentAnimKey === "jump" && key === "fall") ||
      (this.currentAnimKey === "fall" && key === "jump");

    this.currentAnimKey = key;

    if (!isJumpFallSwitch) {
      this.anims[key]?.reset();
    }
  }

  update(dt = 1) {
    // Move X
    this.x += this.vx * dt;

    // Gravity
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    // Ground
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // --- State priority: dead > hurt > movement
    if (this.dead) {
      this.state = "dead";
    } else if (this.hurtActive) {
      this.state = "hurt";
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this.hurtActive = false;
        this.hurtTimer = 0;
      }
    } else {
      // normal states
      if (!this.onGround) {
        this.idleTimer = 0;
        this.state = this.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(this.vx) > 0.01) {
        this.idleTimer = 0;
        this.state = "walk";
      } else {
        this.idleTimer += dt;
        this.state =
          this.idleTimer >= this.longIdleAfter ? "long_idle" : "idle";
      }
    }

    this.setAnim(this.state);
    this.anims[this.currentAnimKey].update(dt);

    // Invincibility Timer
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincibleTimer = 0;
        this.invincible = false;
      }
    }
  }

  takeDamage() {
    if (this.dead) return;
    if (this.invincible) return;

    this.hp--;

    // iFrames
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;

    // hurt animation trigger
    this.hurtActive = true;
    this.hurtTimer = this.hurtDuration;

    // optional: kleiner knockback
    this.vx = 0;

    // TODO vor Abgabe entfernen:
    console.log("HP:", this.hp);

    if (this.hp <= 0) {
      this.dead = true;
      this.hurtActive = false;
      this.hurtTimer = 0;

      // Bewegung stoppen
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx, cameraX = 0) {
    const anim = this.anims[this.currentAnimKey];
    const img = anim.image;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // Blinken bei Invincibility
    if (this.hurtActive && !this.dead) {
      if (Math.floor(this.hurtTimer / 3) % 2 === 0) return;
    }

    // Wenn noch nicht geladen: simple placeholder
    if (!anim.ready) return;

    ctx.save();

    // Flip bei facing left
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
