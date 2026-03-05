// Bottle.js
const BOTTLE_SRC = "/images/6_salsa_bottle/salsa_bottle.png";
const SPLASH_FRAMES = Array.from(
  { length: 6 },
  (_, i) =>
    `/images/6_salsa_bottle/bottle_rotation/bottle_splash/${i + 1}_bottle_splash.png`,
);

// helper
function isDrawableImage(img) {
  return !!img && img.complete === true && img.naturalWidth > 0;
}

export default class Bottle {
  constructor({ x, y, direction = 1, groundY, worldWidth, onBreak } = {}) {
    this.x = x ?? 0;
    this.y = y ?? 0;

    this.w = 40;
    this.h = 40;

    this.groundY = groundY ?? 380;
    this.worldWidth = worldWidth ?? 6000;

    // --------------------------------
    // Physics
    // --------------------------------
    this.vx = 6.8 * direction;
    this.vy = -10.5;
    this.gravity = 0.85;

    this.rotation = 0;
    this.rotationSpeed = 0.18 * direction;

    // --------------------------------
    // State
    // --------------------------------
    // flying | landed | splash | done
    this.state = "flying";
    this.alive = true;

    // callback hook (sound etc.)
    this.onBreak = typeof onBreak === "function" ? onBreak : null;

    // --------------------------------
    // DEBUG
    // --------------------------------
    this._dbg = {
      enabled: false,
      deep: false,
      id: Math.random().toString(16).slice(2, 7),
      lastDrawLog: 0,
    };

    // --------------------------------
    // Bottle sprite
    // --------------------------------
    this.img = new Image();
    this.imgLoaded = false;

    this.img.onload = () => {
      this.imgLoaded = true;
      if (this._dbg.enabled) {
        console.log(`[Bottle#${this._dbg.id}] bottle img loaded`);
      }
    };

    this.img.onerror = () => {
      if (this._dbg.enabled) {
        console.error(`[Bottle#${this._dbg.id}] bottle img FAILED`, BOTTLE_SRC);
      }
    };

    this.img.src = BOTTLE_SRC;

    // --------------------------------
    // Splash animation (preload + track)
    // --------------------------------
    this.splashImgsLoaded = false;
    this._splashLoadedCount = 0;

    this.splashImgs = SPLASH_FRAMES.map((src) => {
      const im = new Image();

      im.onload = () => {
        this._splashLoadedCount++;
        if (this._splashLoadedCount >= SPLASH_FRAMES.length) {
          this.splashImgsLoaded = true;
          if (this._dbg.enabled) {
            console.log(
              `[Bottle#${this._dbg.id}] splash imgs loaded (${this._splashLoadedCount}/${SPLASH_FRAMES.length})`,
            );
          }
        }
      };

      im.onerror = () => {
        if (this._dbg.enabled) console.error("[Bottle] splash img failed", src);
      };

      im.src = src;
      return im;
    });

    this.splashFrame = 0;
    this.splashAcc = 0;
    this.splashFps = 14; // tweak: 12..18 nice
  }

  // =====================================================
  // BREAK (on ground / on hit)
  // =====================================================
  // ✅ CHANGE: optional hitY (z.B. Boss-Trefferpunkt)
  break(hitY) {
    // only break from flying
    if (this.state !== "flying") return;

    // stop movement
    this.vx = 0;
    this.vy = 0;

    // ✅ CHANGE:
    // wenn hitY gegeben ist -> Splash dort,
    // sonst -> am Boden
    if (Number.isFinite(hitY)) {
      this.y = hitY;
    } else {
      this.y = this.groundY + 12;
    }

    const first = this.splashImgs?.[0];
    const canSplashNow = isDrawableImage(first);

    // If splash not ready yet, keep bottle lying as "landed"
    if (!canSplashNow) {
      this.state = "landed";
      if (this._dbg.enabled) {
        console.log(
          `[Bottle#${this._dbg.id}] break -> landed (splash not ready)`,
        );
      }
      return;
    }

    // Start splash immediately
    this.state = "splash";
    this.splashFrame = 0;
    this.splashAcc = 0;

    this.onBreak?.();

    if (this._dbg.enabled) {
      console.log(`[Bottle#${this._dbg.id}] BREAK -> SPLASH`, { hitY });
    }
  }

  // =====================================================
  // UPDATE
  // =====================================================
  update(dt) {
    if (!this.alive) return;

    const d = Number.isFinite(dt) ? dt : 1;

    if (this.state === "flying") {
      this.x += this.vx * d;
      this.vy += this.gravity * d;
      this.y += this.vy * d;

      this.rotation += this.rotationSpeed * d;

      // ground collision -> break (am Boden)
      if (this.y >= this.groundY) {
        this.break(); // ✅ kein hitY -> Boden
      }

      // out of bounds -> remove
      if (this.x < -200 || this.x > this.worldWidth + 200) {
        this.alive = false;
      }
      return;
    }

    // If we're landed, switch to splash as soon as frame 0 becomes drawable
    if (this.state === "landed") {
      const first = this.splashImgs?.[0];
      if (isDrawableImage(first)) {
        this.state = "splash";
        this.splashFrame = 0;
        this.splashAcc = 0;

        this.onBreak?.();

        if (this._dbg.enabled) {
          console.log(`[Bottle#${this._dbg.id}] landed -> splash (now ready)`);
        }
      }
      return;
    }

    if (this.state === "splash") {
      const frameTime = 60 / this.splashFps; // dt unit is frames @ 60fps
      this.splashAcc += d;

      while (this.splashAcc >= frameTime) {
        this.splashAcc -= frameTime;
        this.splashFrame++;

        if (this.splashFrame >= this.splashImgs.length) {
          this.state = "done";
          this.alive = false; // disappear after splash
          return;
        }
      }
    }
  }

  // =====================================================
  // DRAW
  // =====================================================
  draw(ctx, cameraX = 0) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;

    // SPLASH
    if (this.state === "splash") {
      const img = this.splashImgs?.[this.splashFrame];
      if (!isDrawableImage(img)) return;

      const splashW = 90;
      const splashH = 60;

      const sx = screenX - splashW / 2 + this.w / 2;

      // ✅ CHANGE: Splash an Bottle.y (Trefferpunkt), NICHT groundY
      // this.y ist bei Bodenbreak = groundY+12, bei Bossbreak = hitY
      const sy = this.y - this.h - splashH / 2 + 10;

      try {
        ctx.drawImage(img, sx, sy, splashW, splashH);
      } catch {
        // skip frame if browser complains
      }
      return;
    }

    // LANDED (bottle lying on ground while splash loads)
    if (this.state === "landed") {
      if (!isDrawableImage(this.img)) return;

      const sy = this.groundY - this.h + 12;

      try {
        ctx.save();
        ctx.translate(screenX + this.w / 2, sy + this.h / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(this.img, -this.h / 2, -this.w / 2, this.h, this.w);
        ctx.restore();
      } catch {
        try {
          ctx.restore?.();
        } catch {}
      }
      return;
    }

    // FLYING
    if (this.state !== "flying") return;
    if (!isDrawableImage(this.img)) return;

    const drawY = this.y - this.h;

    try {
      ctx.save();
      ctx.translate(screenX + this.w / 2, drawY + this.h / 2);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    } catch {
      try {
        ctx.restore?.();
      } catch {}
    }
  }

  // =====================================================
  // BOUNDS (für CollisionSystem)
  // =====================================================
  getBounds() {
    return {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };
  }
}
