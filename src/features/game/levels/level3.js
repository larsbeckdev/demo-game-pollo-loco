/* ============================================================================
  level3
  - Higher difficulty
  - Faster spawn intervals
============================================================================ */

export const level3 = {
  id: "level3",

  worldWidth: 9000,
  groundOffset: 40,

  enemySpawn: {
    startX: 200,
    endX: 8200,

    intervalMin: 25,
    intervalMax: 70,

    spawnAheadMin: 700,
    spawnAheadMax: 1400,

    maxAlive: 10,
    scale: 0.6,
  },

  boss: {
    x: 8600,
    scale: 2.0,
    hp: 18,
  },
};
