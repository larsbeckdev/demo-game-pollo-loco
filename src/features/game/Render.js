// src/features/game/Render.js

/* ============================================================================
  Render
  - Background drawing without gaps
  - Small sprite helpers (flip)
  - No game logic here
============================================================================ */

/* ---------------------------------------------------------------------------
  Background Renderer
--------------------------------------------------------------------------- */

export class BackgroundRenderer {
  /**
   * @param {import("./Assets.js").Assets} assets - Assets container
   */
  constructor(assets) {
    this.assets = assets;
  }

  /**
   * Draw all background layers with seamless tiling.
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {{layers: {source: string, speed: number}[]}} background - Background config
   * @param {number} cameraX - Camera offset
   */
  drawBackground(context, canvasWidth, canvasHeight, background, cameraX) {
    for (const layer of background.layers) {
      this._drawTiledLayer(context, canvasWidth, canvasHeight, layer, cameraX);
    }
  }

  /**
   * Draw one background layer tiled across the whole canvas width.
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {{source: string, speed: number}} layer - Layer config
   * @param {number} cameraX - Camera offset
   */
  _drawTiledLayer(context, canvasWidth, canvasHeight, layer, cameraX) {
    const image = this.assets.getImageBySource(layer.source);
    if (!image) return;

    const parallaxOffset = cameraX * layer.speed;
    const imageWidth = image.width || canvasWidth;

    let startX = -(((parallaxOffset % imageWidth) + imageWidth) % imageWidth);

    while (startX < canvasWidth) {
      context.drawImage(image, startX, 0, imageWidth, canvasHeight);
      startX += imageWidth;
    }
  }
}

/* ---------------------------------------------------------------------------
  Sprite Helper
--------------------------------------------------------------------------- */

/**
 * Draw a sprite (optionally flipped).
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {HTMLImageElement} image - Image
 * @param {number} x - Screen x
 * @param {number} y - Screen y
 * @param {number} width - Draw width
 * @param {number} height - Draw height
 * @param {boolean} flipHorizontally - Flip
 */
export function drawSprite(
  context,
  image,
  x,
  y,
  width,
  height,
  flipHorizontally,
) {
  context.save();

  if (flipHorizontally) {
    context.translate(x + width, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, y, width, height);
    context.restore();
    return;
  }

  context.drawImage(image, x, y, width, height);
  context.restore();
}
