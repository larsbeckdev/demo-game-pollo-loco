/* ============================================================================
  MovementSystem
  - Controls complete player movement flow
  - Handles:
      1) Input
      2) Physics
      3) Player boundary clamping
      4) Camera following
============================================================================ */

/* ============================================================================
  PlayerBoundsSystem
  - Ensures the player stays inside world boundaries
============================================================================ */

class PlayerBoundsSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { character, worldWidth } = this.world;

    /* Left boundary */
    if (character.x < 0) {
      character.x = 0;
    }

    /* Right boundary */
    const maximumAllowedX = worldWidth - character.w;

    if (character.x > maximumAllowedX) {
      character.x = maximumAllowedX;
    }
  }
}

/* ============================================================================
  CameraFollowSystem
  - Makes the camera follow the player
  - Prevents showing empty space outside level
============================================================================ */

class CameraFollowSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { camera, character, canvas, worldWidth } = this.world;

    const followOffset = 200;

    const targetX = character.x - followOffset;

    const maxCameraX = Math.max(0, worldWidth - canvas.width);

    camera.x = Math.min(Math.max(0, targetX), maxCameraX);
  }
}

/* ============================================================================
  MovementSystem (Main System)
============================================================================ */

export default class MovementSystem {
  constructor(world) {
    this.world = world;

    /* Subsystems */
    this.playerBounds = new PlayerBoundsSystem(world);
    this.cameraFollow = new CameraFollowSystem(world);
  }

  update(dt) {
    const world = this.world;

    /* ------------------------------------------------------------
       1) Input
    ------------------------------------------------------------ */
    world.character.handleInput(world.keyboard);

    /* ------------------------------------------------------------
       2) Physics + animation
    ------------------------------------------------------------ */
    world.character.update(dt);

    /* ------------------------------------------------------------
       3) Clamp player to world bounds
    ------------------------------------------------------------ */
    this.playerBounds.update();

    /* ------------------------------------------------------------
       4) Update camera follow
    ------------------------------------------------------------ */
    this.cameraFollow.update();
  }
}
