export default class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const w = this.world;

    // Player input + update
    w.character.handleInput(w.keyboard);
    w.character.update(dt);

    // Left clamp
    if (w.character.x < 0) w.character.x = 0;

    // Right clamp
    if (w.character.x > w.worldWidth - w.character.w) {
      w.character.x = w.worldWidth - w.character.w;
    }

    // Camera follow
    w.camera.x = Math.max(0, w.character.x - 200);

    // Camera limit
    const maxCamX = Math.max(0, w.worldWidth - w.canvas.width);
    if (w.camera.x > maxCamX) w.camera.x = maxCamX;
  }
}
