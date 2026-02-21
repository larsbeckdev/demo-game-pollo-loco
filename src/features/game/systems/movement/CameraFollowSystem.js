/* ============================================================================
  CameraFollowSystem
  - Makes the camera follow the player character
  - Keeps the camera within world boundaries
  - Prevents showing empty space outside the level
============================================================================ */

export default class CameraFollowSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Provides access to camera, character, canvas, and world size
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
    - Adjusts camera position based on character position
  ========================================================================== */

  update() {
    /* ------------------------------------------------------------------------
      Extract references from world
    ------------------------------------------------------------------------ */

    const { camera, character, canvas, worldWidth } = this.world;

    /* ------------------------------------------------------------------------
      Follow offset
      - Determines how far from the left edge the character should appear
      - Creates space in front of the character
    ------------------------------------------------------------------------ */

    const followOffset = 200;

    /* ------------------------------------------------------------------------
      Target camera position
      - Shift camera so character appears at followOffset
    ------------------------------------------------------------------------ */

    const targetX = character.x - followOffset;

    /* ------------------------------------------------------------------------
      Maximum camera position
      - Prevents camera from moving beyond the right boundary of the world
      - Ensures no empty space is shown
    ------------------------------------------------------------------------ */

    const maxCameraX = Math.max(0, worldWidth - canvas.width);

    /* ------------------------------------------------------------------------
      Clamp camera position
      - Minimum: 0 (left boundary)
      - Maximum: maxCameraX (right boundary)
    ------------------------------------------------------------------------ */

    camera.x = Math.min(Math.max(0, targetX), maxCameraX);
  }
}
