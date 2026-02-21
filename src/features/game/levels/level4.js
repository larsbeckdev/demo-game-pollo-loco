/* ============================================================================
  level4
  - Endgame level
  - High pressure + fast spawn
============================================================================ */

export const level4 = {
  id: "level4",

  worldWidth: 11000,
  groundOffset: 40,

  enemySpawn: {
    startX: 150,
    endX: 10000,

    intervalMin: 18,
    intervalMax: 55,

    spawnAheadMin: 800,
    spawnAheadMax: 1600,

    maxAlive: 12,
    scale: 0.65,
  },

  boss: {
    x: 10500,
    scale: 2.3,
    hp: 25,
  },
};
