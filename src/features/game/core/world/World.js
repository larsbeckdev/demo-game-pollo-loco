import { level1 } from "@/features/game/levels/level1.js";
import { createWorldState } from "./WorldFactory.js";
import { createWorldSystems } from "./WorldSystems.js";
import { drawWorld } from "./WorldDraw.js";

// Owns entities + systems, provides update() + draw()
export default class World {
  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

    Object.assign(this, createWorldState({ canvas, level }));
    this.systems = createWorldSystems(this);
  }

  update(dt) {
    // Order matters: Movement -> Throw -> Collision (same as before)
    for (const sys of this.systems) sys.update(dt);
  }

  draw(ctx) {
    drawWorld(this, ctx);
  }
}
