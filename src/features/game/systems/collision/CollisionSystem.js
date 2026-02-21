import EnemyUpdateSystem from "./EnemyUpdateSystem.js";
import PlayerEnemyCollision from "./PlayerEnemyCollision.js";
import BottleEnemyCollision from "./BottleEnemyCollision.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;

    this.enemyUpdate = new EnemyUpdateSystem(world);
    this.playerEnemyCollision = new PlayerEnemyCollision(world);
    this.bottleEnemyCollision = new BottleEnemyCollision(world);
  }

  update(dt) {
    this.enemyUpdate.update(dt);
    this.playerEnemyCollision.update();
    this.bottleEnemyCollision.update();
  }
}