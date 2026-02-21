import { aabb } from "@/features/game/utils/aabb.js";

export default class BottleEnemyCollision {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { bottles, enemies } = this.world;

    for (const bottle of bottles) {
      if (!bottle.alive || bottle.state !== "flying") continue;

      const bottleBounds = bottle.getBounds();

      for (const enemy of enemies) {
        if (!enemy.alive) continue;

        if (!aabb(bottleBounds, enemy.getBounds())) continue;

        enemy.kill();
        bottle.land();
        break;
      }
    }
  }
}
