/* ============================================================================
  ParallaxLayer
  - Represents a single background layer
  - Moves horizontally depending on camera position and speed factor
  - Can also move by itself (autoSpeed)
  - Automatically tiles itself to avoid visible gaps
============================================================================ */

export default class ParallaxLayer {
  /**
   * @param {object} opts
   * @param {string} opts.src
   * @param {number} [opts.speed=1]      Parallax factor (lower = slower movement)
   * @param {number} [opts.y=0]          Vertical offset
   * @param {number} [opts.autoSpeed=0]  Auto scroll (px per dt-unit, dt≈1 at 60fps)
   * @param {number} [opts.overlap=2]    Extra px overlap to hide seams
   */
  constructor({ src, speed = 1, y = 0, autoSpeed = 0, overlap = 2 } = {}) {
    this.src = src;
    this.speed = speed;
    this.y = y;

    // ✅ auto movement
    this.autoSpeed = autoSpeed;
    this.autoX = 0;

    // ✅ seam helper
    this.overlap = overlap;

    // Image loading
    this.img = new Image();
    this.loaded = false;

    this.img.onload = () => {
      this.loaded = true;
    };

    this.img.onerror = () => {
      // don't crash the game loop if an image fails
      this.loaded = false;
      console.error("[ParallaxLayer] image failed:", src);
    };

    this.img.src = src;
  }

  // called every frame
  update(dt = 1) {
    const d = Number.isFinite(dt) ? dt : 1;
    this.autoX += this.autoSpeed * d;
  }

  draw(ctx, canvasWidth, canvasHeight, cameraX = 0) {
    if (!this.loaded) return;
    if (!this.img.complete || this.img.naturalWidth === 0) return;

    const imageWidth = this.img.width;
    const imageHeight = this.img.height;

    // scale to full canvas height
    const scale = canvasHeight / imageHeight;

    // snap to ints (helps avoid subpixel seams)
    const drawWidth = Math.ceil(imageWidth * scale);
    const drawHeight = Math.ceil(canvasHeight);

    // combined movement: camera parallax + auto drift
    const totalMove = cameraX * this.speed + this.autoX;

    // stable positive modulo
    const move = ((totalMove % drawWidth) + drawWidth) % drawWidth;
    const offsetX = -move;

    // ✅ draw enough tiles to always cover screen, even with rounding/overlap
    // Start further left and go further right than needed
    const startX = offsetX - drawWidth - this.overlap;
    const endX = canvasWidth + drawWidth + this.overlap;

    for (let x = startX; x < endX; x += drawWidth) {
      ctx.drawImage(
        this.img,
        Math.round(x),
        Math.round(this.y),
        drawWidth + this.overlap,
        drawHeight,
      );
    }
  }
}
