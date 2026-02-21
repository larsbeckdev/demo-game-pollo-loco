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
  }

  reset() {
    this.frame = 0;
    this.acc = 0;
  }

  update(dt) {
    if (this.images.length <= 1) return;

    const frameTime = 60 / this.fps; // dt-units
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;

      const next = this.frame + 1;
      if (next >= this.images.length) {
        if (this.loop) this.frame = 0;
        else this.frame = this.holdLast ? this.images.length - 1 : 0;
      } else {
        this.frame = next;
      }
    }
  }

  get image() {
    return this.images[this.frame];
  }
}

function makeFramePaths(base, names) {
  return names.map((n) => `${base}/${n}`);
}

export default class EnemyBase {
  constructor({
    x,
    groundY,
    scale = 0.5,
    baseWidth = 80,
    baseHeight = 80,
    speed = 1.2,
    patrolMinX = null,
    patrolMaxX = null,
    direction = -1,
    walkPaths = [],
    walkFps = 8,
    deadImageSrc = null,
    deathLifetime = 120, // ~2s (dt-units)
  } = {}) {
    this.x = x;
    this.y = groundY;

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
  }

  update(dt) {
    if (!this.alive) {
      this.deathTimer += dt;
      if (this.deathTimer >= this.deathLifetime) this.markedForRemoval = true;
      return;
    }

    this.x += this.speed * this.direction * dt;

    if (this.patrolMinX !== null && this.x < this.patrolMinX)
      this.direction = 1;
    if (this.patrolMaxX !== null && this.x > this.patrolMaxX)
      this.direction = -1;

    this.walkAnim.update(dt);
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    if (!this.alive && this.deadImg) {
      ctx.drawImage(this.deadImg, screenX, drawY, this.w, this.h);
      ctx.restore();
      return;
    }

    const img = this.walkAnim.image;

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
  }
}

export { makeFramePaths };
