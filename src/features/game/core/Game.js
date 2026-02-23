import Background from "@/features/game/rendering/Background.js";
import Camera from "@/features/game/rendering/Camera.js";
import Keyboard from "@/features/game/core/input/Keyboard.js";
import World from "@/features/game/core/world/World.js";
import { level1, level2, level3, level4 } from "@/features/game/levels";

export default class Game {
  constructor(canvasElement) {
    this.canvasElement = canvasElement;
    this.canvasContext2D = canvasElement.getContext("2d");

    this.isGameRunning = false;
    this.requestAnimationFrameId = null;

    this.backgroundRenderer = new Background();
    this.cameraSystem = new Camera();
    this.keyboardInput = new Keyboard();

    this.gameWorld = new World({
      canvas: this.canvasElement,
      camera: this.cameraSystem,
      keyboard: this.keyboardInput,
      level: level2,
    });

    this.lastFrameTimestampMilliseconds = 0;

    // =====================================================
    // DEBUG CONFIG
    // =====================================================

    this.debug = {
      enabled: true, // Master switch
      deep: false, // Very detailed logs
      frameCount: 0,
      fpsTimer: 0,
      lastSecondTime: 0,
    };

    if (this.debug.enabled) {
      console.log("%c[Game] INIT", "color:cyan;font-weight:bold;", {
        canvasWidth: this.canvasElement.width,
        canvasHeight: this.canvasElement.height,
        contextReady: !!this.canvasContext2D,
        worldReady: !!this.gameWorld,
      });
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

      // Frame spike detection
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
    if (state === "won") this.onWin?.();
    if (state === "lost") this.onLose?.();

    if (!this.debug.enabled) return;

    this.debug.frameCount++;
    this.debug.fpsTimer += deltaTimeInFrames;

    // Log once per ~60 frames (~1 second)
    if (this.debug.frameCount % 60 === 0) {
      const player = this.gameWorld.character;

      console.log("%c[Game Update]", "color:orange;", {
        dt: Number(deltaTimeInFrames.toFixed(2)),
        camX: Number(this.cameraSystem.x.toFixed(1)),
        playerX: Number(player?.x?.toFixed?.(1) ?? 0),
        playerY: Number(player?.y?.toFixed?.(1) ?? 0),
        state: player?.state,
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
