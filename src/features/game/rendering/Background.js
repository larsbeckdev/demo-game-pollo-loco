/* ============================================================================
  Imports
  - ParallaxLayer: represents one scrollable background layer
============================================================================ */

import ParallaxLayer from "@/features/game/rendering/ParallaxLayer.js";

/* ============================================================================
  Background
  - Manages multiple parallax layers
  - Draws them in correct order (back to front)
  - Each layer scrolls with a different speed factor
============================================================================ */

export default class Background {
  /* ==========================================================================
    Constructor
    - Creates all parallax layers
    - Order matters: first element is farthest in the background
  ========================================================================== */

  constructor() {
    /* ------------------------------------------------------------------------
      Layers array
      - The first layer is the farthest (moves slowest)
      - The last layer is the closest (moves fastest)
      - speed defines how strong the layer reacts to camera movement
    ------------------------------------------------------------------------ */

    this.layers = [
      /* ----------------------------------------------------------------------
        Clouds (very far background)
        - Moves slowly for depth effect
      ---------------------------------------------------------------------- */
      new ParallaxLayer({
        src: "/images/5_background/layers/4_clouds/full.png",
        speed: 0.15,
      }),

      /* ----------------------------------------------------------------------
        Third layer (distant background)
      ---------------------------------------------------------------------- */
      new ParallaxLayer({
        src: "/images/5_background/layers/3_third_layer/full.png",
        speed: 0.35,
      }),

      /* ----------------------------------------------------------------------
        Second layer (mid background)
      ---------------------------------------------------------------------- */
      new ParallaxLayer({
        src: "/images/5_background/layers/2_second_layer/full.png",
        speed: 0.6,
      }),

      /* ----------------------------------------------------------------------
        First layer (foreground background)
        - Moves almost like the game world
      ---------------------------------------------------------------------- */
      new ParallaxLayer({
        src: "/images/5_background/layers/1_first_layer/full.png",
        speed: 1.0,
      }),
    ];
  }

  /* ==========================================================================
    draw
    - Draws all layers in order
    - ctx: canvas 2D rendering context
    - canvasWidth: width of the canvas
    - canvasHeight: height of the canvas
    - cameraX: horizontal camera offset
  ========================================================================== */

  draw(ctx, canvasWidth, canvasHeight, cameraX = 0) {
    /* ------------------------------------------------------------------------
      Iterate over all layers
      - Each layer applies its own parallax calculation
      - Layers are drawn back to front
    ------------------------------------------------------------------------ */

    for (const layer of this.layers) {
      layer.draw(ctx, canvasWidth, canvasHeight, cameraX);
    }
  }
}
