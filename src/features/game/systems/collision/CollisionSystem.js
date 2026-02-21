/* ============================================================================
  Imports
  - EnemyUpdateSystem: updates enemy movement and artificial intelligence
  - PlayerEnemyCollision: handles collision between player and enemies
  - BottleEnemyCollision: handles collision between bottles and enemies
============================================================================ */

import EnemyUpdateSystem from "./EnemyUpdateSystem.js";
import PlayerEnemyCollision from "./PlayerEnemyCollision.js";
import BottleEnemyCollision from "./BottleEnemyCollision.js";
import CollectableCollisionSystem from "./CollectableCollisionSystem.js"; // add

/* ============================================================================
  CollisionSystem
  - Coordinates all collision-related subsystems
  - Delegates logic to smaller, specialized systems
  - Keeps responsibilities separated and clean
============================================================================ */

export default class CollisionSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Creates sub-systems and passes world reference to each
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;

    /* ------------------------------------------------------------------------
      Subsystems
      - EnemyUpdateSystem:
        Updates enemy behavior and movement
      - PlayerEnemyCollision:
        Handles stomp and damage logic
      - BottleEnemyCollision:
        Handles projectile collisions with enemies
    ------------------------------------------------------------------------ */

    this.enemyUpdate = new EnemyUpdateSystem(world);
    this.playerEnemyCollision = new PlayerEnemyCollision(world);
    this.bottleEnemyCollision = new BottleEnemyCollision(world);
    this.collectableCollision = new CollectableCollisionSystem(world); // add
  }

  /* ==========================================================================
    update
    - Called once per frame
    - Delegates execution to all collision-related subsystems
    - Order is important for predictable gameplay behavior
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      1) Update enemy behavior and movement
      - dt ensures smooth movement independent of frame rate
    ------------------------------------------------------------------------ */

    this.enemyUpdate.update(dt);

    /* ------------------------------------------------------------------------
      2) Handle player ↔ enemy collisions
      - Detect stomp
      - Apply damage to player if necessary
    ------------------------------------------------------------------------ */

    this.playerEnemyCollision.update();

    /* ------------------------------------------------------------------------
      3) Handle bottle ↔ enemy collisions
      - Detect impact
      - Remove bottle
      - Apply damage or destroy enemy
    ------------------------------------------------------------------------ */

    this.bottleEnemyCollision.update();

    /* ------------------------------------------------------------------------
      4) Handle player ↔ collectables collisions // add
      - Pick up coins / bottles etc.
      - Updates stats + removes collected items
    ------------------------------------------------------------------------ */

    this.collectableCollision.update(); // add
  }
}
