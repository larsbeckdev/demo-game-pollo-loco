import Collectable from "./Collectable.js";

export default class Coin extends Collectable {
  constructor({ x, y } = {}) {
    super({ x, y, w: 40, h: 40 });

    this.img = new Image();
    this.img.src = "/images/8_coin/coin_1.png"; // passt zu deinem Ordner
  }

  draw(ctx, cameraX = 0) {
    if (this.collected) return;
    ctx.drawImage(this.img, this.x - cameraX, this.y, this.w, this.h);
  }

  onCollect(world) {
    if (this.collected) return;
    this.collected = true;

    world.stats.addCoin(1);
    world.sound.play("coin");
  }
}
