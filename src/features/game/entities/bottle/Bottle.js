const BOTTLE_SRC = "./images/6_salsa_bottle/salsa_bottle.png";

export default class Bottle {
  constructor({ x, y, direction, groundY, worldWidth }) {
    this.x = x;
    this.y = y;

    this.w = 40;
    this.h = 40;

    this.groundY = groundY ?? 380;
    this.worldWidth = worldWidth ?? 6000;

    // Physics
    this.vx = 6.8 * direction;
    this.vy = -10.5;
    this.gravity = 0.85;

    this.rotation = 0;
    this.rotationSpeed = 0.18 * direction;

    this.state = "flying";
    this.alive = true;

    // ==============================
    // DEBUG
    // ==============================
    this._dbg = {
      enabled: true, // <- ausschalten für Ruhe
      deep: false,
      id: Math.random().toString(16).slice(2, 7),
      lastFlightLog: 0,
      lastDrawLog: 0,
      lastState: this.state,
    };

    if (this._dbg.enabled) {
      console.log(`%c[Bottle#${this._dbg.id}] SPAWN`, "color:orange;", {
        x: this.x,
        y: this.y,
        vx: this.vx,
        vy: this.vy,
        gravity: this.gravity,
        groundY: this.groundY,
        worldWidth: this.worldWidth,
      });
    }

    // ==============================
    // Sprite
    // ==============================

    this.img = new Image();
    this.imgLoaded = false;

    this.img.onload = () => {
      this.imgLoaded = true;
      if (this._dbg.enabled) {
        console.log(`%c[Bottle#${this._dbg.id}] IMAGE LOADED`, "color:green;", {
          width: this.img.naturalWidth,
          height: this.img.naturalHeight,
        });
      }
    };

    this.img.onerror = () => {
      if (this._dbg.enabled) {
        console.error(`[Bottle#${this._dbg.id}] IMAGE FAILED`, BOTTLE_SRC);
      }
    };

    this.img.src = BOTTLE_SRC;
  }

  // =====================================================
  // LAND
  // =====================================================

  land() {
    if (this.state === "landed") return;

    this.state = "landed";
    this.vx = 0;
    this.vy = 0;
    this.y = this.groundY + 12;

    if (this._dbg.enabled) {
      console.log(`%c[Bottle#${this._dbg.id}] LANDED`, "color:purple;", {
        x: this.x.toFixed(1),
        y: this.y.toFixed(1),
      });
    }
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(dt) {
    if (!this.alive) return;

    if (this.state === "landed") return;

    this.x += this.vx * dt;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;

    // Throttled flight log (1x/sec)
    if (this._dbg.enabled) {
      const now = performance.now();
      if (now - this._dbg.lastFlightLog > 1000) {
        console.log(`[Bottle#${this._dbg.id}] flying`, {
          x: this.x.toFixed(1),
          y: this.y.toFixed(1),
          vy: this.vy.toFixed(2),
        });
        this._dbg.lastFlightLog = now;
      }
    }

    if (this.y >= this.groundY) {
      this.land();
    }

    if (this.x < -300 || this.x > this.worldWidth + 300) {
      this.alive = false;

      if (this._dbg.enabled) {
        console.log(`%c[Bottle#${this._dbg.id}] DESPAWN`, "color:red;", {
          x: this.x.toFixed(1),
        });
      }
    }

    // State change detection
    if (this._dbg.enabled && this.state !== this._dbg.lastState) {
      console.log(`[Bottle#${this._dbg.id}] state → ${this.state}`);
      this._dbg.lastState = this.state;
    }
  }

  // =====================================================
  // DRAW
  // =====================================================

  draw(ctx, cameraX = 0) {
    if (!this.alive) return;

    if (!this.imgLoaded) {
      if (this._dbg.enabled && this._dbg.deep) {
        console.warn(`[Bottle#${this._dbg.id}] draw skipped (img not loaded)`);
      }
      return;
    }

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    // Throttled draw log
    if (this._dbg.enabled) {
      const now = performance.now();
      if (now - this._dbg.lastDrawLog > 2000) {
        console.log(`[Bottle#${this._dbg.id}] draw`, {
          state: this.state,
          screenX: screenX.toFixed(1),
        });
        this._dbg.lastDrawLog = now;
      }
    }

    ctx.save();

    if (this.state === "flying") {
      ctx.translate(screenX + this.w / 2, drawY + this.h / 2);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    } else {
      ctx.translate(screenX + this.w / 2, drawY + this.h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(this.img, -this.h / 2, -this.w / 2, this.h, this.w);
    }

    ctx.restore();
  }

  // =====================================================
  // BOUNDS
  // =====================================================

  getBounds() {
    const bounds = {
      x: this.x,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };

    if (this._dbg.enabled && this._dbg.deep) {
      console.log(`[Bottle#${this._dbg.id}] bounds`, bounds);
    }

    return bounds;
  }
}
