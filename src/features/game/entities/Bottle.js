// src/classes/entities/Bottle.js

const BOTTLE_SRC = "./images/6_salsa_bottle/salsa_bottle.png"; // ggf. dein echter Pfad

export default class Bottle {
  constructor({ x, y, direction, groundY, worldWidth }) {
    this.x = x;
    this.y = y;

    this.w = 40;
    this.h = 40;

    this.groundY = groundY ?? 380;
    this.worldWidth = worldWidth ?? 6000;

    // ✅ langsamer + ~20% kürzere Reichweite
    this.vx = 6.8 * direction; // vorher 9 -> kürzer + langsamer
    this.vy = -10.5; // vorher -12 -> weniger hoch/weit
    this.gravity = 0.85; // vorher 0.7 -> fällt schneller runter => weniger Weite

    // Rotation nur im Flug
    this.rotation = 0;
    this.rotationSpeed = 0.18 * direction;

    // 상태
    this.state = "flying"; // flying | landed
    this.alive = true;

    // Sprite
    this.img = new Image();
    this.imgLoaded = false;
    this.img.onload = () => (this.imgLoaded = true);
    this.img.src = BOTTLE_SRC;
  }

  land() {
    this.state = "landed";
    this.vx = 0;
    this.vy = 0;

    // etwas tiefer setzen (Feinjustierung)
    this.y = this.groundY + 12; 
  }

  update(dt) {
    if (!this.alive) return;

    // ✅ bleibt liegen, keine Physik mehr
    if (this.state === "landed") return;

    // Flug
    this.x += this.vx * dt;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    this.rotation += this.rotationSpeed * dt;

    // Boden-Kontakt -> liegen bleiben
    if (this.y >= this.groundY) {
      this.land();
    }

    // Weltgrenzen: wenn weit außerhalb, entfernen
    if (this.x < -300 || this.x > this.worldWidth + 300) {
      this.alive = false;
    }
  }

  draw(ctx, cameraX = 0) {
    if (!this.alive) return;
    if (!this.imgLoaded) return;

    const screenX = this.x - cameraX;
    const drawY = this.y - this.h;

    ctx.save();

    if (this.state === "flying") {
      ctx.translate(screenX + this.w / 2, drawY + this.h / 2);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    } else {
      // ✅ landed: 90° gedreht "liegend"
      ctx.translate(screenX + this.w / 2, drawY + this.h / 2);
      ctx.rotate(Math.PI / 2);

      // wenn gedreht: Breite/Höhe tauschen
      ctx.drawImage(this.img, -this.h / 2, -this.w / 2, this.h, this.w);
    }

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y - this.h, w: this.w, h: this.h };
  }
}
