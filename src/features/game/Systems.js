// src/features/game/Systems.js

/* ============================================================================
  Systems
  - Contains world rules (movement, collisions, spawns, cleanup)
  - No rendering
  - No DOM
============================================================================ */

import { Enemy, Coin, isOverlapping } from "./Entities.js";

/* ---------------------------------------------------------------------------
  Random helpers (explicit, readable)
--------------------------------------------------------------------------- */

/**
 * Random integer between min and max (inclusive).
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number}
 */
function getRandomInteger(min, max) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

/* ---------------------------------------------------------------------------
  Spawn System
--------------------------------------------------------------------------- */

/**
 * Update enemy spawning based on level rules.
 * @param {number} deltaFrames - dt units
 * @param {import("./World.js").World} world - World reference
 */
export function updateSpawning(deltaFrames, world) {
  const spawnConfig = world.levelData.enemySpawn;
  if (!spawnConfig) return;

  const playerX = world.character.x;

  if (playerX < spawnConfig.startX) return;
  if (playerX > spawnConfig.endX) return;

  const aliveEnemies = world.enemies.filter((enemy) => enemy.isAlive).length;
  if (aliveEnemies >= spawnConfig.maxAlive) return;

  world.spawnTimerFrames += deltaFrames;
  if (world.spawnTimerFrames < world.nextSpawnDelayFrames) return;

  world.spawnTimerFrames = 0;
  world.nextSpawnDelayFrames = getRandomInteger(
    spawnConfig.intervalMinFrames,
    spawnConfig.intervalMaxFrames,
  );

  const spawnAheadDistance = getRandomInteger(
    spawnConfig.spawnAheadMin,
    spawnConfig.spawnAheadMax,
  );
  const spawnX = playerX + spawnAheadDistance;

  if (spawnX > spawnConfig.endX) return;

  const enemyType = world._getNextEnemyTypeByLevel();
  const newEnemy = new Enemy({
    x: spawnX,
    groundY: world.groundY,
    type: enemyType,
  });

  world.enemies.push(newEnemy);
}

/* ---------------------------------------------------------------------------
  Collision System
--------------------------------------------------------------------------- */

/**
 * Update collisions between player and enemies and collectables.
 * @param {number} deltaFrames - dt units
 * @param {import("./World.js").World} world - World reference
 */
export function updateCollisions(deltaFrames, world) {
  void deltaFrames;

  updatePlayerEnemyCollisions(world);
  updatePlayerCoinCollisions(world);
}

/**
 * Player vs enemy rules:
 * - From above -> enemy dies, player bounces
 * - From side  -> player takes damage (cooldown in Character)
 * @param {import("./World.js").World} world - World reference
 */
function updatePlayerEnemyCollisions(world) {
  const playerBounds = world.character.getBounds();

  for (const enemy of world.enemies) {
    if (!enemy.isAlive) continue;

    const enemyBounds = enemy.getBounds();
    if (!isOverlapping(playerBounds, enemyBounds)) continue;

    if (isPlayerStompingEnemy(world, enemyBounds)) {
      enemy.kill(world);
      world.character.bounce();
      continue;
    }

    world.character.takeDamage(20, world);
  }
}

/**
 * Determine if player hit enemy from above.
 * Uses player vertical velocity and a small tolerance.
 * @param {import("./World.js").World} world - World reference
 * @param {{x:number,y:number,width:number,height:number}} enemyBounds - Enemy bounds
 * @returns {boolean}
 */
function isPlayerStompingEnemy(world, enemyBounds) {
  const playerBounds = world.character.getBounds();

  const playerBottom = playerBounds.y + playerBounds.height;
  const enemyTop = enemyBounds.y;

  const tolerancePixels = 14;
  const isComingFromAbove = playerBottom <= enemyTop + tolerancePixels;

  const isFallingDown = world.character.velocityY > 0;

  return isComingFromAbove && isFallingDown;
}

/**
 * Player vs coins:
 * - Overlap -> coin collected
 * @param {import("./World.js").World} world - World reference
 */
function updatePlayerCoinCollisions(world) {
  const playerBounds = world.character.getBounds();

  for (const coin of world.coins) {
    if (coin.isCollected) continue;

    if (isOverlapping(playerBounds, coin.getBounds())) {
      coin.collect(world);
    }
  }
}

/* ---------------------------------------------------------------------------
  Cleanup System
--------------------------------------------------------------------------- */

/**
 * Remove entities marked for removal.
 * @param {import("./World.js").World} world - World reference
 */
export function cleanupEntities(world) {
  world.enemies = world.enemies.filter((enemy) => !enemy.markedForRemoval);
}

/* ---------------------------------------------------------------------------
  Level Progress System
--------------------------------------------------------------------------- */

/**
 * Check win condition:
 * - Player reaches end area (or boss dead later)
 * @param {import("./World.js").World} world - World reference
 */
export function updateLevelProgress(world) {
  const endPadding = 120;
  const reachedEnd =
    world.character.x >= world.levelData.worldWidth - endPadding;

  if (!reachedEnd) return;

  world.requestWin();
}

/* ---------------------------------------------------------------------------
  Factory helpers for level setup
--------------------------------------------------------------------------- */

/**
 * Create coin entities from level data.
 * @param {import("./Levels.js").LevelData} levelData - Level data
 * @param {number} groundY - Ground Y
 * @returns {Coin[]}
 */
export function createCoinsForLevel(levelData, groundY) {
  const coins = [];

  for (const coinData of levelData.collectables.coins) {
    const coinY = groundY - coinData.yOffset;
    coins.push(new Coin({ x: coinData.x, y: coinY }));
  }

  return coins;
}
