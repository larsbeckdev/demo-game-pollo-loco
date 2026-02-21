import { aabb } from "@/features/game/utils/aabb.js";

export default class PlayerEnemyCollision {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { character, enemies } = this.world;
    const playerBounds = character.getBounds();

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      if (!aabb(playerBounds, enemy.getBounds())) continue;

      if (character.vy > 0) {
        enemy.kill();
        character.vy = -10;
      } else {
        character.takeDamage();
      }
    }
  }
}
