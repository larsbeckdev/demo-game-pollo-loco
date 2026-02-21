import Background from "@/features/game/rendering/Background.js"; // Background renderer
import Camera from "@/features/game/rendering/Camera.js"; // Camera system
import Keyboard from "@/features/game/core/input/Keyboard.js"; // Keyboard input handler
import World from "@/features/game/core/world/World.js"; // Game world container

export default class Game {
  constructor(canvasElement) {
    this.canvasElement = canvasElement; // Canvas DOM element reference
    this.canvasContext2D = canvasElement.getContext("2d"); // 2D drawing context

    this.isGameRunning = false; // Game loop running flag
    this.requestAnimationFrameId = null; // requestAnimationFrame handle

    this.backgroundRenderer = new Background(); // Background renderer instance
    this.cameraSystem = new Camera(); // Camera system instance

    this.keyboardInput = new Keyboard(); // Keyboard input instance

    this.gameWorld = new World({
      canvas: this.canvasElement, // Provide canvas element
      camera: this.cameraSystem, // Provide camera system
      keyboard: this.keyboardInput, // Provide keyboard input
    });

    this.lastFrameTimestampMilliseconds = 0; // Last frame timestamp (ms)
  }

  start() {
    this.isGameRunning = true; // Enable game loop

    const gameLoop = (currentTimestampMilliseconds) => {
      if (!this.isGameRunning) return; // Stop loop when not running

      const deltaTimeInFrames = this.lastFrameTimestampMilliseconds
        ? (currentTimestampMilliseconds - this.lastFrameTimestampMilliseconds) /
          16.67
        : 1;

      this.lastFrameTimestampMilliseconds = currentTimestampMilliseconds; // Store timestamp

      this.update(deltaTimeInFrames); // Update game logic
      this.render(); // Render current frame

      this.requestAnimationFrameId = requestAnimationFrame(gameLoop); // Schedule next frame
    };

    this.requestAnimationFrameId = requestAnimationFrame(gameLoop); // Start loop
  }

  stop() {
    this.isGameRunning = false; // Disable loop
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId); // Cancel next frame
      this.requestAnimationFrameId = null;
    }
  }

  update(deltaTimeInFrames) {
    this.gameWorld.update(deltaTimeInFrames); // Update entities and systems

    // ----------------------------------------------
    // DEBUG SECTION
    // ----------------------------------------------
    // Debug: Auto-scroll camera to the right
    if (this.debugAutoScroll) {
      this.cameraSystem.x += 100 * deltaTimeInFrames;
    }

    this.debugLogTimerInFrames =
      (this.debugLogTimerInFrames ?? 0) + deltaTimeInFrames;
    if (this.debugLogTimerInFrames >= 1) {
      console.log("[DEBUG] cameraSystem.x:", this.cameraSystem.x.toFixed(2));
      this.debugLogTimerInFrames = 0;
    }
    // ----------------------------------------------
    // END DEBUG SECTION
    // ----------------------------------------------
  }

  render() {
    const canvasContext2D = this.canvasContext2D;
    const canvasElement = this.canvasElement;

    canvasContext2D.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear frame

    this.backgroundRenderer.draw(
      canvasContext2D,
      canvasElement.width,
      canvasElement.height,
      this.cameraSystem.x,
    ); // Draw background based on camera position

    this.gameWorld.draw(canvasContext2D); // Draw world entities

    // this.fullscreenButton.draw(canvasContext2D); // Optional fullscreen button
  }
}
