import Background from "@/features/game/rendering/Background.js";
import Camera from "@/features/game/rendering/Camera.js";
import Keyboard from "@/features/game/core/input/Keyboard.js";
import World from "@/features/game/core/world/World.js";
import { level1, level2, level3, level4 } from "@/features/game/levels";

const LEVELS = [level1, level2, level3, level4];

export default class Game {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.canvasContext2D = canvasElement.getContext("2d");

    this.isGameRunning = false;
    this.requestAnimationFrameId = null;

    this.backgroundRenderer = new Background();
    this.cameraSystem = new Camera();
    this.keyboardInput = new Keyboard();

    // ✅ Level state
    this.levelIndex = 0;

    // ✅ Create first world
    this.gameWorld = new World({
      canvas: this.canvasElement,
      camera: this.cameraSystem,
      keyboard: this.keyboardInput,
      level: LEVELS[this.levelIndex],
    });

    this.lastFrameTimestampMilliseconds = 0;

    this.debug = {
      enabled: false,
      deep: false,
      frameCount: 0,
    };

    if (this.debug.enabled) {
      console.log("%c[Game] INIT", "color:cyan;font-weight:bold;", {
        contextReady: !!this.canvasContext2D,
        worldReady: !!this.gameWorld,
        levelId: this.gameWorld?.level?.id,
      });
    }
  }

  // =====================================================
  // LEVEL INFO (für UI)
  // =====================================================
  getLevelIndex() {
    return this.levelIndex; // 0..3
  }

  getLevelNumber() {
    return this.levelIndex + 1; // 1..4
  }

  getLevelId() {
    return this.gameWorld?.level?.id ?? `level${this.getLevelNumber()}`;
  }

  hasNextLevel() {
    return this.levelIndex < LEVELS.length - 1;
  }

  // optional helper (wird von deiner UI NICHT mehr benötigt)
  goToNextLevel() {
    if (!this.hasNextLevel()) return false;
    this.loadLevel(this.levelIndex + 1);
    return true;
  }

  // =====================================================
  // LEVEL LOADING
  // =====================================================
  loadLevel(index) {
    this.levelIndex = Math.max(0, Math.min(index, LEVELS.length - 1));

    this.lastFrameTimestampMilliseconds = 0;
    this.cameraSystem.x = 0;
    this.debug.frameCount = 0;

    this.gameWorld = new World({
      canvas: this.canvasElement,
      camera: this.cameraSystem,
      keyboard: this.keyboardInput,
      level: LEVELS[this.levelIndex],
    });

    // Default: intro (UI setzt "playing" bei Start)
    this.gameWorld.state = "intro";

    if (this.debug.enabled) {
      console.log(
        "%c[Game] LOAD LEVEL",
        "color:deepskyblue;font-weight:bold;",
        {
          levelIndex: this.levelIndex,
          levelNumber: this.getLevelNumber(),
          levelId: this.getLevelId(),
        },
      );
    }
  }

  // =====================================================
  // START
  // =====================================================
  start() {
    if (this.isGameRunning) return;

    this.isGameRunning = true;

    if (this.debug.enabled) {
      console.log("%c[Game] START", "color:lime;font-weight:bold;", {
        levelNumber: this.getLevelNumber(),
        levelId: this.getLevelId(),
      });
    }

    const gameLoop = (currentTimestampMilliseconds) => {
      if (!this.isGameRunning) return;

      const deltaTimeInFrames = this.lastFrameTimestampMilliseconds
        ? (currentTimestampMilliseconds - this.lastFrameTimestampMilliseconds) /
          16.67
        : 1;

      this.lastFrameTimestampMilliseconds = currentTimestampMilliseconds;

      if (this.debug.enabled && deltaTimeInFrames > 3) {
        console.warn("[Game] Frame spike detected!", {
          dt: deltaTimeInFrames.toFixed(2),
        });
      }

      this.update(deltaTimeInFrames);
      this.render();

      this.requestAnimationFrameId = requestAnimationFrame(gameLoop);
    };

    this.requestAnimationFrameId = requestAnimationFrame(gameLoop);
  }

  // =====================================================
  // STOP
  // =====================================================
  stop() {
    if (!this.isGameRunning) return;

    this.isGameRunning = false;

    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }

    if (this.debug.enabled) {
      console.log("%c[Game] STOP", "color:red;font-weight:bold;");
    }
  }

  // =====================================================
  // UPDATE
  // =====================================================
  update(deltaTimeInFrames) {
    this.gameWorld.update(deltaTimeInFrames);

    const state = this.gameWorld?.state;

    // ✅ WIN: auto-load next level (if exists), STOP, notify UI
    if (state === "won") {
      const isFinal = !this.hasNextLevel();

      if (this.debug.enabled) {
        console.log("%c[Game] WON", "color:lime;font-weight:bold;", {
          justFinishedLevel: this.getLevelNumber(),
          justFinishedLevelId: this.getLevelId(),
          isFinal,
        });
      }

      // stop loop so nothing continues in background
      this.stop();

      // if not final -> load next level NOW (but keep it in intro)
      if (!isFinal) {
        this.loadLevel(this.levelIndex + 1);
      }

      // tell UI: show win screen (UI button will START)
      this.onWin?.({ isFinal });
      return;
    }

    // ✅ LOSE: stop + notify UI
    if (state === "lost") {
      this.stop();
      this.onLose?.({
        levelNumber: this.getLevelNumber(),
        levelId: this.getLevelId(),
      });
      return;
    }

    if (!this.debug.enabled) return;

    this.debug.frameCount++;

    if (this.debug.frameCount % 60 === 0) {
      const player = this.gameWorld.character;

      console.log("%c[Game Update]", "color:orange;", {
        dt: Number(deltaTimeInFrames.toFixed(2)),
        camX: Number(this.cameraSystem.x.toFixed(1)),
        playerX: Number(player?.x?.toFixed?.(1) ?? 0),
        playerY: Number(player?.y?.toFixed?.(1) ?? 0),
        state: player?.state,
        levelId: this.gameWorld?.level?.id,
        levelNumber: this.getLevelNumber(),
      });
    }

    if (this.debug.deep) {
      console.log("[Game Deep Debug]", {
        deltaTimeInFrames,
        cameraX: this.cameraSystem.x,
        playerVX: this.gameWorld.character?.vx,
        playerVY: this.gameWorld.character?.vy,
      });
    }
  }

  // =====================================================
  // RENDER
  // =====================================================
  render() {
    const ctx = this.canvasContext2D;
    const canvas = this.canvasElement;

    if (!ctx) {
      console.error("[Game] No 2D context!");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.backgroundRenderer.draw(
      ctx,
      canvas.width,
      canvas.height,
      this.cameraSystem.x,
    );

    this.gameWorld.draw(ctx);

    if (this.debug.enabled && this.debug.frameCount % 120 === 0) {
      console.log("%c[Game Render OK]", "color:purple;", {
        cameraX: this.cameraSystem.x,
        canvasWidth: canvas.width,
      });
    }
  }
}
