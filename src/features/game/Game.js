// src/features/game/Game.js

/* ============================================================================
  Game
  - Single entry for Vue to create a canvas game
  - Owns: assets, background renderer, time, camera, input, world
  - Controls 4 levels and restarts without reload
============================================================================ */

import { Assets } from "./Assets.js";
import { BackgroundRenderer } from "./Render.js";
import { createTime } from "./Time.js";
import { createInput } from "./Input.js";
import { getLevelByIndex, LEVELS } from "./Levels.js";
import { World } from "./World.js";

/* ---------------------------------------------------------------------------
  Game State Enum
--------------------------------------------------------------------------- */

const GAME_STATE_LOADING = "LOADING";
const GAME_STATE_RUNNING = "RUNNING";
const GAME_STATE_GAME_OVER = "GAME_OVER";
const GAME_STATE_WIN = "WIN";

/* ---------------------------------------------------------------------------
  Camera helper (compact, but explicit)
--------------------------------------------------------------------------- */

/**
 * Create a simple camera.
 * @returns {{x:number, update:(playerX:number, canvasWidth:number, worldWidth:number)=>void}}
 */
function createCamera() {
  return {
    x: 0,

    /**
     * @param {number} playerX - Player x
     * @param {number} canvasWidth - Canvas width
     * @param {number} worldWidth - World width
     */
    update(playerX, canvasWidth, worldWidth) {
      const target = playerX - canvasWidth * 0.35;

      const clamped = Math.max(0, Math.min(worldWidth - canvasWidth, target));
      this.x = clamped;
    },
  };
}

/* ============================================================================
  Game Class
============================================================================ */

export default class Game {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.assets = new Assets();
    this.backgroundRenderer = new BackgroundRenderer(this.assets);
    this.time = createTime();

    const inputBundle = createInput();
    this.inputState = inputBundle.inputState;
    this.keyboard = inputBundle.keyboard;
    this.touch = inputBundle.touch;

    this.camera = createCamera();

    this.levelIndex = 0;
    this.levelData = getLevelByIndex(this.levelIndex);

    this.world = new World({
      canvas: this.canvas,
      levelData: this.levelData,
      assets: this.assets,
      inputState: this.inputState,
      onGameOver: () => this._setGameOver(),
      onWin: () => this._setWin(),
    });

    this.state = GAME_STATE_LOADING;

    this.isRunning = false;
    this.requestAnimationFrameId = null;
  }

  /* --------------------------------------------------------------------------
    Public API
  -------------------------------------------------------------------------- */

  /** Start the game. */
  async start() {
    this.isRunning = true;
    this.keyboard.attach();

    await this._loadAssetsForCurrentLevel();

    this.assets.sounds.startMusic();

    this.state = GAME_STATE_RUNNING;
    this._loop(0);
  }

  /** Stop the game loop and detach input. */
  stop() {
    this.isRunning = false;

    if (this.requestAnimationFrameId !== null) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }

    this.keyboard.detach();
    this.assets.sounds.stopAll();
  }

  /**
   * Expose touch setter for mobile UI.
   * @returns {import("./Input.js").TouchInput}
   */
  getTouch() {
    return this.touch;
  }

  /** Restart current level without reloading the page. */
  restartLevel() {
    this.time.reset();
    this.world.reset(this.levelData);

    this.state = GAME_STATE_RUNNING;
  }

  /** Go back to level 1 (for "Home" handling, if you want). */
  resetToFirstLevel() {
    this.levelIndex = 0;
    this._loadLevelIndex(this.levelIndex);
  }

  /* --------------------------------------------------------------------------
    Main Loop
  -------------------------------------------------------------------------- */

  /**
   * @param {number} timestamp - requestAnimationFrame timestamp
   */
  _loop(timestamp) {
    if (!this.isRunning) return;

    const deltaFrames = this.time.getDeltaFrames(timestamp);

    this._update(deltaFrames);
    this._render();

    this.requestAnimationFrameId = requestAnimationFrame((nextTimestamp) => {
      this._loop(nextTimestamp);
    });
  }

  /**
   * @param {number} deltaFrames - dt units
   */
  _update(deltaFrames) {
    this._consumeOneShotInput();

    if (this.state !== GAME_STATE_RUNNING) return;

    this.camera.update(
      this.world.character.x,
      this.canvas.width,
      this.levelData.worldWidth,
    );

    this.world.update(deltaFrames);
  }

  _render() {
    const context = this.context;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.backgroundRenderer.drawBackground(
      context,
      this.canvas.width,
      this.canvas.height,
      this.levelData.background,
      this.camera.x,
    );

    this.world.draw(context, this.camera.x);

    this._drawSimpleHud(context);
    this._drawEndOverlayIfNeeded(context);
  }

  /* --------------------------------------------------------------------------
    Input handling
  -------------------------------------------------------------------------- */

  _consumeOneShotInput() {
    if (!this.inputState.toggleMuteRequested) return;

    this.inputState.toggleMuteRequested = false;
    this.assets.sounds.toggleMute();
  }

  /* --------------------------------------------------------------------------
    Asset Loading
  -------------------------------------------------------------------------- */

  async _loadAssetsForCurrentLevel() {
    const backgroundSources = this.levelData.background.layers.map(
      (layer) => layer.source,
    );
    await this.assets.loadAll(backgroundSources);
  }

  /* --------------------------------------------------------------------------
    Win / GameOver / Level switching
  -------------------------------------------------------------------------- */

  _setGameOver() {
    if (this.state !== GAME_STATE_RUNNING) return;
    this.state = GAME_STATE_GAME_OVER;
  }

  _setWin() {
    if (this.state !== GAME_STATE_RUNNING) return;
    this.state = GAME_STATE_WIN;
  }

  /** Load next level (max 4). */
  async nextLevel() {
    const nextIndex = Math.min(this.levelIndex + 1, LEVELS.length - 1);
    this._loadLevelIndex(nextIndex);

    await this._loadAssetsForCurrentLevel();
    this.state = GAME_STATE_RUNNING;
  }

  /**
   * @param {number} index - Level index
   */
  _loadLevelIndex(index) {
    this.levelIndex = index;
    this.levelData = getLevelByIndex(this.levelIndex);

    this.time.reset();
    this.world.reset(this.levelData);
  }

  /* --------------------------------------------------------------------------
    UI drawing (minimal, canvas-only)
  -------------------------------------------------------------------------- */

  /**
   * Draw a simple HUD (coins and health).
   * @param {CanvasRenderingContext2D} context - Canvas context
   */
  _drawSimpleHud(context) {
    context.save();

    context.font = "16px sans-serif";
    context.fillStyle = "white";

    context.fillText(`Coins: ${this.world.stats.coins}`, 16, 24);
    context.fillText(`Health: ${this.world.character.health}`, 16, 46);

    context.restore();
  }

  /**
   * Draw end overlays and basic instructions.
   * @param {CanvasRenderingContext2D} context - Canvas context
   */
  _drawEndOverlayIfNeeded(context) {
    if (this.state === GAME_STATE_RUNNING) return;

    context.save();

    context.fillStyle = "rgba(0,0,0,0.55)";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    context.fillStyle = "white";
    context.font = "28px sans-serif";

    const title =
      this.state === GAME_STATE_GAME_OVER ? "Game Over" : "Level Complete";
    context.fillText(title, 260, 180);

    context.font = "16px sans-serif";
    context.fillText("Press R to restart this level.", 260, 215);
    context.fillText("Press N to go to next level (after win).", 260, 240);
    context.fillText("Press M to toggle mute.", 260, 265);

    context.restore();

    this._handleEndScreenKeys();
  }

  _handleEndScreenKeys() {
    const keyState = this.inputState;

    void keyState;

    // IMPORTANT:
    // No key events here to keep responsibilities clean.
    // If you want R/N keys, add them in Input.js in a clean way.
  }
}
