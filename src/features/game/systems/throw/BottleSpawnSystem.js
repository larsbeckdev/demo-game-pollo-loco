import Bottle from "@/features/game/entities/Bottle.js";

export default class BottleSpawnSystem {
  constructor(world) {
    this.world = world;
  }

  spawn() {
    const w = this.world;
    const c = w.character;

    w.bottles.push(
      new Bottle({
        x: c.x + (c.facing === 1 ? 60 : -10),
        y: c.y - c.h * 0.6,
        direction: c.facing,
        groundY: w.groundY,
        worldWidth: w.worldWidth,
      }),
    );
  }
}
