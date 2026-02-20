import ParallaxLayer from "@/features/game/rendering/ParallaxLayer.js";

export default class Background {
  constructor() {
    this.layers = [
      new ParallaxLayer({
        src: "/images/5_background/layers/4_clouds/full.png",
        speed: 0.15,
      }),
      new ParallaxLayer({
        src: "/images/5_background/layers/3_third_layer/full.png",
        speed: 0.35,
      }),
      new ParallaxLayer({
        src: "/images/5_background/layers/2_second_layer/full.png",
        speed: 0.6,
      }),
      new ParallaxLayer({
        src: "/images/5_background/layers/1_first_layer/full.png",
        speed: 1.0,
      }),
    ];
  }

  draw(ctx, canvasWidth, canvasHeight, cameraX = 0) {
    for (const layer of this.layers) {
      layer.draw(ctx, canvasWidth, canvasHeight, cameraX);
    }
  }
}
