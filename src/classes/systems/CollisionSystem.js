// src/classes/systems/CollisionSystem.js
import { aabb } from "../utils/aabb.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const w = this.world;

    // Update enemies (bei dir war das in World.update)
    for (const enemy of w.enemies) enemy.update(dt);

    // Player ↔ Enemy collision
    for (const enemy of w.enemies) {
      if (!enemy.alive) continue;

      const playerBounds = w.character.getBounds();
      const enemyBounds = enemy.getBounds();

      if (aabb(playerBounds, enemyBounds)) {
        if (w.character.vy > 0) {
          enemy.kill();
          w.character.vy = -10;
        } else {
          w.character.takeDamage();
        }
      }
    }

    // Bottle ↔ Enemy collision
    for (const bottle of w.bottles) {
      if (!bottle.alive) continue;
      if (bottle.state !== "flying") continue;

      const bb = bottle.getBounds();

      for (const enemy of w.enemies) {
        if (!enemy.alive) continue;

        const eb = enemy.getBounds();

        if (aabb(bb, eb)) {
          enemy.kill();
          bottle.land();
          break;
        }
      }
    }
  }
}
