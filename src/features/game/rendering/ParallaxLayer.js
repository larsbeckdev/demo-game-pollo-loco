export default class ParallaxLayer {
  constructor({ src, speed = 1, y = 0 }) {
    this.src = src;
    this.speed = speed;
    this.y = y;

    this.img = new Image();
    this.loaded = false;
    this.img.onload = () => (this.loaded = true);
    this.img.src = src;
  }

  draw(ctx, canvasWidth, canvasHeight, cameraX = 0) {
    if (!this.loaded) return;

    const imgW = this.img.width;
    const imgH = this.img.height;

    const scale = canvasHeight / imgH;
    const drawW = imgW * scale;
    const drawH = canvasHeight;

    const offsetX = -(cameraX * this.speed) % drawW;

    for (let x = offsetX - drawW; x < canvasWidth + drawW; x += drawW) {
      ctx.drawImage(this.img, x, this.y, drawW, drawH);
    }
  }
}
