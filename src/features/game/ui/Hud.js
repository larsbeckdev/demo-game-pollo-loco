export default class Hud {
  constructor(world) {
    this.world = world;

    this.coinImg = new Image();
    this.coinImg.src = "/images/8_coin/coin_1.png";

    this.bottleImg = new Image();
    this.bottleImg.src = "/images/6_salsa_bottle/salsa_bottle.png";
  }

  draw(ctx) {
    const { stats } = this.world;

    // background plate
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillRect(16, 16, 260, 64);
    ctx.restore();

    // coin
    ctx.drawImage(this.coinImg, 24, 24, 32, 32);
    ctx.fillText(`x ${stats.coins}`, 64, 46);

    // bottle
    ctx.drawImage(this.bottleImg, 130, 24, 32, 32);
    ctx.fillText(`x ${stats.bottles}`, 170, 46);

    // health bar
    ctx.fillText("HP", 24, 74);
    ctx.fillRect(58, 62, 180, 12);
    const w = Math.max(0, Math.min(180, (stats.health / 100) * 180));
    ctx.fillRect(58, 62, w, 12);
  }
}
