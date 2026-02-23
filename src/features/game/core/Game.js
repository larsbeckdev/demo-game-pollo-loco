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

    // =====================================================
    // DEBUG CONFIG
    // =====================================================
    this.debug = {
      enabled: true,
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
  // LEVEL LOADING
  // =====================================================
  loadLevel(index) {
    this.levelIndex = Math.max(0, Math.min(index, LEVELS.length - 1));

    // stop dt spikes after level switch
    this.lastFrameTimestampMilliseconds = 0;

    // reset camera
    this.cameraSystem.x = 0;

    // optional: reset debug counter
    this.debug.frameCount = 0;

    // create new world instance
    this.gameWorld = new World({
      canvas: this.canvasElement,
      camera: this.cameraSystem,
      keyboard: this.keyboardInput,
      level: LEVELS[this.levelIndex],
    });

    // IMPORTANT: start state should be intro by default
    // (Game.vue sets it to "playing" on Start)
    this.gameWorld.state = "intro";

    if (this.debug.enabled) {
      console.log(
        "%c[Game] LOAD LEVEL",
        "color:deepskyblue;font-weight:bold;",
        {
          levelIndex: this.levelIndex,
          levelId: this.gameWorld?.level?.id,
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
      console.log("%c[Game] START", "color:lime;font-weight:bold;");
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

    // ✅ Level progression
    if (state === "won") {
      if (this.levelIndex < LEVELS.length - 1) {
        this.loadLevel(this.levelIndex + 1);

        // Decide how you want to start next level:
        // Option A: auto-start next level immediately:
        // this.gameWorld.state = "playing";

        // Option B (recommended): keep intro screen:
        // this.gameWorld.state stays "intro"
      } else {
        // final win (after level4)
        this.onWin?.();
      }
      return;
    }

    if (state === "lost") {
      this.onLose?.();
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
