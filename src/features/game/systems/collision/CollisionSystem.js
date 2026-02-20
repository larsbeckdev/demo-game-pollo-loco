import updateEnemies from "./updateEnemies.js";
import collidePlayerEnemies from "./collidePlayerEnemies.js";
import collideBottlesEnemies from "./collideBottlesEnemies.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const w = this.world;

    // 1) Update AI / movement of enemies (as you had it)
    updateEnemies(w, dt);

    // 2) Player ↔ Enemy collision (stomp vs damage)
    collidePlayerEnemies(w);

    // 3) Bottle ↔ Enemy collision
    collideBottlesEnemies(w);
  }
}
