/* ============================================================================
  PlayerBoundsSystem
  - Ensures the player character stays within horizontal world boundaries
  - Prevents the player from leaving the visible game world
============================================================================ */

export default class PlayerBoundsSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to character and world width
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
    - Clamps player position to valid horizontal range
  ========================================================================== */

  update() {
    /* ------------------------------------------------------------------------
      Extract relevant references
    ------------------------------------------------------------------------ */

    const { character, worldWidth } = this.world;

    /* ------------------------------------------------------------------------
      Left boundary clamp
      - Prevent player from moving beyond left edge (x < 0)
    ------------------------------------------------------------------------ */

    if (character.x < 0) {
      character.x = 0;
    }

    /* ------------------------------------------------------------------------
      Right boundary clamp
      - Calculate maximum allowed x position
      - worldWidth: total width of level
      - character.w: width of character sprite
      - Prevent player from exceeding right edge
    ------------------------------------------------------------------------ */

    const maximumAllowedX = worldWidth - character.w;

    if (character.x > maximumAllowedX) {
      character.x = maximumAllowedX;
    }
  }
}
