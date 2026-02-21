/* ============================================================================
  BottleUpdateSystem
  - Responsible for updating all bottle entities
  - Removes inactive bottles from the world
  - Keeps bottle array clean and optimized
============================================================================ */

export default class BottleUpdateSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to world.bottles
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
    - dt: delta time for smooth, frame-independent movement
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      Local world reference for readability
    ------------------------------------------------------------------------ */

    const world = this.world;

    /* ------------------------------------------------------------------------
      1) Update all bottles
      - Each bottle handles its own physics and animation
    ------------------------------------------------------------------------ */

    for (const bottle of world.bottles) {
      bottle.update(dt);
    }

    /* ------------------------------------------------------------------------
      2) Cleanup inactive bottles
      - Remove bottles that are no longer alive
      - Prevents memory growth and unnecessary collision checks
    ------------------------------------------------------------------------ */

    world.bottles = world.bottles.filter((bottle) => bottle.alive);
  }
}
