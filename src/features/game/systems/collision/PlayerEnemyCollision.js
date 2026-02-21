/* ============================================================================
  Imports
  - aabb: Axis-Aligned Bounding Box collision helper
  - Used to detect rectangular overlap between player and enemy
============================================================================ */

import { aabb } from "@/features/game/utils/aabb.js";

/* ============================================================================
  PlayerEnemyCollision
  - Handles collision logic between player character and enemies
  - Determines whether:
      - The player stomps the enemy (jumping downward)
      - The player takes damage (side or bottom collision)
============================================================================ */

export default class PlayerEnemyCollision {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to character and enemies
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
    - Checks collision between player and all alive enemies
  ========================================================================== */

  update() {
    /* ------------------------------------------------------------------------
      Extract references for readability
    ------------------------------------------------------------------------ */

    const { character, enemies } = this.world;

    /* ------------------------------------------------------------------------
      Get player bounding box once per frame
    ------------------------------------------------------------------------ */

    const playerBounds = character.getBounds();

    /* ------------------------------------------------------------------------
      Loop through all enemies
    ------------------------------------------------------------------------ */

    for (const enemy of enemies) {
      /* ----------------------------------------------------------------------
        Skip enemy if not alive
      ---------------------------------------------------------------------- */

      if (!enemy.alive) continue;

      /* ----------------------------------------------------------------------
        Check collision using Axis-Aligned Bounding Box method
        - If no intersection, skip
      ---------------------------------------------------------------------- */

      if (!aabb(playerBounds, enemy.getBounds())) continue;

      /* ----------------------------------------------------------------------
        Collision detected
        - If player is moving downward (vy > 0), treat as stomp
        - Otherwise, player takes damage
      ---------------------------------------------------------------------- */

      if (character.vy > 0) {
        /* --------------------------------------------------------------------
          Stomp logic
          - Kill enemy
          - Bounce player upward by setting negative vertical velocity
        -------------------------------------------------------------------- */

        enemy.kill();
        character.vy = -10;
      } else {
        /* --------------------------------------------------------------------
          Damage logic
          - Player takes damage from enemy contact
        -------------------------------------------------------------------- */

        character.takeDamage();
      }
    }
  }
}
