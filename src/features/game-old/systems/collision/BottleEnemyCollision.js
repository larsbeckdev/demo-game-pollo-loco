/* ============================================================================
  Imports
  - aabb: Axis-Aligned Bounding Box collision helper
  - Used to detect rectangle intersection between bottle and enemy
============================================================================ */

import { aabb } from "@/features/game/utils/aabb.js";

/* ============================================================================
  BottleEnemyCollision
  - Handles collision detection between bottles and enemies
  - Applies effects when a bottle hits an enemy
============================================================================ */

export default class BottleEnemyCollision {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to bottles and enemies
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;
  }

  /* ==========================================================================
    update
    - Called once per frame
    - Checks collision between all flying bottles and alive enemies
  ========================================================================== */

  update() {
    /* ------------------------------------------------------------------------
      Destructure world references for readability
    ------------------------------------------------------------------------ */

    const { bottles, enemies } = this.world;

    /* ------------------------------------------------------------------------
      Loop through all bottles
    ------------------------------------------------------------------------ */

    for (const bottle of bottles) {
      /* ----------------------------------------------------------------------
        Skip bottle if:
        - It is not alive
        - It is not currently flying
      ---------------------------------------------------------------------- */

      if (!bottle.alive || bottle.state !== "flying") continue;

      /* ----------------------------------------------------------------------
        Get bottle bounding box for collision detection
      ---------------------------------------------------------------------- */

      const bottleBounds = bottle.getBounds();

      /* ----------------------------------------------------------------------
        Check against all enemies
      ---------------------------------------------------------------------- */

      for (const enemy of enemies) {
        /* --------------------------------------------------------------------
          Skip enemy if not alive
        -------------------------------------------------------------------- */

        if (!enemy.alive) continue;

        /* --------------------------------------------------------------------
          Perform Axis-Aligned Bounding Box collision test
          - If no intersection, continue
        -------------------------------------------------------------------- */

        if (!aabb(bottleBounds, enemy.getBounds())) continue;

        /* --------------------------------------------------------------------
          Collision detected
          - Kill enemy
          - Change bottle state to landed
          - Break inner loop to avoid multiple hits in same frame
        -------------------------------------------------------------------- */

        enemy.kill();
        bottle.land();
        break;
      }
    }
  }
}
