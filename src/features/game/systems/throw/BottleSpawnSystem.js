/* ============================================================================
  Imports
  - Bottle: projectile entity that can be thrown by the player
============================================================================ */

import Bottle from "@/features/game/entities/bottle/Bottle.js";

/* ============================================================================
  BottleSpawnSystem
  - Responsible for creating new bottle instances
  - Uses current player position and direction
============================================================================ */

export default class BottleSpawnSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to character, ground, world size, and bottle list
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;
  }

  /* ==========================================================================
    spawn
    - Creates a new Bottle entity
    - Positions it relative to the player character
    - Adds it to the world.bottles array
  ========================================================================== */

  spawn() {
    /* ------------------------------------------------------------------------
      Extract references for readability
    ------------------------------------------------------------------------ */

    const world = this.world;
    const character = world.character;

    /* ------------------------------------------------------------------------
      Calculate spawn position
      - Horizontal position depends on facing direction
      - Vertical position starts slightly above player center
    ------------------------------------------------------------------------ */

    const spawnX = character.x + (character.facing === 1 ? 60 : -10);

    const spawnY = character.y - character.h * 0.6;

    /* ------------------------------------------------------------------------
      Create new Bottle instance
      - direction: player facing direction (1 or -1)
      - groundY: used for bottle landing logic
      - worldWidth: prevents bottle from leaving world boundaries
    ------------------------------------------------------------------------ */

    const bottle = new Bottle({
      x: spawnX,
      y: spawnY,
      direction: character.facing,
      groundY: world.groundY,
      worldWidth: world.worldWidth,
    });

    /* ------------------------------------------------------------------------
      Add bottle to world
    ------------------------------------------------------------------------ */

    world.bottles.push(bottle);
  }
}
