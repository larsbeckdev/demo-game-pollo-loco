import { aabb } from "@/features/game/utils/aabb.js";

export default function collidePlayerEnemies(world) {
  const { character, enemies } = world;

  const playerBounds = character.getBounds();

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const enemyBounds = enemy.getBounds();

    if (!aabb(playerBounds, enemyBounds)) continue;

    // Stomp if player is falling down onto the enemy
    if (character.vy > 0) {
      enemy.kill();
      character.vy = -10; // bounce up (same behavior as before)
    } else {
      character.takeDamage();
    }
  }
}
