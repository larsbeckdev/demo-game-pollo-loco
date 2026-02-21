/* ============================================================================
  Imports
  - Entities: Character and Enemy
  - Level data: default level configuration
  - Systems: Movement, Throw, Collision
============================================================================ */

import Character from "@/features/game/entities/character/Character.js";
import Enemy from "@/features/game/entities/enemy/Enemy.js";
import { level1 } from "@/features/game/levels/level1.js";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";

/* ============================================================================
  World
  - Holds references to canvas, camera, input, and current level
  - Owns all entities (player, enemies, bottles, collectables)
  - Owns and calls all systems in the correct order
============================================================================ */

export default class World {
  /* ==========================================================================
    Constructor
    - Stores shared references (canvas, camera, keyboard, level)
    - Calculates ground position
    - Creates initial entities
    - Defines world boundaries
    - Creates systems
  ========================================================================== */

  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    /* ------------------------------------------------------------------------
      Shared references
    ------------------------------------------------------------------------ */

    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

    /* ------------------------------------------------------------------------
      Ground setup
      - The ground is derived from the canvas height and a level offset
      - If the level does not define an offset, a default value is used
    ------------------------------------------------------------------------ */

    // const groundOffsetFromLevel =
    //   this.level.groundOffset !== undefined ? this.level.groundOffset : 40;

    // this.groundY = this.canvas.height - groundOffsetFromLevel;

    this.groundY = 398;

    /* ------------------------------------------------------------------------
      Player setup
      - Create the main character and place it relative to the ground
    ------------------------------------------------------------------------ */

    this.character = new Character({ groundY: this.groundY });

    /* ------------------------------------------------------------------------
      Entities setup
      - Enemies: start with one enemy for testing
      - Collectables: empty list for now
      - Bottles: projectiles that can be thrown
    ------------------------------------------------------------------------ */

    this.enemies = [new Enemy({ x: 600, groundY: this.groundY, scale: 0.5 })];
    this.collectables = [];
    this.bottles = [];

    /* ------------------------------------------------------------------------
      World size / boundaries
      - Used for camera clamping and for limiting movement inside the level
      - If the level does not define a width, a default value is used
    ------------------------------------------------------------------------ */

    const worldWidthFromLevel =
      this.level.worldWidth !== undefined ? this.level.worldWidth : 4000;

    this.worldWidth = worldWidthFromLevel;

    /* ------------------------------------------------------------------------
      Systems setup
      - Systems receive the world reference so they can read and modify state
      - Systems are executed in a defined order during update()
    ------------------------------------------------------------------------ */

    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);
  }

  /* ==========================================================================
    Update
    - Called every frame with a delta time value
    - The order of system updates is important for consistent gameplay:
      1) Movement: input, physics, character movement, camera position
      2) Throw: spawning and updating thrown bottles
      3) Collision: resolving collisions and applying damage / effects
  ========================================================================== */

  update(dt) {
    /* ------------------------------------------------------------------------
      1) Movement system
      - Reads keyboard input
      - Updates character position and camera position
    ------------------------------------------------------------------------ */

    this.movementSystem.update(dt);

    /* ------------------------------------------------------------------------
      2) Throw system
      - Creates bottles when the throw action is triggered
      - Updates existing bottles (movement, lifetime, bounds)
    ------------------------------------------------------------------------ */

    this.throwSystem.update(dt);

    /* ------------------------------------------------------------------------
      3) Collision system
      - Checks collisions:
        - Character vs enemies
        - Bottles vs enemies
        - (Optional later) Character vs collectables
      - Applies results (damage, knockback, remove entities, etc.)
    ------------------------------------------------------------------------ */

    this.collisionSystem.update(dt);
  }

  /* ==========================================================================
    Draw
    - Called every frame after update()
    - Renders entities in a defined order, using camera offset for scrolling
  ========================================================================== */

  draw(ctx) {
    /* ------------------------------------------------------------------------
      Player draw
      - The camera.x offset shifts the world to create scrolling
    ------------------------------------------------------------------------ */

    this.character.draw(ctx, this.camera.x);

    /* ------------------------------------------------------------------------
      Enemies draw
    ------------------------------------------------------------------------ */

    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.camera.x);
    }

    /* ------------------------------------------------------------------------
      Bottles draw
    ------------------------------------------------------------------------ */

    for (const bottle of this.bottles) {
      bottle.draw(ctx, this.camera.x);
    }

    /* ------------------------------------------------------------------------
      Collectables draw (optional later)
      - If you add draw support to collectables, you can render them here
      - Example:
      - for (const item of this.collectables) item.draw(ctx, this.camera.x);
    ------------------------------------------------------------------------ */
  }
}
