import Collectable from "./Collectable.js";

export default class SalsaBottlePickup extends Collectable {
  constructor({ x, y } = {}) {
    super({ x, y, w: 32, h: 32 });

    this.img = new Image();
    this.img.src = "/images/6_salsa_bottle/salsa_bottle.png";
  }

  draw(ctx, cameraX = 0) {
    if (this.collected) return;
    ctx.drawImage(this.img, this.x - cameraX, this.y, this.w, this.h);
  }

  onCollect(world) {
    if (this.collected) return;
    this.collected = true;

    world.stats.addBottle(1);
    world.sound.play("bottle");
  }
}
