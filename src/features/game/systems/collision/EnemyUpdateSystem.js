/* ============================================================================
  EnemyUpdateSystem
  - Responsible for updating all enemies in the world
  - Delegates update logic to each enemy instance
============================================================================ */

export default class EnemyUpdateSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to world.enemies array
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
    - Iterates over all enemies
    - Calls each enemy's update method
    - dt: delta time for smooth frame-independent movement
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      Loop through all enemies in the world
    ------------------------------------------------------------------------ */

    for (const enemy of this.world.enemies) {
      /* ----------------------------------------------------------------------
        Update individual enemy
        - Enemy handles its own movement, animation, and logic
      ---------------------------------------------------------------------- */

      enemy.update(dt);
    }
  }
}
