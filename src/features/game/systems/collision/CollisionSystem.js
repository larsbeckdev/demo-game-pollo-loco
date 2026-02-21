// src/features/game/systems/collision/CollisionSystem.js

import { aabb, isStomp } from "./collisionHelpers.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;
    this.damageCooldown = 0; // dt-units
  }

  update(dt) {
    this.damageCooldown = Math.max(0, this.damageCooldown - dt);

    this._collidePlayerEnemies();
    // ... deine anderen Collisions (bottles, coins, etc.)
  }

  _collidePlayerEnemies() {
    const { world } = this;
    const player = world.character;

    if (!player) return;

    const pb = player.getBounds();
    const vy = player.vy ?? 0;

    for (const enemy of world.enemies) {
      if (!enemy.alive) continue;

      const eb = enemy.getBounds();
      if (!aabb(pb, eb)) continue;

      // From above => kill enemy
      if (isStomp(pb, eb, vy)) {
        enemy.kill();

        // Optional: little bounce so it feels good
        if (typeof player.bounce === "function") player.bounce();
        else if (player.vy !== undefined) player.vy = -10;

        // Optional sound
        world.sound?.play?.("enemyKill");
        continue;
      }

      // Side hit => player takes damage (cooldown so it’s fair)
      if (this.damageCooldown <= 0) {
        if (typeof player.takeDamage === "function") player.takeDamage(20);
        else if (world.stats?.damage) world.stats.damage(20);

        world.sound?.play?.("hurt");
        this.damageCooldown = 45; // ~0.75s
      }
    }
  }
}
