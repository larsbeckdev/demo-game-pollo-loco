// src/classes/systems/ThrowSystem.js
import Bottle from "../entities/Bottle.js";

export default class ThrowSystem {
  constructor(world) {
    this.world = world;
    this.throwWasDown = false;
  }

  update(dt) {
    const w = this.world;

    // Throw Bottle (edge trigger)
    const throwDown = !!w.keyboard.THROW;
    if (throwDown && !this.throwWasDown) {
      w.bottles.push(
        new Bottle({
          x: w.character.x + (w.character.facing === 1 ? 60 : -10),
          y: w.character.y - w.character.h * 0.6,
          direction: w.character.facing,
          groundY: w.groundY,
          worldWidth: w.worldWidth,
        }),
      );
    }
    this.throwWasDown = throwDown;

    // Update bottles
    for (const bottle of w.bottles) bottle.update(dt);
    w.bottles = w.bottles.filter((b) => b.alive);
  }
}
