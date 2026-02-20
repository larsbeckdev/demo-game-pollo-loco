function makeFramePaths(base, names) {
  return names.map((n) => `${base}/${n}`);
}

function rangeFrames(prefix, from, to) {
  const arr = [];
  for (let i = from; i <= to; i++) arr.push(`${i}${prefix}.png`);
  return arr;
}

class FrameAnimation {
  constructor(paths, fps = 8) {
    this.images = paths.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    this.frame = 0;
    this.acc = 0;
    this.fps = fps;
  }

  update(dt) {
    const frameTime = 60 / this.fps;
    this.acc += dt;

    while (this.acc >= frameTime) {
      this.acc -= frameTime;
      this.frame = (this.frame + 1) % this.images.length;
    }
  }

  get image() {
    return this.images[this.frame];
  }
}

export default class Enemy {
  constructor({ x, groundY, scale = 0.5 }) {
    this.x = x;
    this.y = groundY;

    this.baseWidth = 80;
    this.baseHeight = 80;

    this.w = this.baseWidth * scale;
    this.h = this.baseHeight * scale;

    this.speed = 1.2;
    this.direction = -1;

    this.alive = true;

    const base = "./images/3_enemies_chicken/chicken_normal";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "1_w.png",
      "2_w.png",
      "3_w.png",
    ]);

    this.walkAnim = new FrameAnimation(walkPaths, 8);

    this.deadImg = new Image();
    this.deadImg.src = `${base}/2_dead/dead.png`;
  }

  update(dt) {
    if (!this.alive) return;

    this.x += this.speed * this.direction * dt;

    if (this.x < 200) this.direction = 1;
    if (this.x > 1200) this.direction = -1;

    this.walkAnim.update(dt);
  }

  draw(ctx, cameraX = 0) {
    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    if (!this.alive) {
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
    this.alive = false;
  }
}
