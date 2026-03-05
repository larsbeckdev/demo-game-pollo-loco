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
  constructor() {
    this.layers = [
      // ----------------------------------------------------------------------
      // Air (almost static base layer)
      // - If your air.png should behave like a "sky gradient", keep it nearly static.
      // - We still tile it, but with better seam-hiding in ParallaxLayer.
      // ----------------------------------------------------------------------
      new ParallaxLayer({
        src: "/images/5_background/layers/air.png",
        speed: 0,
        autoSpeed: 0, // air does not drift (optional: 0.02 for subtle wind)
        overlap: 0, // ✅ stronger overlap helps remove seams
      }),

      // ----------------------------------------------------------------------
      // Clouds (auto-moving layer)
      // - autoSpeed makes them move even when player stands still
      // ----------------------------------------------------------------------
      new ParallaxLayer({
        src: "/images/5_background/layers/4_clouds/full.png",
        speed: 0.05,
        autoSpeed: 0.25, // ✅ tweak: 0.12 .. 0.6
        overlap: 6,
      }),

      new ParallaxLayer({
        src: "/images/5_background/layers/3_third_layer/full.png",
        speed: 0.35,
        autoSpeed: 0, // no self movement
        overlap: 4,
      }),

      new ParallaxLayer({
        src: "/images/5_background/layers/2_second_layer/full.png",
        speed: 0.6,
        autoSpeed: 0,
        overlap: 4,
      }),

      new ParallaxLayer({
        src: "/images/5_background/layers/1_first_layer/full.png",
        speed: 1.0,
        autoSpeed: 0,
        overlap: 3,
      }),
    ];
  }

  // ✅ dt optional: if you don't pass it, default 1
  draw(ctx, canvasWidth, canvasHeight, cameraX = 0, dt = 1) {
    const d = Number.isFinite(dt) ? dt : 1;

    for (const layer of this.layers) {
      layer.update?.(d);
      layer.draw(ctx, canvasWidth, canvasHeight, cameraX);
    }
  }
}
