import Background from "@/features/game/rendering/Background.js";
import Camera from "@/features/game/rendering/Camera.js";
import Keyboard from "@/features/game/core/input/Keyboard.js";
import World from "@/features/game/core/world/World.js";

import GameLoop from "@/features/game/core/game/GameLoop.js";
import GameRenderer from "@/features/game/core/game/GameRenderer.js";

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.background = new Background();
    this.camera = new Camera();
    this.keyboard = new Keyboard();

    this.world = new World({
      canvas: this.canvas,
      camera: this.camera,
      keyboard: this.keyboard,
    });

    this.renderer = new GameRenderer({
      canvas: this.canvas,
      ctx: this.ctx,
      background: this.background,
      camera: this.camera,
      world: this.world,
    });

    this.loop = new GameLoop({
      onTick: (dt) => {
        this.update(dt);
        this.render();
      },
    });
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  update(dt) {
    this.world.update(dt);
  }

  render() {
    this.renderer.render();
  }
}
