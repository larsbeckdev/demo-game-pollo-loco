/* ============================================================================
  Imports
  - ThrowInputSystem: detects throw key state (just pressed logic)
  - BottleSpawnSystem: creates new bottle entities
  - BottleUpdateSystem: updates movement and cleanup of bottles
============================================================================ */

import ThrowInputSystem from "./ThrowInputSystem.js";
import BottleSpawnSystem from "./BottleSpawnSystem.js";
import BottleUpdateSystem from "./BottleUpdateSystem.js";

/* ============================================================================
  ThrowSystem
  - Coordinates all throw-related behavior
  - Handles:
      1) Detecting throw input
      2) Spawning bottles
      3) Updating and cleaning up bottles
============================================================================ */

export default class ThrowSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Creates throw-related subsystems
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;

    /* ------------------------------------------------------------------------
      Subsystems
      - input: handles "just pressed" detection
      - spawn: creates new bottle entities
      - bottleUpdate: updates bottle physics and removes inactive bottles
    ------------------------------------------------------------------------ */

    this.input = new ThrowInputSystem(world);
    this.spawn = new BottleSpawnSystem(world);
    this.bottleUpdate = new BottleUpdateSystem(world);
  }

  /* ==========================================================================
    update
    - Called once per frame
    - dt: delta time for frame-independent updates
    - Order is important
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      1) Detect "just pressed" event
      - Only spawn a bottle on the exact frame the key is pressed
      - Prevents continuous spawning while key is held down
    ------------------------------------------------------------------------ */

    if (this.input.justPressed()) {
      this.spawn.spawn();
    }

    /* ------------------------------------------------------------------------
      2) Update existing bottles
      - Apply movement
      - Apply gravity if needed
      - Remove bottles that are no longer active
    ------------------------------------------------------------------------ */

    this.bottleUpdate.update(dt);
  }
}
