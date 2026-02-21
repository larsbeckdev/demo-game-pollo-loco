import PlayerBoundsSystem from "./PlayerBoundsSystem.js";
import CameraFollowSystem from "./CameraFollowSystem.js";

export default class MovementSystem {
  constructor(world) {
    this.world = world;

    this.playerBounds = new PlayerBoundsSystem(world);
    this.cameraFollow = new CameraFollowSystem(world);
  }

  update(dt) {
    const w = this.world;

    // 1) Input → sets movement intentions
    w.character.handleInput(w.keyboard);

    // 2) Physics update
    w.character.update(dt);

    // 3) Clamp player inside world
    this.playerBounds.update();

    // 4) Camera follow
    this.cameraFollow.update();
  }
}
