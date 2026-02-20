import clampPlayerX from "./clampPlayerX.js";
import updateCameraFollow from "./updateCameraFollow.js";

export default class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const w = this.world;

    // 1) Input -> (sets intentions like left/right/jump)
    w.character.handleInput(w.keyboard);

    // 2) Physics/Movement update (uses dt)
    w.character.update(dt);

    // 3) Keep player inside world bounds
    clampPlayerX(w);

    // 4) Camera follows character (clamped to world)
    updateCameraFollow(w);
  }
}
