// src/features/game/World.js

/* ============================================================================
  World
  - Holds the current level state and all entities
  - Runs all systems in the correct order
  - Reports "win" and "gameOver" back to Game
============================================================================ */

import { Character } from "./Entities.js";
import {
  createCoinsForLevel,
  updateSpawning,
  updateCollisions,
  cleanupEntities,
  updateLevelProgress,
} from "./Systems.js";

/**
 * @typedef {import("./Levels.js").LevelData} LevelData
 */

export class World {
  /**
   * @param {{
   *   canvas: HTMLCanvasElement,
   *   levelData: LevelData,
   *   assets: import("./Assets.js").Assets,
   *   inputState: import("./Input.js").InputState,
   *   onGameOver: () => void,
   *   onWin: () => void
   * }} options - Setup
   */
  constructor(options) {
    this.canvas = options.canvas;
    this.assets = options.assets;
    this.inputState = options.inputState;

    this.onGameOver = options.onGameOver;
    this.onWin = options.onWin;

    this.levelData = options.levelData;

    this.groundY = this.canvas.height - this.levelData.groundOffset;

    this.stats = {
      coins: 0,
    };

    this.spawnTimerFrames = 0;
    this.nextSpawnDelayFrames = 90;

    this.character = new Character({
      x: this.levelData.playerStart.x,
      groundY: this.groundY,
    });

    this.enemies = [];
    this.coins = createCoinsForLevel(this.levelData, this.groundY);

    this._winRequested = false;
    this._gameOverRequested = false;
  }

  /**
   * Reset world completely for the current level.
   * @param {LevelData} levelData - New level data
   */
  reset(levelData) {
    this.levelData = levelData;

    this.groundY = this.canvas.height - this.levelData.groundOffset;

    this.stats.coins = 0;

    this.spawnTimerFrames = 0;
    this.nextSpawnDelayFrames = 90;

    this.character = new Character({
      x: this.levelData.playerStart.x,
      groundY: this.groundY,
    });

    this.enemies = [];
    this.coins = createCoinsForLevel(this.levelData, this.groundY);

    this._winRequested = false;
    this._gameOverRequested = false;
  }

  /**
   * Update world.
   * @param {number} deltaFrames - dt units
   */
  update(deltaFrames) {
    this.character.update(deltaFrames, this);

    for (const enemy of this.enemies) {
      enemy.update(deltaFrames, this);
    }

    for (const coin of this.coins) {
      coin.update(deltaFrames, this);
    }

    updateSpawning(deltaFrames, this);
    updateCollisions(deltaFrames, this);
    updateLevelProgress(this);
    cleanupEntities(this);

    this._flushRequests();
  }

  /**
   * Draw order:
   * - background is handled by Game (Render.js)
   * - world draws: coins -> enemies -> player
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} cameraX - Camera x
   */
  draw(context, cameraX) {
    for (const coin of this.coins) {
      coin.draw(context, cameraX, this.assets);
    }

    for (const enemy of this.enemies) {
      enemy.draw(context, cameraX, this.assets);
    }

    this.character.draw(context, cameraX, this.assets);
  }

  /** Request a game over. */
  requestGameOver() {
    this._gameOverRequested = true;
  }

  /** Request a win. */
  requestWin() {
    this._winRequested = true;
  }

  /**
   * Determine enemy types per level.
   * Level 1: normal only
   * Level 2: mix
   * Level 3: more small
   * Level 4: mix (boss later)
   * @returns {"normal"|"small"}
   */
  _getNextEnemyTypeByLevel() {
    const levelId = this.levelData.id;

    if (levelId === "level1") return "normal";
    if (levelId === "level2") return Math.random() < 0.25 ? "small" : "normal";
    if (levelId === "level3") return Math.random() < 0.55 ? "small" : "normal";
    return Math.random() < 0.45 ? "small" : "normal";
  }

  _flushRequests() {
    if (this._gameOverRequested) this.onGameOver();
    if (this._winRequested) this.onWin();
  }
}
