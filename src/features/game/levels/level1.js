export const level1 = {
  id: "level1",
  worldWidth: 6000,
  groundOffset: 40,

  // Random enemy spawning
  enemySpawn: {
    startX: 400, // ab wann Enemies beginnen
    endX: 5200, // bis kurz vor Boss
    intervalMin: 45, // ~0.75s (dt=1 ≈ 60fps)
    intervalMax: 120, // ~2s
    spawnAheadMin: 500, // min Abstand vor Player
    spawnAheadMax: 1100, // max Abstand vor Player
    maxAlive: 6, // max gleichzeitig
    scale: 0.5, // kleine chickens
  },

  // Boss spawn
  boss: {
    x: 5600,
    scale: 1.6,
    hp: 10,
  },
};
