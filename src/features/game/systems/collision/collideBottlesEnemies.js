import { aabb } from "@/features/game/utils/aabb.js";

export default function collideBottlesEnemies(world) {
  const { bottles, enemies } = world;

  for (const bottle of bottles) {
    if (!bottle.alive) continue;
    if (bottle.state !== "flying") continue;

    const bb = bottle.getBounds();

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const eb = enemy.getBounds();

      if (!aabb(bb, eb)) continue;

      enemy.kill();
      bottle.land();
      break; // one bottle hits one enemy
    }
  }
}
