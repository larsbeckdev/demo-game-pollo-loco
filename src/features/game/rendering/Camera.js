/* ============================================================================
  Camera
  - Responsible for horizontal world scrolling
  - Stores the horizontal offset (x)
  - Ensures the camera does not move into negative space
============================================================================ */

export default class Camera {
  /* ==========================================================================
    Constructor
    - Initializes the horizontal camera position
    - x represents how far the world is shifted to the left
  ========================================================================== */

  constructor() {
    /* ------------------------------------------------------------------------
      Horizontal position
      - x = 0 means the camera is at the very left of the world
      - Increasing x scrolls the world to the left (player appears to move right)
    ------------------------------------------------------------------------ */

    this.x = 0;
  }

  /* ==========================================================================
    move
    - Moves the camera horizontally
    - Prevents the camera from going below zero
    - dx: change in horizontal position
  ========================================================================== */

  move(dx) {
    /* ------------------------------------------------------------------------
      Apply horizontal movement
    ------------------------------------------------------------------------ */

    this.x += dx;

    /* ------------------------------------------------------------------------
      Clamp to minimum value
      - Prevents camera from moving into negative coordinates
      - This avoids showing empty space on the left side
    ------------------------------------------------------------------------ */

    if (this.x < 0) {
      this.x = 0;
    }
  }
}
