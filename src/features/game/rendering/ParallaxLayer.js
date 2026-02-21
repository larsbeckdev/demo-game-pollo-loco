/* ============================================================================
  ParallaxLayer
  - Represents a single background layer
  - Moves horizontally depending on camera position and speed factor
  - Automatically tiles itself to avoid visible gaps
============================================================================ */

export default class ParallaxLayer {
  /* ==========================================================================
    Constructor
    - src: image path
    - speed: parallax factor (lower = slower movement)
    - y: vertical offset
  ========================================================================== */

  constructor({ src, speed = 1, y = 0 }) {
    /* ------------------------------------------------------------------------
      Configuration
    ------------------------------------------------------------------------ */

    this.src = src;
    this.speed = speed;
    this.y = y;

    /* ------------------------------------------------------------------------
      Image loading
      - Create Image object
      - Track loading state to avoid drawing before ready
    ------------------------------------------------------------------------ */

    this.img = new Image();
    this.loaded = false;

    this.img.onload = () => {
      this.loaded = true;
    };

    this.img.src = src;
  }

  /* ==========================================================================
    draw
    - Draws the layer tiled horizontally
    - ctx: canvas 2D rendering context
    - canvasWidth: width of the canvas
    - canvasHeight: height of the canvas
    - cameraX: horizontal camera offset
  ========================================================================== */

  draw(ctx, canvasWidth, canvasHeight, cameraX = 0) {
    /* ------------------------------------------------------------------------
      Skip rendering if image is not loaded yet
    ------------------------------------------------------------------------ */

    if (!this.loaded) return;

    /* ------------------------------------------------------------------------
      Original image dimensions
    ------------------------------------------------------------------------ */

    const imageWidth = this.img.width;
    const imageHeight = this.img.height;

    /* ------------------------------------------------------------------------
      Scale calculation
      - Scale image so that it always fills the full canvas height
    ------------------------------------------------------------------------ */

    const scale = canvasHeight / imageHeight;

    // ✅ CHANGE: avoid subpixel seams by snapping draw sizes to integers
    const rawDrawWidth = imageWidth * scale;
    const drawWidth = Math.ceil(rawDrawWidth);
    const drawHeight = Math.ceil(canvasHeight);

    /* ------------------------------------------------------------------------
      Parallax offset calculation
      - Multiply cameraX by speed factor
      - Use modulo to create seamless horizontal tiling
    ------------------------------------------------------------------------ */

    // CHANGE: stable modulo (always positive)
    const move = (cameraX * this.speed) % drawWidth;
    const offsetX = -((move + drawWidth) % drawWidth);

    /* ------------------------------------------------------------------------
      Horizontal tiling
      - Draw multiple copies of the image next to each other
      - Ensures there are no visible gaps when scrolling
    ------------------------------------------------------------------------ */

    // ✅ CHANGE: small overlap to hide 1px gaps from scaling / resampling
    const overlap = 2;

    for (
      let xPosition = offsetX - drawWidth;
      xPosition < canvasWidth + drawWidth;
      xPosition += drawWidth
    ) {
      ctx.drawImage(
        this.img,
        Math.round(xPosition), // ✅ CHANGE: pixel snapping
        Math.round(this.y), // ✅ CHANGE: pixel snapping
        drawWidth + overlap, // ✅ CHANGE: overlap
        drawHeight,
      );
    }
  }
}
