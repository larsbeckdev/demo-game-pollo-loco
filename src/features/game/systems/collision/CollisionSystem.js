/* ============================================================================
  Imports
  - updateEnemies: updates enemy artificial intelligence and movement
  - collidePlayerEnemies: handles collision between player and enemies
  - collideBottlesEnemies: handles collision between bottles and enemies
============================================================================ */

import updateEnemies from "./updateEnemies.js";
import collidePlayerEnemies from "./collidePlayerEnemies.js";
import collideBottlesEnemies from "./collideBottlesEnemies.js";

/* ============================================================================
  CollisionSystem
  - Responsible for:
    1) Updating enemy behavior
    2) Resolving player ↔ enemy collisions
    3) Resolving bottle ↔ enemy collisions
  - Receives a reference to the world to access all entities
============================================================================ */

export default class CollisionSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the World instance
    - Allows access to player, enemies, bottles, etc.
  ========================================================================== */

  constructor(world) {
    this.world = world;
  }

  /* ==========================================================================
    update
    - Called once per frame
    - Order of operations is important:
      1) Update enemies (movement and behavior)
      2) Check player collisions with enemies
      3) Check bottle collisions with enemies
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      Local world reference
      - Short alias for readability
    ------------------------------------------------------------------------ */

    const world = this.world;

    /* ------------------------------------------------------------------------
      1) Update enemies
      - Handles enemy artificial intelligence and movement logic
      - dt: delta time for smooth movement
    ------------------------------------------------------------------------ */

    updateEnemies(world, dt);

    /* ------------------------------------------------------------------------
      2) Player ↔ Enemy collision
      - Handles:
        - Stomp logic (player jumps on enemy)
        - Damage logic (enemy hurts player)
    ------------------------------------------------------------------------ */

    collidePlayerEnemies(world);

    /* ------------------------------------------------------------------------
      3) Bottle ↔ Enemy collision
      - Handles:
        - Bottle hitting enemy
        - Removing bottle after impact
        - Applying damage or destroy enemy
    ------------------------------------------------------------------------ */

    collideBottlesEnemies(world);
  }
}
