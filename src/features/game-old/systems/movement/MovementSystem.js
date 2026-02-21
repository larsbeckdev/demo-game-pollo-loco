/* ============================================================================
  Imports
  - PlayerBoundsSystem: keeps the player inside world boundaries
  - CameraFollowSystem: makes the camera follow the player
============================================================================ */

import PlayerBoundsSystem from "./PlayerBoundsSystem.js";
import CameraFollowSystem from "./CameraFollowSystem.js";

/* ============================================================================
  MovementSystem
  - Responsible for player movement flow
  - Executes logic in a strict order:
      1) Read input
      2) Apply physics
      3) Clamp player inside world bounds
      4) Update camera position
============================================================================ */

export default class MovementSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Creates movement-related subsystems
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;

    /* ------------------------------------------------------------------------
      Subsystems
      - PlayerBoundsSystem: ensures player does not leave world
      - CameraFollowSystem: adjusts camera position
    ------------------------------------------------------------------------ */

    this.playerBounds = new PlayerBoundsSystem(world);
    this.cameraFollow = new CameraFollowSystem(world);
  }

  /* ==========================================================================
    update
    - Called once per frame
    - dt: delta time (frame-based time factor)
    - Order of execution is important
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      Local world reference for readability
    ------------------------------------------------------------------------ */

    const world = this.world;

    /* ------------------------------------------------------------------------
      1) Input handling
      - Reads keyboard state
      - Sets character movement intentions (left, right, jump, throw)
    ------------------------------------------------------------------------ */

    world.character.handleInput(world.keyboard);

    /* ------------------------------------------------------------------------
      2) Physics update
      - Applies velocity and gravity
      - Updates character position
      - Updates animation state
    ------------------------------------------------------------------------ */

    world.character.update(dt);

    /* ------------------------------------------------------------------------
      3) Player bounds clamping
      - Prevents player from leaving world horizontally
      - Prevents falling below ground if required
    ------------------------------------------------------------------------ */

    this.playerBounds.update();

    /* ------------------------------------------------------------------------
      4) Camera follow update
      - Adjusts camera position based on character position
    ------------------------------------------------------------------------ */

    this.cameraFollow.update();
  }
}