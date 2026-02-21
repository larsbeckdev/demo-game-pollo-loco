/* ============================================================================
  level1
  - Configuration object for the first level
  - Contains:
      - World dimensions
      - Enemy spawn behavior
      - Boss configuration
  - No logic here, only structured data
============================================================================ */

export const level1 = {
  /* --------------------------------------------------------------------------
    Level identification
  -------------------------------------------------------------------------- */

  id: "level1",

  /* --------------------------------------------------------------------------
    World configuration
    - worldWidth: total horizontal size of the level
    - groundOffset: distance from bottom of canvas to ground
  -------------------------------------------------------------------------- */

  worldWidth: 6000,
  groundOffset: 40,

  /* ==========================================================================
    Enemy Spawn Configuration
    - Controls dynamic enemy spawning behavior
    - Used by an enemy spawn system (if implemented)
  ========================================================================== */

  enemySpawn: {
    /* ------------------------------------------------------------------------
      Spawn range
      - Enemies start appearing after startX
      - Stop spawning shortly before boss area
    ------------------------------------------------------------------------ */

    startX: 400,
    endX: 5200,

    /* ------------------------------------------------------------------------
      Spawn timing
      - intervalMin and intervalMax define random delay range
      - Values are frame-based (dt ≈ 1 at 60 frames per second)
    ------------------------------------------------------------------------ */

    intervalMin: 45, // approximately 0.75 seconds
    intervalMax: 120, // approximately 2 seconds

    /* ------------------------------------------------------------------------
      Spawn distance ahead of player
      - Prevents enemies from spawning directly on player
      - Spawns slightly off-screen in front
    ------------------------------------------------------------------------ */

    spawnAheadMin: 500,
    spawnAheadMax: 1100,

    /* ------------------------------------------------------------------------
      Enemy limits and scaling
      - maxAlive: maximum number of enemies alive at the same time
      - scale: visual scaling factor for smaller enemies
    ------------------------------------------------------------------------ */

    maxAlive: 6,
    scale: 0.5,
  },

  /* ==========================================================================
    Boss Configuration
    - Defines boss position and stats
  ========================================================================== */

  boss: {
    /* ------------------------------------------------------------------------
      Horizontal spawn position of the boss
    ------------------------------------------------------------------------ */

    x: 5600,

    /* ------------------------------------------------------------------------
      Visual scale factor
    ------------------------------------------------------------------------ */

    scale: 1.6,

    /* ------------------------------------------------------------------------
      Health points
      - Number of hits required to defeat the boss
    ------------------------------------------------------------------------ */

    hp: 10,
  },
};
