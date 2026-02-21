// src/features/game/Levels.js

/* ============================================================================
  Levels
  - Contains exactly 4 levels (required)
  - Pure data only (no logic)
  - World reads these values to setup spawns, background, and collectables
============================================================================ */

/**
 * @typedef {Object} BackgroundLayer
 * @property {string} source - Image path in /public
 * @property {number} speed - Parallax factor (0..1)
 */

/**
 * @typedef {Object} EnemySpawnConfig
 * @property {number} startX - Enemies start appearing after this X
 * @property {number} endX - Enemies stop appearing after this X
 * @property {number} intervalMinFrames - Minimum spawn delay (in frames at 60fps)
 * @property {number} intervalMaxFrames - Maximum spawn delay (in frames at 60fps)
 * @property {number} spawnAheadMin - Minimum distance ahead of player
 * @property {number} spawnAheadMax - Maximum distance ahead of player
 * @property {number} maxAlive - Maximum alive enemies at the same time
 */

/**
 * @typedef {Object} LevelData
 * @property {string} id - Unique level identifier
 * @property {number} worldWidth - Total level width in world pixels
 * @property {number} groundOffset - Distance from canvas bottom to ground
 * @property {{x:number, yOffset:number}} playerStart - Player start position (yOffset from ground)
 * @property {{layers: BackgroundLayer[]}} background - Background layers
 * @property {{coins: {x:number, yOffset:number}[]}} collectables - Collectable positions
 * @property {EnemySpawnConfig} enemySpawn - Enemy spawn rules
 * @property {{x:number, hp:number, scale:number} | null} boss - Boss config (usually only level 4)
 */

/* ---------------------------------------------------------------------------
  Level 1
--------------------------------------------------------------------------- */

/** @type {LevelData} */
const level1 = {
  id: "level1",
  worldWidth: 5000,
  groundOffset: 40,

  playerStart: { x: 140, yOffset: 0 },

  background: {
    layers: [
      { source: "/images/5_background/layers/air.png", speed: 0.15 },
      {
        source: "/images/5_background/layers/3_third_layer/1.png",
        speed: 0.35,
      },
      {
        source: "/images/5_background/layers/2_second_layer/1.png",
        speed: 0.55,
      },
      {
        source: "/images/5_background/layers/1_first_layer/1.png",
        speed: 0.85,
      },
    ],
  },

  collectables: {
    coins: [
      { x: 550, yOffset: 120 },
      { x: 620, yOffset: 120 },
      { x: 900, yOffset: 140 },
    ],
  },

  enemySpawn: {
    startX: 500,
    endX: 4300,
    intervalMinFrames: 75,
    intervalMaxFrames: 150,
    spawnAheadMin: 650,
    spawnAheadMax: 1200,
    maxAlive: 5,
  },

  boss: null,
};

/* ---------------------------------------------------------------------------
  Level 2
--------------------------------------------------------------------------- */

/** @type {LevelData} */
const level2 = {
  id: "level2",
  worldWidth: 5600,
  groundOffset: 40,

  playerStart: { x: 140, yOffset: 0 },

  background: {
    layers: [
      { source: "/images/5_background/layers/air.png", speed: 0.15 },
      {
        source: "/images/5_background/layers/3_third_layer/2.png",
        speed: 0.35,
      },
      {
        source: "/images/5_background/layers/2_second_layer/2.png",
        speed: 0.55,
      },
      {
        source: "/images/5_background/layers/1_first_layer/2.png",
        speed: 0.85,
      },
    ],
  },

  collectables: {
    coins: [
      { x: 520, yOffset: 120 },
      { x: 620, yOffset: 150 },
      { x: 1100, yOffset: 120 },
      { x: 1900, yOffset: 140 },
    ],
  },

  enemySpawn: {
    startX: 550,
    endX: 4700,
    intervalMinFrames: 65,
    intervalMaxFrames: 135,
    spawnAheadMin: 650,
    spawnAheadMax: 1200,
    maxAlive: 6,
  },

  boss: null,
};

/* ---------------------------------------------------------------------------
  Level 3
--------------------------------------------------------------------------- */

/** @type {LevelData} */
const level3 = {
  id: "level3",
  worldWidth: 6200,
  groundOffset: 40,

  playerStart: { x: 140, yOffset: 0 },

  background: {
    layers: [
      { source: "/images/5_background/layers/air.png", speed: 0.15 },
      {
        source: "/images/5_background/layers/3_third_layer/1.png",
        speed: 0.35,
      },
      {
        source: "/images/5_background/layers/2_second_layer/2.png",
        speed: 0.55,
      },
      {
        source: "/images/5_background/layers/1_first_layer/1.png",
        speed: 0.85,
      },
    ],
  },

  collectables: {
    coins: [
      { x: 650, yOffset: 130 },
      { x: 720, yOffset: 130 },
      { x: 1400, yOffset: 150 },
      { x: 2600, yOffset: 120 },
      { x: 3100, yOffset: 160 },
    ],
  },

  enemySpawn: {
    startX: 600,
    endX: 5200,
    intervalMinFrames: 55,
    intervalMaxFrames: 120,
    spawnAheadMin: 700,
    spawnAheadMax: 1300,
    maxAlive: 7,
  },

  boss: null,
};

/* ---------------------------------------------------------------------------
  Level 4 (Boss level)
--------------------------------------------------------------------------- */

/** @type {LevelData} */
const level4 = {
  id: "level4",
  worldWidth: 6800,
  groundOffset: 40,

  playerStart: { x: 140, yOffset: 0 },

  background: {
    layers: [
      { source: "/images/5_background/layers/air.png", speed: 0.15 },
      {
        source: "/images/5_background/layers/3_third_layer/2.png",
        speed: 0.35,
      },
      {
        source: "/images/5_background/layers/2_second_layer/1.png",
        speed: 0.55,
      },
      {
        source: "/images/5_background/layers/1_first_layer/2.png",
        speed: 0.85,
      },
    ],
  },

  collectables: {
    coins: [
      { x: 600, yOffset: 130 },
      { x: 900, yOffset: 130 },
      { x: 1500, yOffset: 150 },
      { x: 2400, yOffset: 120 },
      { x: 3600, yOffset: 160 },
    ],
  },

  enemySpawn: {
    startX: 650,
    endX: 5600,
    intervalMinFrames: 55,
    intervalMaxFrames: 115,
    spawnAheadMin: 750,
    spawnAheadMax: 1400,
    maxAlive: 7,
  },

  boss: {
    x: 6200,
    hp: 10,
    scale: 1.6,
  },
};

/* ============================================================================
  Public API
============================================================================ */

export const LEVELS = [level1, level2, level3, level4];

/**
 * Get level data by index (0..3).
 * @param {number} index - Level index
 * @returns {LevelData}
 */
export function getLevelByIndex(index) {
  const safeIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
  return LEVELS[safeIndex];
}
