/* ============================================================================
  ThrowInputSystem
  - Detects a "just pressed" event for the throw action
  - Prevents continuous spawning while the key is held down
  - Converts a held key into a single-frame trigger
============================================================================ */

export default class ThrowInputSystem {
  /* ==========================================================================
    Constructor
    - world: reference to the main World instance
    - Tracks previous key state to detect transitions
  ========================================================================== */

  constructor(world) {
    /* ------------------------------------------------------------------------
      Store world reference
    ------------------------------------------------------------------------ */

    this.world = world;

    /* ------------------------------------------------------------------------
      Track previous key state
      - wasDown: true if the throw key was pressed in previous frame
      - Used to detect edge transition (not pressed → pressed)
    ------------------------------------------------------------------------ */

    this.wasDown = false;
  }

  /* ==========================================================================
    justPressed
    - Returns true only on the frame when the throw key
      transitions from "not pressed" to "pressed"
    - Prevents continuous triggering while holding the key
  ========================================================================== */

  justPressed() {
    /* ------------------------------------------------------------------------
      Read current key state
      - Convert to explicit boolean
    ------------------------------------------------------------------------ */

    const isCurrentlyDown = !!this.world.keyboard.THROW;

    /* ------------------------------------------------------------------------
      Detect transition
      - pressed is true only if:
          key is down now
          AND it was not down in the previous frame
    ------------------------------------------------------------------------ */

    const isJustPressed = isCurrentlyDown && !this.wasDown;

    /* ------------------------------------------------------------------------
      Store current state for next frame comparison
    ------------------------------------------------------------------------ */

    this.wasDown = isCurrentlyDown;

    /* ------------------------------------------------------------------------
      Return result
    ------------------------------------------------------------------------ */

    return isJustPressed;
  }
}
