import Background from "@/classes/rendering/Background.js"; // Background renderer
import Camera from "@/classes/rendering/Camera.js"; // Camera system
import Keyboard from "./Keyboard.js"; // Input handler
import World from "./World.js"; // Game world

export default class Game {
  constructor(canvas) {
    this.canvas = canvas; // Canvas reference
    this.ctx = canvas.getContext("2d"); // 2D context

    this.running = false; // Running state
    this.rafId = null; // Frame id

    this.background = new Background(); // Create background
    this.camera = new Camera(); // Create camera

    this.keyboard = new Keyboard(); // Create keyboard

    this.world = new World({
      canvas: this.canvas, // Pass canvas
      camera: this.camera, // Pass camera
      keyboard: this.keyboard, // Pass keyboard
    });

    this.lastTs = 0; // Last timestamp
  }

  start() {
    this.running = true; // Set running

    const loop = (ts) => {
      if (!this.running) return; // Stop loop

      const dt = this.lastTs ? (ts - this.lastTs) / 16.67 : 1; // Delta time
      this.lastTs = ts; // Update timestamp

      this.update(dt); // Update world
      this.render(); // Render frame

      this.rafId = requestAnimationFrame(loop); // Next frame
    };

    this.rafId = requestAnimationFrame(loop); // Start loop
  }

  stop() {
    this.running = false; // Stop running
    if (this.rafId) cancelAnimationFrame(this.rafId); // Cancel frame
  }

  update(dt) {
    this.world.update(dt); // Update entities
  }

  render() {
    const { ctx, canvas } = this; // Destructure refs

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    this.background.draw(ctx, canvas.width, canvas.height, this.camera.x); // Draw background

    this.world.draw(ctx); // Draw world

    // this.fullscreenButton.draw(ctx);
    // Draw fullscreen button
  }
}
