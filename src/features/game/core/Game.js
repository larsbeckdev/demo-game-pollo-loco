/* ============================================================================
  Imports
  - Rendering: Background renderer
  - Rendering: Camera system (holds camera position)
  - Input: Keyboard input handler
  - World: Container that owns entities and runs systems
============================================================================ */

import Background from "@/features/game/rendering/Background.js";
import Camera from "@/features/game/rendering/Camera.js";
import Keyboard from "@/features/game/core/input/Keyboard.js";
import World from "@/features/game/core/world/World.js";

/* ============================================================================
  Game
  - Owns the main game loop (requestAnimationFrame)
  - Calculates delta time between frames
  - Calls update() and render() every frame while running
  - Holds core instances (background, camera, input, world)
============================================================================ */

export default class Game {
  /* ==========================================================================
    Constructor
    - Stores canvas references
    - Creates core instances (background, camera, keyboard, world)
    - Initializes loop state and timing values
  ========================================================================== */

  constructor(canvasElement) {
    /* ------------------------------------------------------------------------
      Canvas references
      - canvasElement: the DOM element <canvas>
      - canvasContext2D: the 2D drawing context used for rendering
    ------------------------------------------------------------------------ */

    this.canvasElement = canvasElement;
    this.canvasContext2D = canvasElement.getContext("2d");

    /* ------------------------------------------------------------------------
      Game loop state
      - isGameRunning: determines if the loop should continue
      - requestAnimationFrameId: stores the handle so we can cancel it on stop()
    ------------------------------------------------------------------------ */

    this.isGameRunning = false;
    this.requestAnimationFrameId = null;

    /* ------------------------------------------------------------------------
      Core systems and helpers
      - backgroundRenderer: draws the background based on camera position
      - cameraSystem: stores the camera position (for scrolling)
      - keyboardInput: reads keyboard state
    ------------------------------------------------------------------------ */

    this.backgroundRenderer = new Background();
    this.cameraSystem = new Camera();
    this.keyboardInput = new Keyboard();

    /* ------------------------------------------------------------------------
      World setup
      - The world owns entities (character, enemies, bottles, etc.)
      - The world owns and runs systems (movement, collision, throw, etc.)
    ------------------------------------------------------------------------ */

    this.gameWorld = new World({
      canvas: this.canvasElement,
      camera: this.cameraSystem,
      keyboard: this.keyboardInput,
    });

    /* ------------------------------------------------------------------------
      Timing
      - lastFrameTimestampMilliseconds: used to compute delta time each frame
      - The value is in milliseconds as provided by requestAnimationFrame
    ------------------------------------------------------------------------ */

    this.lastFrameTimestampMilliseconds = 0;

    /* ------------------------------------------------------------------------
      Debug values (optional)
      - debugAutoScroll: when true, camera moves automatically to the right
      - debugLogTimerInFrames: timer accumulator for log throttling
    ------------------------------------------------------------------------ */

    this.debugAutoScroll = false;
    this.debugLogTimerInFrames = 0;
  }

  /* ==========================================================================
    ✅ ADD: Canvas resize helper
    - Fixes devicePixelRatio scaling issues
  ========================================================================== */

  resizeCanvasToDisplaySize() {
    const canvas = this.canvasElement;
    const context = this.canvasContext2D;

    const devicePixelRatio = window.devicePixelRatio || 1;

    const boundingClientRect = canvas.getBoundingClientRect();

    const displayWidth = Math.round(boundingClientRect.width);
    const displayHeight = Math.round(boundingClientRect.height);

    const newWidth = Math.round(displayWidth * devicePixelRatio);
    const newHeight = Math.round(displayHeight * devicePixelRatio);

    const sizeChanged =
      canvas.width !== newWidth || canvas.height !== newHeight;

    if (sizeChanged) {
      canvas.width = newWidth;
      canvas.height = newHeight;

      /* ----------------------------------------------------------------------
        IMPORTANT:
        - Scale drawing operations so 1 unit = 1 CSS pixel
      ---------------------------------------------------------------------- */

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      console.log("[DEBUG] Canvas resized:", {
        width: canvas.width,
        height: canvas.height,
        dpr: devicePixelRatio,
      });
    }
  }

  /* ==========================================================================
    Start
    - Enables the loop
    - Creates a requestAnimationFrame callback function
    - Schedules the first frame
  ========================================================================== */

  start() {
    /* ------------------------------------------------------------------------
      Enable loop
    ------------------------------------------------------------------------ */

    this.isGameRunning = true;

    /* ------------------------------------------------------------------------
      Game loop function (called every animation frame)
      - currentTimestampMilliseconds is provided by requestAnimationFrame
    ------------------------------------------------------------------------ */

    const gameLoop = (currentTimestampMilliseconds) => {
      /* ----------------------------------------------------------------------
        Stop condition
        - If stop() was called, do not continue updating or rendering
      ---------------------------------------------------------------------- */

      if (!this.isGameRunning) return;

      /* ----------------------------------------------------------------------
        Delta time calculation
        - Convert milliseconds to a "frame unit" relative to ~60 frames per second
        - 16.67 ms is approximately one frame at 60 frames per second
        - If this is the first frame, default delta time to 1 frame unit
      ---------------------------------------------------------------------- */

      const deltaTimeInFrames = this.lastFrameTimestampMilliseconds
        ? (currentTimestampMilliseconds - this.lastFrameTimestampMilliseconds) /
          16.67
        : 1;

      /* ----------------------------------------------------------------------
        Store timestamp for next frame delta time calculation
      ---------------------------------------------------------------------- */

      this.lastFrameTimestampMilliseconds = currentTimestampMilliseconds;

      /* ----------------------------------------------------------------------
        Update and render
      ---------------------------------------------------------------------- */

      this.update(deltaTimeInFrames);
      this.render();

      /* ----------------------------------------------------------------------
        Schedule next frame
      ---------------------------------------------------------------------- */

      this.requestAnimationFrameId = requestAnimationFrame(gameLoop);
    };

    /* ------------------------------------------------------------------------
      Start first frame
    ------------------------------------------------------------------------ */

    this.requestAnimationFrameId = requestAnimationFrame(gameLoop);
  }

  /* ==========================================================================
    Stop
    - Disables the loop
    - Cancels the scheduled animation frame if present
  ========================================================================== */

  stop() {
    /* ------------------------------------------------------------------------
      Disable loop
    ------------------------------------------------------------------------ */

    this.isGameRunning = false;

    /* ------------------------------------------------------------------------
      Cancel scheduled frame
    ------------------------------------------------------------------------ */

    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      this.requestAnimationFrameId = null;
    }
  }

  /* ==========================================================================
    Update
    - Updates world logic each frame
    - Contains an optional debug section that can be toggled
  ========================================================================== */

  update(deltaTimeInFrames) {
    /* ------------------------------------------------------------------------
      World update
      - Runs world systems in their defined order
    ------------------------------------------------------------------------ */

    this.gameWorld.update(deltaTimeInFrames);

    /* ------------------------------------------------------------------------
      Debug section (optional)
      - Camera auto-scroll: moves camera to the right
      - Console logging: prints camera position once per "frame unit" interval
    ------------------------------------------------------------------------ */

    if (this.debugAutoScroll) {
      this.cameraSystem.x += 100 * deltaTimeInFrames;
    }

    this.debugLogTimerInFrames =
      (this.debugLogTimerInFrames ?? 0) + deltaTimeInFrames;

    if (this.debugLogTimerInFrames >= 1) {
      console.log("[DEBUG] cameraSystem.x:", this.cameraSystem.x.toFixed(2));
      this.debugLogTimerInFrames = 0;
    }
  }

  /* ==========================================================================
    Render
    - Clears the canvas each frame
    - Draws background first, then world entities
  ========================================================================== */

  render() {
    /* ------------------------------------------------------------------------
      Local references for readability
    ------------------------------------------------------------------------ */

    const canvasContext2D = this.canvasContext2D;
    const canvasElement = this.canvasElement;

    /* ------------------------------------------------------------------------
      Clear frame
    ------------------------------------------------------------------------ */

    canvasContext2D.clearRect(0, 0, canvasElement.width, canvasElement.height);

    /* ------------------------------------------------------------------------
      Background draw
      - Uses cameraSystem.x to shift the background for scrolling
    ------------------------------------------------------------------------ */

    this.backgroundRenderer.draw(
      canvasContext2D,
      canvasElement.width,
      canvasElement.height,
      this.cameraSystem.x,
    );

    /* ------------------------------------------------------------------------
      World draw
      - Draw all entities (player, enemies, bottles, etc.)
    ------------------------------------------------------------------------ */

    this.gameWorld.draw(canvasContext2D);
  }
}
